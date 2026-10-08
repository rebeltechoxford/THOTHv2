"""Source-backed geometry for the interactive three-dimensional observatory.

Angular coordinates locate catalog entries on a unit celestial sphere.  None of
the visual radii in this module are measurements of a star's size or distance.
"""
from __future__ import annotations

from collections import defaultdict
from functools import lru_cache
import hashlib
import json
import math
import time

import numpy as np

from .catalog import catalog_manifest
from .research import _native_engine


def _integer(value: int, name: str, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise ValueError(f"{name} must be an integer between {minimum} and {maximum}.")
    return value


def _finite(value: float, name: str, minimum: float, maximum: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{name} must be a finite number.") from error
    if not math.isfinite(number) or not minimum <= number <= maximum:
        raise ValueError(f"{name} must be finite and between {minimum} and {maximum}.")
    return number


def _number_or_none(value) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _directions(values) -> list[list[float] | None]:
    return [list(map(float, row)) if all(math.isfinite(float(value)) for value in row) else None
            for row in values]


def _counterfactual_predictions(family: dict) -> list[dict]:
    """Predict unmeasured colors under the selected conditional Planck family.

    Work in logarithms so unsupported extremes become explicit missing fluxes
    while representable predicted magnitude changes remain usable.
    """
    hc_over_k_um = (6.62607015e-34 * 299792458.0 / 1.380649e-23) * 1e6

    def log_expm1(value: float) -> float:
        return value + math.log1p(-math.exp(-value)) if value > 50 else math.log(math.expm1(value))

    predictions = []
    for label, wavelength in (("V", 0.55), ("I", 0.806), ("K", 2.2)):
        scale = hc_over_k_um / wavelength
        baseline = log_expm1(scale / family["reference_temperature_k"])
        fluxes, magnitudes = [], []
        for radius, temperature in zip(family["radii_relative"], family["temperatures_k"]):
            log_flux = 2 * math.log(radius) + baseline - log_expm1(scale / temperature)
            # A null flux describes floating-point range failure, not no light.
            flux = math.exp(log_flux) if -700 <= log_flux <= 700 else None
            delta_mag = -2.5 / math.log(10) * log_flux
            fluxes.append(flux)
            magnitudes.append(delta_mag if math.isfinite(delta_mag) else None)
        predictions.append({"wavelength_um": wavelength, "label": label,
                            "relative_fluxes": fluxes, "delta_magnitudes": magnitudes,
                            "kind": "unmeasured monochromatic proxy prediction",
                            "normalization": "Relative to the assumed reference R0,T0 at this wavelength; no calibrated color zero point."})
    return predictions


def prepare_space_catalog(stars: list[dict], *, longitude_bins: int = 72,
                          latitude_bins: int = 36, threads: int = 1) -> dict:
    """Project every supplied catalog row, including entries without coordinates.

    Catalog/region groups are survey labels. Their centers are spherical means
    of measured directions, rather than physical centers of bound clusters.
    """
    started = time.perf_counter()
    longitude_bins = _integer(longitude_bins, "longitude_bins", 4, 360)
    latitude_bins = _integer(latitude_bins, "latitude_bins", 2, 180)
    threads = _integer(threads, "threads", 0, 256)
    if not isinstance(stars, list) or len(stars) > 250_000:
        raise ValueError("Provide a list containing at most 250,000 catalog entries.")
    compact, ras, decs, periods = [], [], [], []
    ids = set()
    for row in stars:
        if not isinstance(row, dict) or not isinstance(row.get("id"), str) or not row["id"]:
            raise ValueError("Every catalog entry needs a nonempty identifier.")
        if row["id"] in ids:
            raise ValueError("Catalog entry identifiers must be distinct; cross-catalog IDs stay separate.")
        ids.add(row["id"])
        ra, dec = _number_or_none(row.get("ra_deg")), _number_or_none(row.get("dec_deg"))
        valid = ra is not None and dec is not None and 0 <= ra < 360 and -90 <= dec <= 90
        ras.append(ra if valid else float("nan"))
        decs.append(dec if valid else float("nan"))
        period = _number_or_none(row.get("period_days"))
        period = period if period is not None and period > 0 else None
        periods.append(period if period is not None else float("nan"))
        compact.append({"id": row["id"], "name": str(row.get("name") or row["id"]),
                        "aliases": [alias for alias in row.get("aliases", []) if isinstance(alias, str)],
                        "catalog": str(row.get("catalog") or "Unspecified catalog"),
                        "region": str(row.get("region") or "Unspecified region"),
                        "period_days": period,
                        "mean_i_mag": _number_or_none(row.get("mean_i_mag")),
                        "amplitude_i_mag": _number_or_none(row.get("amplitude_i_mag")),
                        "ra_deg": ra if valid else None, "dec_deg": dec if valid else None})
    native = _native_engine()
    projection = dict(native.celestial_geometry(ras, decs, periods,
                                                longitude_bins, latitude_bins, threads))
    positions = _directions(projection["positions"])
    galactic_positions = _directions(projection["galactic_positions"])
    grouped = defaultdict(list)
    for index, row in enumerate(compact):
        grouped[(row["catalog"], row["region"])].append(index)
    groups = []
    for (catalog, region), indices in sorted(grouped.items()):
        directions = [positions[index] for index in indices if positions[index] is not None]
        centroid = None
        if directions:
            mean = [math.fsum(row[axis] for row in directions) / len(directions) for axis in range(3)]
            norm = math.sqrt(math.fsum(value * value for value in mean))
            if norm > 1e-12:
                centroid = [value / norm for value in mean]
        groups.append({"name": region, "catalog": catalog, "region": region,
                       "count": len(indices), "mapped_count": len(directions),
                       "centroid": centroid,
                       "kind": "catalog/region survey group"})
    mapped = sum(position is not None for position in positions)
    manifest = catalog_manifest()
    digest = hashlib.sha256(json.dumps(compact, separators=(",", ":"),
                                       allow_nan=False).encode()).hexdigest()
    return {
        "stars": compact, "positions": positions, "galactic_positions": galactic_positions,
        "density_cells": list(projection["density_cells"]), "groups": groups,
        "counts": {"catalog_entries": len(compact), "mapped_entries": mapped,
                   "missing_coordinates": len(compact) - mapped,
                   "period_known": sum(row["period_days"] is not None for row in compact),
                   "survey_groups": len(groups)},
        "geometry": {"kind": "unit celestial sphere", "distance_unit": None,
                     "radial_coordinate": "All mapped entries have radius 1; no distances are supplied.",
                     "equatorial_frame": "catalog J2000 equatorial directions",
                     "galactic_frame": "ICRS-to-Galactic fixed rotation applied to J2000 directions",
                     "world_axes": "x=cos(dec)*cos(ra), y=sin(dec), z=-cos(dec)*sin(ra)",
                     "density_frame": "equatorial RA/declination", "longitude_bins": longitude_bins,
                     "latitude_bins": latitude_bins,
                     "density_units": "catalog entries per steradian; bin areas account for latitude"},
        "provenance": {"catalog_snapshot_sha256": manifest.get("snapshot_sha256"),
                       "catalog_retrieved_utc": manifest.get("retrieved_utc"),
                       "selected_entries_sha256": digest,
                       "coordinate_system": manifest.get("coordinate_system", "J2000"),
                       "sources": [{"catalog": source["catalog"], "url": source["url"]}
                                   for source in manifest.get("sources", [])]},
        "computation": {"engine": "C++17 celestial projection and solid-angle density grid",
                        "native_seconds": projection["native_seconds"],
                        "pipeline_seconds": time.perf_counter() - started,
                        "coordinate_evaluations": projection["observation_evaluations"],
                        "threads_used": projection["threads_used"],
                        "density_cells": longitude_bins * latitude_bins},
        "caveats": [
            "This is an angular map on a unit sphere; depth, distance, mass, radius and luminosity are unknown in this snapshot.",
            "Catalog entries from different surveys remain distinct and may refer to the same physical star.",
            "Survey/region groups and their spherical centroids are not identified gravitationally bound stellar clusters.",
            "Catalog J2000 coordinates are used as ICRS directions for the fixed Galactic rotation; a detailed FK5/ICRS frame-bias correction is not applied.",
            "Density includes survey coverage and selection effects; it is not an unbiased physical space density.",
            "Entries with absent or invalid coordinates stay in the result with null positions and are excluded from the plotted density.",
        ],
    }


@lru_cache(maxsize=32)
def _fit_cached(rows: tuple[tuple[float, float, float], ...], min_period: float,
                max_period: float) -> dict:
    """Only immutable measurements and numerical controls identify a fit."""
    native = _native_engine()
    started = time.perf_counter()
    result = dict(native.periodogram([row[0] for row in rows], [row[1] for row in rows],
                                     [row[2] for row in rows], min_period, max_period,
                                     256, 2, 1))
    coefficients = result["coefficients"]
    magnitudes = []
    for index in range(301):
        phase = index / 300
        magnitude = coefficients[0]
        for harmonic in (1, 2):
            angle = 2 * math.pi * harmonic * phase
            magnitude += coefficients[2 * harmonic - 1] * math.sin(angle)
            magnitude += coefficients[2 * harmonic] * math.cos(angle)
        magnitudes.append(magnitude)
    # The first/last samples repeat the same phase, so only 300 distinct phases
    # define the normalization of the model magnitude cycle.
    mean = math.fsum(magnitudes[:-1]) / 300
    phase_model = []
    for index, magnitude in enumerate(magnitudes):
        try:
            flux = 10 ** (-0.4 * (magnitude - mean))
        except OverflowError as error:
            raise ValueError("Fitted magnitude amplitudes exceed the supported finite flux range.") from error
        if not math.isfinite(flux):
            raise ValueError("Fitted magnitude amplitudes exceed the supported finite flux range.")
        phase_model.append({"phase": index / 300, "magnitude": magnitude, "relative_flux": flux})
    return {"period_days": float(result["period_days"]),
            "coefficients": list(map(float, coefficients)),
            "reference_epoch_jd": float(result["reference_epoch_jd"]),
            "reduced_chi2": float(result["reduced_chi2"]),
            "n_observations": len(rows), "amplitude_mag": float(result["amplitude_mag"]),
            "harmonics": 2, "frequency_samples": 256,
            "min_period_days": min_period, "max_period_days": max_period,
            "mean_model_magnitude": mean, "phase_model": phase_model,
            "native_seconds": time.perf_counter() - started}


def _photometry(star: dict, curve: dict | None) -> tuple[dict | None, dict, str, str | None]:
    if curve is None or not curve.get("observations"):
        return None, {"source_url": star.get("source_url"), "time_system": None,
                      "input_observations": 0, "used_observations": 0}, "unavailable", None
    observations = curve["observations"]
    bands = {str(row.get("band", curve.get("band", "unspecified"))) for row in observations}
    if len(bands) != 1:
        raise ValueError("A stellar brightness model requires one photometric band.")
    rows = []
    for row in observations:
        try:
            values = tuple(float(row[key]) for key in ("time_jd", "magnitude", "error_mag"))
        except (KeyError, ValueError, TypeError) as error:
            raise ValueError("Every observation requires numeric time_jd, magnitude and error_mag.") from error
        if not all(math.isfinite(value) for value in values) or values[2] <= 0:
            raise ValueError("Photometry must be finite with positive magnitude errors.")
        rows.append(values)
    if len(rows) > 200_000:
        raise ValueError("At most 200,000 observations per stellar model are supported.")
    rows.sort(key=lambda row: row[0])
    count = len(rows)
    digest = hashlib.sha256(json.dumps(rows, separators=(",", ":"), allow_nan=False).encode()).hexdigest()
    if count > 3000:
        rows = [rows[round(index * (count - 1) / 2999)] for index in range(3000)]
    provenance = {"source_url": curve.get("source_url"), "time_system": curve.get("time_system"),
                  "data_source": curve.get("data_source"), "band": bands.pop(),
                  "input_sha256": digest, "input_observations": count,
                  "used_observations": len(rows),
                  "observation_span_days": rows[-1][0] - rows[0][0],
                  "subsampling": "Evenly spaced sorted row indices including both endpoints" if count > 3000 else "All observations"}
    if len(rows) < 12 or len({row[0] for row in rows}) < 6 or rows[-1][0] <= rows[0][0]:
        return None, provenance, "unidentifiable", "Insufficient independent observations to identify a two-harmonic period model."
    period = _number_or_none(star.get("period_days"))
    if period is not None and period > 0:
        minimum, maximum = max(0.5, period * 0.7), min(100000.0, period * 1.3)
    else:
        minimum, maximum = 50.0, 1000.0
    if maximum <= minimum:
        return None, provenance, "unidentifiable", "The catalog period lies outside the supported fit bounds."
    try:
        before = _fit_cached.cache_info()
        fit = _fit_cached(tuple(rows), minimum, maximum)
        provenance["fit_reused"] = _fit_cached.cache_info().hits > before.hits
    except ValueError as error:
        return None, provenance, "unidentifiable", str(error)
    return fit, provenance, "available", None


def build_star_model(star: dict, curve: dict | None = None, *, phase: float = 0.0,
                     resolution: int = 48, displacement: float = 0.0,
                     contrast: float = 0.0, radius_fraction: float = 0.5,
                     reference_temperature_k: float = 3000,
                     wavelength_um: float | None = None) -> dict:
    """Reconstruct a conditional radius/temperature family from measured flux.

    One band supplies one brightness constraint for radius and temperature. The
    radius/temperature split and reference temperature are explicit assumptions,
    so many different three-dimensional models reconstruct the same photometry.
    """
    started = time.perf_counter()
    if not isinstance(star, dict) or not star.get("id"):
        raise ValueError("A catalog star with an identifier is required.")
    phase = _finite(phase, "phase", -1_000_000, 1_000_000) % 1.0
    resolution = _integer(resolution, "resolution", 8, 128)
    displacement = _finite(displacement, "displacement", -0.5, 0.5)
    contrast = _finite(contrast, "contrast", 0, 0.25)
    radius_fraction = _finite(radius_fraction, "radius_fraction", 0, 1)
    reference_temperature_k = _finite(reference_temperature_k, "reference_temperature_k", 500, 50000)
    if wavelength_um is not None:
        wavelength_um = _finite(wavelength_um, "wavelength_um", 0.1, 1000)
    native = _native_engine()
    mesh = dict(native.stellar_surface(phase, displacement, resolution, resolution * 2, contrast))
    fit, provenance, status, problem = _photometry(star, curve)
    phase_model = [dict(row) for row in fit["phase_model"]] if fit else []
    flux = None
    radiative_family = None
    selected_model = None
    radiative_message = None
    if fit:
        magnitude = fit["coefficients"][0]
        for harmonic in (1, 2):
            angle = 2 * math.pi * harmonic * phase
            magnitude += fit["coefficients"][2 * harmonic - 1] * math.sin(angle)
            magnitude += fit["coefficients"][2 * harmonic] * math.cos(angle)
        flux = 10 ** (-0.4 * (magnitude - fit["mean_model_magnitude"]))
        if not math.isfinite(flux):
            raise ValueError("Fitted magnitude amplitudes exceed the supported finite flux range.")
        inferred_wavelength = {"I": 0.806, "V": 0.55}.get(str(provenance.get("band", "")).upper())
        selected_wavelength = wavelength_um if wavelength_um is not None else inferred_wavelength
        if selected_wavelength is None:
            radiative_message = "This passband has no assumed representative wavelength; supply wavelength_um to explore a monochromatic model family."
        else:
            family = dict(native.radiative_phase_family(
                [sample["relative_flux"] for sample in phase_model] + [flux],
                selected_wavelength, reference_temperature_k, radius_fraction))
            selected_model = {"radius_relative": float(family["radii_relative"][-1]),
                              "temperature_k": float(family["temperatures_k"][-1]),
                              "reconstructed_flux": float(family["reconstructed_fluxes"][-1]),
                              "observed_model_flux": flux,
                              "flux_residual": float(family["residuals"][-1]),
                              "phase": phase}
            radiative_family = {key: list(value[:-1]) if key in {
                "radii_relative", "temperatures_k", "reconstructed_fluxes", "residuals"}
                else value for key, value in family.items()}
            radiative_family.update({"phases": [sample["phase"] for sample in phase_model],
                                    "relative_fluxes": [sample["relative_flux"] for sample in phase_model],
                                    "wavelength_source": "user assumption" if wavelength_um is not None else "representative I/V-band wavelength approximation",
                                    "identifiability": "Single-band flux does not uniquely determine radius and temperature.",
                                    "physical_radius": None,
                                    "reference_radius": "Unknown absolute radius; normalized R0=1."})
            radiative_family["counterfactual_predictions"] = _counterfactual_predictions(radiative_family)
            radiative_family["prediction_caveat"] = "V/I/K monochromatic proxy predictions are not new measurements or filter-integrated colors. Additional calibrated bands could test and distinguish the conditional families."
            for index, sample in enumerate(phase_model):
                sample["radius_relative"] = float(family["radii_relative"][index])
                sample["temperature_k"] = float(family["temperatures_k"][index])
            # Uniform scaling preserves the analytically computed normals.
            # The default smooth sphere is the selected conditional R/R0.
            radius = selected_model["radius_relative"]
            mesh["positions"] = [float(value) * radius for value in mesh["positions"]]
            mesh["radii"] = [float(value) * radius for value in mesh["radii"]]
            mesh["minimum_radius"] *= radius
            mesh["maximum_radius"] *= radius
            mesh["radius_scale_relative"] = radius
            mesh["model_kind"] = "single-band constrained normalized radius envelope; assumed radius/temperature split"
    return {"star_id": star["id"], "name": str(star.get("name") or star["id"]),
            "mesh": mesh, "selected_phase": phase, "displacement": displacement,
            "contrast": contrast, "resolution": resolution,
            "radiative_family": radiative_family, "selected_model": selected_model,
            "radiative_message": radiative_message,
            "fit": {key: value for key, value in fit.items() if key != "phase_model"} if fit else None,
            "phase_model": phase_model, "relative_flux_at_phase": flux,
            "photometry_status": status, "photometry_message": problem,
            "catalog_period_days": _number_or_none(star.get("period_days")),
            "provenance": {"catalog": star.get("catalog"), "catalog_source_url": star.get("source_url"),
                           "photometry": provenance},
            "geometry": {"kind": "photometry-constrained conditional normalized radius envelope" if radiative_family else "illustrative normalized stellar surface", "radius_unit": "relative to an unknown reference radius R0=1",
                         "distance": None, "physical_radius": None, "mass": None, "temperature": None,
                         "radius_fraction": radius_fraction,
                         "reference_temperature_k": reference_temperature_k,
                         "surface_shape": "Default spherical geometry; angular contrast and displacement are optional unsupported exploratory controls.",
                         "envelope_evidence": "Conditional relative radius follows the empirical fitted flux under an explicit monochromatic blackbody assumption." if radiative_family else "No measured radius constraint is available.",
                         "brightness_equation": "relative_flux = 10^(-0.4*(model_magnitude - mean_model_magnitude))",
                         "brightness_normalization": "Flux at the mean fitted magnitude is 1; this is not bolometric luminosity.",
                         "phase_reference": "Fitted reference_epoch_jd is phase zero; phase zero need not be maximum light."},
            "computation": {"engine": "C++17 indexed surface mesh and weighted Fourier brightness fit",
                            "mesh_native_seconds": mesh["native_seconds"],
                            "fit_native_seconds": fit["native_seconds"] if fit else None,
                            "radiative_native_seconds": radiative_family["native_seconds"] if radiative_family else None,
                            "pipeline_seconds": time.perf_counter() - started,
                            "surface_evaluations": mesh["surface_evaluations"],
                            "fit_cache": "Immutable observations and period bounds identify a reusable fit."},
            "caveats": [
                "The radius envelope is a conditional single-band reconstruction, not a resolved image or hydrodynamic model of this star.",
                "One photometric band cannot uniquely determine radius and temperature: radius_fraction and the reference temperature select an explicit model family.",
                "The monochromatic blackbody approximation uses a representative wavelength rather than full filter integration; Mira molecular spectra, dust, extinction changes and shocks can invalidate it.",
                "Absolute radius and temperature are not measured here; reference temperature is assumed and radius is normalized to an unknown R0.",
                "Counterfactual V/I/K monochromatic curves are unmeasured model predictions; dust, spectra, extinction and filter throughput can change their relation to actual multiband observations.",
                "Optional angular contrast and displacement are exploratory geometry controls without observational support; the default smooth sphere preserves the selected conditional radius.",
                "When measured photometry is available, the displayed brightness follows a fitted band-specific magnitude curve and empirical Fourier period search.",
                "Missing photometry is explicit: no measured brightness curve, temperature or hidden backside is invented.",
                "A catalog-centered fit searches only 0.7 to 1.3 times the published period; broader alternatives remain available in the research and transform labs.",
            ]}


def build_transform_surface(report: dict, kind: str = "chirp") -> dict:
    """Lift an existing computed transform grid into an indexed C++ mesh."""
    if kind not in {"chirp", "localized"}:
        raise ValueError("Transform surface kind must be chirp or localized.")
    transforms = report.get("transforms", report)
    grid = transforms.get(kind)
    if not isinstance(grid, dict):
        raise ValueError(f"The report has no {kind} grid.")
    x = grid.get("frequencies")
    axis_name = "frequency_derivatives" if kind == "chirp" else "time_centers_jd"
    y = grid.get(axis_name)
    powers = grid.get("powers")
    if not isinstance(x, list) or not isinstance(y, list) or len(x) < 2 or len(y) < 2:
        raise ValueError("A transform surface needs at least two samples on both axes.")
    if len(x) * len(y) > 200_000:
        raise ValueError("Transform surfaces support at most 200,000 grid cells.")
    if not all(_number_or_none(value) is not None for value in x + y):
        raise ValueError("Transform axes must be finite numbers.")
    if not isinstance(powers, list) or len(powers) != len(y) or any(not isinstance(row, list) or len(row) != len(x) for row in powers):
        raise ValueError("Transform power rows must match both axis dimensions.")
    values = np.array([[float(value) if _number_or_none(value) is not None else np.nan for value in row]
                       for row in powers])
    finite = values[np.isfinite(values)]
    if not len(finite):
        raise ValueError("A transform surface needs at least one finite computed power.")
    # Horizontal geometry is a normalized grid; original values remain alongside
    # the mesh for axis ticks, hover values and evidence exports.
    coordinates_x = np.linspace(-1, 1, len(x))
    coordinates_y = np.linspace(-1, 1, len(y))
    mesh = dict(_native_engine().surface_from_grid(coordinates_x, coordinates_y, values, 1.0))
    missing_indices = [int(index) for index in np.flatnonzero(~np.isfinite(values.reshape(-1)))]
    # GPU position buffers require finite coordinates, even for unused vertices.
    # Placeholder heights are never indexed by any triangle. The actual power
    # remains null below, and missing indices are explicit alongside the buffer.
    mesh["positions"] = [float(value) if math.isfinite(float(value)) else 0.0
                         for value in mesh["positions"]]
    mesh["missing_vertex_indices"] = missing_indices
    mesh["buffer_placeholder_semantics"] = "Unused missing vertices have finite storage placeholders; no triangle references them and no zero-power measurement is implied."
    return {"kind": kind, "mesh": mesh,
            "axes": {"x": {"name": "frequency", "unit": "cycles/day", "values": x},
                     "z": {"name": "frequency derivative" if kind == "chirp" else "time center", "unit": "cycles/day²" if kind == "chirp" else report.get("provenance", {}).get("time_system", "JD"), "values": y},
                     "height": {"name": "relative chi-square improvement", "unit": "dimensionless", "min": float(finite.min()), "max": float(finite.max())}},
            "powers": [[float(value) if math.isfinite(value) else None for value in row] for row in values],
            "geometry": {"horizontal_axes": "Normalized grid coordinates in [-1,1]", "height": "Original computed power", "missing_cells": "Triangles touching a missing vertex are omitted."},
            "provenance": report.get("provenance", {}),
            "caveats": ["Transform height represents a diagnostic statistic, not probability, physical distance or stellar surface height.",
                        "Missing and rank-deficient cells remain holes; no missing power is replaced by zero."]}
