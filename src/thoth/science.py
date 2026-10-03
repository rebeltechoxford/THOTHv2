"""Validated inputs and interpretation around the native numerical kernel."""
from __future__ import annotations

import csv
import math
from pathlib import Path
from typing import Any


def native_status() -> dict:
    try:
        from . import _native
        info = _native.backend_info()
        return {"native_available": True, "native_backend": info}
    except ImportError:
        return {"native_available": False, "native_backend": None}


def read_observations_csv(path: Path) -> dict:
    """CSV uses explicit time_jd, magnitude, error_mag and optional band."""
    observations = []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"time_jd", "magnitude", "error_mag"}
        if not required.issubset(reader.fieldnames or []):
            raise ValueError("CSV requires time_jd, magnitude, error_mag headers.")
        for line, row in enumerate(reader, 2):
            try:
                obs = {key: float(row[key]) for key in required}
                if not all(math.isfinite(v) for v in obs.values()) or obs["error_mag"] <= 0:
                    raise ValueError("non-finite value or nonpositive uncertainty")
                obs["band"] = (row.get("band") or "unspecified").strip()
                observations.append(obs)
            except (ValueError, TypeError) as error:
                raise ValueError(f"Invalid observation on CSV line {line}: {error}") from error
            if len(observations) > 200_000:
                raise ValueError("At most 200,000 observations per analysis are supported.")
    return {"observations": observations, "source_url": str(path.resolve()),
            "time_system": "User-supplied JD (verify your time standard)", "band": "user supplied"}


def analyze_lightcurve(curve: dict, *, min_period: float = 50, max_period: float = 1000,
                       samples: int = 1500, harmonics: int = 2, threads: int = 1,
                       band: str | None = None) -> dict[str, Any]:
    try:
        from . import _native
    except ImportError as error:
        raise RuntimeError("C++ engine is not built. Install the project with a C++17 compiler: pip install -e .") from error
    observations = curve["observations"]
    bands = sorted({o.get("band", curve.get("band", "unspecified")) for o in observations})
    if band is None:
        if len(bands) != 1:
            raise ValueError("Choose a single band; magnitudes in different passbands cannot be fit together.")
        band = bands[0]
    selected = [o for o in observations if o.get("band", curve.get("band", "unspecified")) == band]
    if not selected:
        raise ValueError(f"No observations in band {band!r}.")
    # All observations go to C++; only browser drawing may reduce plotted points.
    result = dict(_native.periodogram(
        [o["time_jd"] for o in selected], [o["magnitude"] for o in selected],
        [o["error_mag"] for o in selected], min_period, max_period, samples, harmonics, threads))
    period, coeff = result["period_days"], result["coefficients"]
    result["phase_model"] = []
    for i in range(301):
        phase = i / 300
        value = coeff[0]
        for harmonic in range(1, harmonics + 1):
            angle = 2 * math.pi * harmonic * phase
            value += coeff[2 * harmonic - 1] * math.sin(angle) + coeff[2 * harmonic] * math.cos(angle)
        result["phase_model"].append({"phase": phase, "magnitude": value})
    span = max(o["time_jd"] for o in selected) - min(o["time_jd"] for o in selected)
    warnings = [
        "Empirical periodic Fourier fit, not a hydrodynamic stellar model.",
        "Periodogram power is relative chi-square improvement, not a probability or false-alarm significance.",
        "Mira cycles evolve; aliases, cadence, outliers, and a finite frequency grid can change the preferred period.",
    ]
    if span < 2 * period:
        warnings.append("Fewer than two fitted cycles are observed; the period is poorly constrained.")
    if result["reduced_chi2"] > 5:
        warnings.append("Residual variability greatly exceeds the reported photometric errors; the periodic model does not explain all observed behavior.")
    finite_powers = [power for power in result["powers"] if math.isfinite(power)]
    if finite_powers and max(finite_powers) < 0.1:
        warnings.append("The periodic fit explains little of the weighted variability.")
    result["powers"] = [power if math.isfinite(power) else None for power in result["powers"]]
    result.update({"n_observations": len(selected), "band": band,
                   "time_system": curve.get("time_system"), "source_url": curve.get("source_url"),
                   "observation_span_days": span, "cycles_observed": span / period,
                   "harmonics": harmonics, "warnings": warnings,
                   "frequency_step_per_day": (1 / min_period - 1 / max_period) / (samples - 1)})
    return result
