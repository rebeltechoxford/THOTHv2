"""Evidence-generating research workflows backed by the native C++ extension.

The catalogue is an index. These functions compute from photometry and expose
alternative explanations, out-of-sample failures, sampling ambiguity, and useful
conditional observations. They cannot turn missing observations into knowledge.
"""
from __future__ import annotations

import hashlib
import json
import math
import time
from typing import Callable, Any

Progress = Callable[[dict[str, Any]], None]


def _native_engine():
    try:
        from . import _native
    except ImportError as error:
        raise RuntimeError("Build the C++17 extension with pip install -e . before running research.") from error
    return _native


def _integer(value: int, name: str, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise ValueError(f"{name} must be an integer between {minimum} and {maximum}.")
    return value


def _metrics(observations: list[dict], predictions: list[float]) -> dict:
    residuals = [o["magnitude"] - p for o, p in zip(observations, predictions)]
    if not all(math.isfinite(r) for r in residuals):
        raise ValueError("Residual metrics exceed the supported finite numeric scale.")
    minimum_error = min(o["error_mag"] for o in observations)
    weights = [(minimum_error / o["error_mag"]) ** 2 for o in observations]
    scale = max(abs(r) for r in residuals)
    normalized = [r / scale for r in residuals] if scale else [0.0] * len(residuals)
    # Squaring a finite 1e180 residual would overflow even though its RMS is
    # representable. Normalize before squaring, then restore the magnitude scale.
    rmse = scale * math.sqrt(math.fsum(r * r for r in normalized) / len(residuals))
    weighted_rmse = scale * math.sqrt(math.fsum(w * r * r for w, r in zip(weights, normalized)) / math.fsum(weights))
    standardized = [r / o["error_mag"] for r, o in zip(residuals, observations)]
    if not all(math.isfinite(r) for r in standardized):
        raise ValueError("Chi-square exceeds the supported finite numeric scale.")
    chi_scale = max(abs(r) for r in standardized)
    norm = chi_scale * math.sqrt(math.fsum((r / chi_scale) ** 2 for r in standardized)) if chi_scale else 0.0
    chi2 = norm * norm
    if not all(math.isfinite(v) for v in (rmse, weighted_rmse, chi2)):
        raise ValueError("Residual metrics exceed the supported finite numeric scale.")
    return {"rmse_mag": rmse, "weighted_rmse_mag": weighted_rmse, "chi2": chi2}


def investigate_lightcurve(curve: dict, min_period: float, max_period: float,
                          samples: int = 800, threads: int = 1,
                          observations_limit: int = 3000, *, band: str | None = None,
                          progress: Progress | None = None) -> dict:
    """Compare models on a grouped chronological split targeting 80/20, then investigate all data.

    The holdout chooses harmonic order: it is a model-selection set rather than a
    final untouched test set. Alternative periods are selected on all data and
    their reported holdout residuals are diagnostic, not independent validation.
    """
    native = _native_engine()
    started = time.perf_counter()
    native_seconds = 0.0
    work = 0
    scans = 0
    samples = _integer(samples, "samples", 16, 3000)
    threads = _integer(threads, "threads", 0, 256)
    observations_limit = _integer(observations_limit, "observations_limit", 30, 3000)
    try:
        min_period, max_period = float(min_period), float(max_period)
    except (ValueError, TypeError) as error:
        raise ValueError("Periods must be finite positive numbers.") from error
    if not all(math.isfinite(v) for v in (min_period, max_period)) or not 0.5 <= min_period < max_period <= 100000:
        raise ValueError("Use 0.5 <= min_period < max_period <= 100000 days.")

    def update(stage: str, percent: int, detail: str) -> None:
        if progress:
            progress({"stage": stage, "percent": percent, "detail": detail})

    update("prepare", 2, "Validating measurements and reserving later timestamp groups for model selection, targeting an 80/20 split.")
    original = curve.get("observations", [])
    if not isinstance(original, list) or not original:
        raise ValueError("A nonempty observed light curve is required.")
    bands = sorted({o.get("band", curve.get("band", "unspecified")) for o in original})
    if band is None:
        if len(bands) != 1:
            raise ValueError("Choose a single band; different photometric passbands cannot be fit together.")
        band = bands[0]
    selected = []
    for row in original:
        if row.get("band", curve.get("band", "unspecified")) != band:
            continue
        try:
            observation = {key: float(row[key]) for key in ("time_jd", "magnitude", "error_mag")}
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("Every observation requires numeric time_jd, magnitude, and error_mag.") from error
        if not all(math.isfinite(v) for v in observation.values()) or observation["error_mag"] <= 0:
            raise ValueError("Measurements must be finite and uncertainties strictly positive.")
        selected.append(observation)
    if len(selected) < 30:
        raise ValueError("At least 30 single-band observations are required for chronological research.")
    selected.sort(key=lambda o: o["time_jd"])
    original_band_count = len(selected)
    digest = hashlib.sha256(json.dumps(selected, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    if len(selected) > observations_limit:
        # Deterministic evenly spaced observation indices preserve the full time baseline.
        selected = [selected[round(i * (len(selected) - 1) / (observations_limit - 1))]
                    for i in range(observations_limit)]
    count = len(selected)
    # A timestamp belongs wholly to one partition: otherwise a holdout can
    # contain the same epoch the training fit has already observed. Choose the
    # available strict time boundary nearest the requested 80% training size.
    boundaries = [i for i in range(12, count - 6 + 1)
                  if selected[i - 1]["time_jd"] < selected[i]["time_jd"]]
    if not boundaries:
        raise ValueError("No chronological timestamp-group boundary leaves at least 12 training and 6 holdout observations.")
    train_count = min(boundaries, key=lambda i: (abs(i - count * 0.8), i))
    training, holdout = selected[:train_count], selected[train_count:]
    span = selected[-1]["time_jd"] - selected[0]["time_jd"]
    if span <= 0 or training[-1]["time_jd"] <= training[0]["time_jd"]:
        raise ValueError("Observations need a positive time baseline in both the dataset and training partition.")
    # Three training model scans plus full-data and early/late scans can use at
    # most harmonic order three. Bound the aggregate work before computation.
    estimated_work = (6 * train_count + 6 * count) * samples
    if estimated_work > 48000000:
        raise ValueError("Research exceeds the 48 million observation-frequency-harmonic budget. Reduce samples or observations_limit.")

    def call(function, *args):
        nonlocal native_seconds
        clock = time.perf_counter()
        result = function(*args)
        native_seconds += time.perf_counter() - clock
        return result

    def scan(rows: list[dict], harmonics: int) -> dict:
        nonlocal work, scans
        work += len(rows) * samples * harmonics
        scans += 1
        return dict(call(native.periodogram, [o["time_jd"] for o in rows],
                         [o["magnitude"] for o in rows], [o["error_mag"] for o in rows],
                         min_period, max_period, samples, harmonics, threads))

    def predict(model: dict, rows: list[dict]) -> list[float]:
        return call(native.evaluate, [o["time_jd"] for o in rows], model["period_days"],
                    model["coefficients"], model["reference_epoch_jd"])

    models = []
    training_fits = []
    for order in (1, 2, 3):
        update("model_comparison", 8 + order * 12, f"C++ weighted frequency search for {order} Fourier harmonics; evaluating unseen later measurements.")
        fit = scan(training, order)
        training_fits.append(fit)
        evaluation = _metrics(holdout, predict(fit, holdout))
        k = 2 * order + 2  # Fourier coefficients plus one selected frequency.
        criteria = [fit["chi2"] + 2 * k, fit["chi2"] + k * math.log(train_count)]
        if not all(math.isfinite(value) for value in criteria):
            raise ValueError("Information criteria exceed the supported finite numeric scale.")
        models.append({"harmonics": order, "period_days": fit["period_days"],
                       "training_chi2": fit["chi2"], "training_reduced_chi2": fit["chi2"] / (train_count - k),
                       "holdout_rmse_mag": evaluation["rmse_mag"],
                       "holdout_weighted_rmse_mag": evaluation["weighted_rmse_mag"],
                       "holdout_chi2": evaluation["chi2"], "effective_parameters": k,
                       "aic": criteria[0], "bic": criteria[1],
                       "coefficients": fit["coefficients"], "reference_epoch_jd": fit["reference_epoch_jd"],
                       "threads_used": fit["threads_used"]})
    for model in models:
        model["delta_bic"] = model["bic"] - min(row["bic"] for row in models)
        model["delta_aic"] = model["aic"] - min(row["aic"] for row in models)
    selected_model = min(models, key=lambda m: (m["holdout_weighted_rmse_mag"], m["harmonics"]))
    selected_fit = training_fits[selected_model["harmonics"] - 1]
    selected_predictions = predict(selected_fit, selected)
    residuals = [{"time_jd": row["time_jd"], "observed_magnitude": row["magnitude"],
                  "predicted_magnitude": predicted, "residual_mag": row["magnitude"] - predicted,
                  "error_mag": row["error_mag"], "partition": "training" if i < train_count else "holdout"}
                 for i, (row, predicted) in enumerate(zip(selected, selected_predictions))]

    update("aliases", 50, "Searching the full light curve for separated alternative frequency peaks.")
    full_fit = scan(selected, selected_model["harmonics"])
    frequencies, powers = full_fit["frequencies"], full_fit["powers"]
    finite_indices = [i for i, p in enumerate(powers) if math.isfinite(p)]
    peak_indices = [i for i in finite_indices
                    if (i == 0 or not math.isfinite(powers[i - 1]) or powers[i] >= powers[i - 1])
                    and (i == len(powers) - 1 or not math.isfinite(powers[i + 1]) or powers[i] >= powers[i + 1])]
    peak_indices.sort(key=lambda i: powers[i], reverse=True)
    maximum_power = max(powers[i] for i in finite_indices)
    candidates = []
    resolution = 1 / span
    for index in peak_indices:
        if len(candidates) == 5:
            break
        if powers[index] < 0.35 * maximum_power:
            continue
        frequency = frequencies[index]
        if any(abs(frequency - 1 / row["period_days"]) < resolution for row in candidates):
            continue
        fit = dict(call(native.fit_frequency, [o["time_jd"] for o in selected],
                        [o["magnitude"] for o in selected], [o["error_mag"] for o in selected],
                        frequency, selected_model["harmonics"]))
        try:
            train_fit = dict(call(native.fit_frequency, [o["time_jd"] for o in training],
                                  [o["magnitude"] for o in training], [o["error_mag"] for o in training],
                                  frequency, selected_model["harmonics"]))
            evaluation = _metrics(holdout, predict(train_fit, holdout))
            candidate_rmse = evaluation["rmse_mag"]
        except ValueError:
            candidate_rmse = None
        candidates.append({"period_days": fit["period_days"], "frequency_per_day": frequency,
                           "power": powers[index], "chi2": fit["chi2"],
                           "holdout_rmse_mag": candidate_rmse,
                           "coefficients": fit["coefficients"], "reference_epoch_jd": fit["reference_epoch_jd"],
                           "harmonics": selected_model["harmonics"]})

    update("cadence", 62, "Computing the spectral window directly from the actual observation times.")
    window_max = max(2 * (1 / min_period - 1 / max_period), 2 / 365.25)
    window_frequencies = [i * window_max / (samples - 1) for i in range(samples)]
    spectral_window = dict(call(native.spectral_window, [o["time_jd"] for o in selected], window_frequencies, threads))
    spectral_window["definition"] = "|sum exp(2*pi*i*f*(t-t0))/N|^2; unweighted observation cadence"

    update("stability", 72, "Refitting the earlier and later halves independently; differences are evidence to inspect, not established period drift.")
    stability = []
    for label, rows in (("early", selected[:count // 2]), ("late", selected[count // 2:])):
        entry = {"label": label, "start_jd": rows[0]["time_jd"], "end_jd": rows[-1]["time_jd"],
                 "n_observations": len(rows)}
        try:
            fit = scan(rows, selected_model["harmonics"])
            entry.update({"period_days": fit["period_days"], "chi2": fit["chi2"], "status": "computed",
                          "cycles_observed": (rows[-1]["time_jd"] - rows[0]["time_jd"]) / fit["period_days"]})
        except ValueError as error:
            entry.update({"period_days": None, "status": "unidentifiable", "detail": str(error)})
        stability.append(entry)

    update("observation_planning", 88, "Ranking conditional observation times where competing fitted periods predict different magnitudes.")
    anchor = selected[-1]["time_jd"]
    planning_horizon = min(max_period * 1.5, 3000.0)
    future_rows = [{"time_jd": anchor + i * planning_horizon / 600} for i in range(1, 601)]
    conditional_predictions = [predict(candidate, future_rows) for candidate in candidates]
    plans = []
    if len(candidates) >= 2:
        scored = [(max(series[i] for series in conditional_predictions) - min(series[i] for series in conditional_predictions), i)
                  for i in range(600)]
        for spread, index in sorted(scored, reverse=True):
            offset = future_rows[index]["time_jd"] - anchor
            if any(abs(offset - p["days_after_last_observation"]) < min_period * 0.08 for p in plans):
                continue
            plans.append({"days_after_last_observation": offset, "time_jd": future_rows[index]["time_jd"],
                          "prediction_spread_mag": spread,
                          "predictions": [{"period_days": candidate["period_days"], "magnitude": predictions[index]}
                                          for candidate, predictions in zip(candidates, conditional_predictions)]})
            if len(plans) == 8:
                break
    caveats = [
        "Measured single-band photometry constrains empirical periodic hypotheses; it cannot resolve every unknown about a star.",
        "The later timestamp-group holdout (target 20% of observations) selects harmonic order. This is a model-selection holdout; a new untouched dataset is needed for final predictive validation.",
        "AIC/BIC use known Gaussian photometric errors and k=2*harmonics+2, counting the selected frequency. They omit the shared likelihood constant and do not fully account for searching many frequencies or correlated stellar variability.",
        "Separated periodogram peaks are competing hypotheses. Power is relative chi-square improvement, not a probability or detection significance.",
        "Alternative frequencies were selected on the full dataset, so their holdout RMSE is diagnostic and is not an independent validation score.",
        "The sampling window describes cadence; matching window structure suggests possible aliases but does not establish their cause.",
        "Early/late fitted-period differences can arise from sampling, noise, frequency resolution, or cycle evolution. No significance for period drift is claimed.",
        "Observation scores rank disagreement between fitted hypotheses only. They exclude visibility, telescope sensitivity, weather, and parameter uncertainty.",
        "Planning offsets are after the final observation in this dataset, which may be historical; they are not today's observing calendar or trusted ephemerides.",
    ]
    if not math.isclose(train_count / count, 0.8, abs_tol=1e-12):
        caveats.append(f"The nearest eligible timestamp-group boundary uses {train_count / count:.2%} for training and {len(holdout) / count:.2%} for holdout rather than exactly 80%/20%; every shared timestamp remains in one partition.")
    if original_band_count != count:
        caveats.append(f"The compute budget uses {count} evenly spaced observation indices out of {original_band_count}; changing that subset can change the evidence.")
    if span < 2 * full_fit["period_days"]:
        caveats.append("The dataset covers fewer than two preferred cycles; the period is weakly constrained.")
    if len(candidates) < 2:
        caveats.append("No second sufficiently strong, Rayleigh-separated grid peak was found; there is no multi-hypothesis observation plan at this search setting.")
    result = {"selected_model": dict(selected_model), "selection_criterion": "minimum chronological holdout weighted RMSE",
              "models": models, "residuals": residuals,
              "full_fit": {key: full_fit[key] for key in ("period_days", "coefficients", "reference_epoch_jd", "harmonics", "chi2", "threads_used")},
              "periodogram": {"frequencies": frequencies, "powers": [p if math.isfinite(p) else None for p in powers]},
              "spectral_window": spectral_window, "candidates": candidates,
              "stability": stability, "observation_plan": plans,
              "planning_anchor_jd": anchor, "planning_horizon_days": planning_horizon,
              "training_observations": train_count, "holdout_observations": len(holdout),
              "training_fraction": train_count / count, "holdout_fraction": len(holdout) / count,
              "requested_training_fraction": 0.8,
              "split_strategy": "chronological timestamp groups, eligible boundary nearest 80% training",
              "split_time_jd": holdout[0]["time_jd"],
              "provenance": {"source_url": curve.get("source_url"), "time_system": curve.get("time_system"),
                             "dataset_id": curve.get("dataset_id"), "dataset_name": curve.get("name"),
                             "data_source": curve.get("data_source", "catalogue_photometry"),
                             "source_sha256": curve.get("sha256"),
                             "band": band, "input_sha256": digest, "input_observations": original_band_count,
                             "used_observations": count, "observation_span_days": span,
                             "subsampling": "none" if count == original_band_count else "deterministic evenly spaced observation indices"},
              "computation": {"engine": "C++17 weighted Fourier least squares + sampling-window kernel",
                              "native_seconds": native_seconds, "total_seconds": time.perf_counter() - started,
                              "frequency_scans": scans, "trial_frequency_evaluations": scans * samples,
                              "observation_frequency_harmonic_evaluations": work, "samples_per_scan": samples,
                              "threads_requested": threads, "threads_used": full_fit["threads_used"],
                              "backend": dict(native.backend_info())}, "caveats": caveats}
    update("complete", 100, "Evidence bundle complete: models, residuals, aliases, cadence, stability, and conditional planning.")
    return result


def simulate_pulsation(period_days: float = 300, damping: float = 0.05,
                       drive: float = 0.15, nonlinearity: float = 0.2,
                       cycles: int = 6, steps_per_cycle: int = 200) -> dict:
    """Numerical sandbox for a dimensionless driven damped nonlinear oscillator.

    This pedagogical radial-displacement analogy is not calibrated to a Mira.
    Output displacement, velocity, and energy are dimensionless. Period_days
    maps the dimensionless natural timescale to display days only.
    """
    native = _native_engine()
    cycles = _integer(cycles, "cycles", 1, 40)
    steps_per_cycle = _integer(steps_per_cycle, "steps_per_cycle", 64, 2000)
    try:
        parameters = {"period_days": float(period_days), "damping": float(damping), "drive": float(drive),
                      "nonlinearity": float(nonlinearity), "cycles": cycles, "steps_per_cycle": steps_per_cycle}
    except (TypeError, ValueError) as error:
        raise ValueError("Oscillator controls must be numeric.") from error
    result = dict(native.simulate_oscillator(**parameters))
    result.update({"parameters": parameters, "model_kind": "dimensionless illustrative nonlinear oscillator",
                   "equation": "d2x/dtau2 + 2*zeta*dx/dtau + x + beta*x^3 = F*cos(tau); tau = 2*pi*t/period_days",
                   "energy_definition": "E = v^2/2 + x^2/2 + beta*x^4/4; E-E0 = drive_work - dissipated_energy",
                   "initial_conditions": {"displacement": 0.1, "velocity": 0},
                   "computation": {"engine": "C++17 fourth-order Runge-Kutta",
                                   "native_seconds": result["native_seconds"], "rk4_steps": result["rk4_steps"],
                                   "derivative_evaluations": result["derivative_evaluations"],
                                   "integration_runs": 2, "displayed_solution": "refined dt/2 solution"},
                   "caveats": ["This dimensionless Duffing oscillator illustrates nonlinear forcing, damping, phase trajectories, and numerical convergence; it is not a calibrated Mira stellar-pulsation model.",
                               "No radius, mass, luminosity, temperature, opacity, convection, or hydrodynamic stellar structure is inferred from these controls.",
                               "Period_days labels the natural timescale; the drive is fixed at that frequency. Nonlinearity can change the response period.",
                               "Displacement x, velocity dx/dtau, energy, and integrated work have normalized units and cannot be converted to stellar observables without a physical model.",
                               "The coarse-versus-refined difference and energy-balance error diagnose integration accuracy; they are not astrophysical uncertainty."]})
    return result
