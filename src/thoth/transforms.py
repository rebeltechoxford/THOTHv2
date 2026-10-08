"""Native time/frequency diagnostics and reproducible, distributed calibration.

The Monte Carlo draws are synthetic experiments at the measured timestamps;
they are never presented as additional observed stars or calibrated Mira physics.
"""
from __future__ import annotations

import argparse
from concurrent.futures import FIRST_COMPLETED, ProcessPoolExecutor, wait
import hashlib
import json
import math
import multiprocessing
import os
from pathlib import Path
import socket
import sys
import time
from typing import Callable, Iterable

import numpy as np

from .catalog import EXAMPLE_STAR_ID, load_lightcurve
from .research import _native_engine
from .science import read_observations_csv

Progress = Callable[[dict], None]
_PROCESS_CONTEXT: dict | None = None
_TRIAL_DISPLAY_LIMIT = 128


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


def _json_finite(value):
    """Missing/rank-deficient map cells remain missing, never become zero power."""
    if isinstance(value, dict):
        return {key: _json_finite(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, np.ndarray)):
        return [_json_finite(item) for item in value]
    if isinstance(value, (float, np.floating)):
        return float(value) if math.isfinite(value) else None
    if isinstance(value, np.integer):
        return int(value)
    return value


def _prepare(curve: dict, min_period: float, max_period: float, *,
             frequency_samples: int, drift_samples: int, time_samples: int,
             drift_cycles: float, window_cycles: float, surrogates: int,
             workers: int, observations_limit: int, harmonics: int, seed: int,
             band: str | None = None, mpi: bool = False) -> tuple[dict, dict]:
    minimum = _finite(min_period, "min_period", 0.5, 100000)
    maximum = _finite(max_period, "max_period", 0.5, 100000)
    if maximum <= minimum:
        raise ValueError("max_period must be greater than min_period.")
    settings = {
        "min_period_days": minimum, "max_period_days": maximum,
        "frequency_samples": _integer(frequency_samples, "frequency_samples", 16, 1200),
        "drift_samples": _integer(drift_samples, "drift_samples", 3, 101),
        "time_samples": _integer(time_samples, "time_samples", 4, 128),
        "drift_cycles": _finite(drift_cycles, "drift_cycles", 0, 8),
        "window_cycles": _finite(window_cycles, "window_cycles", 0.5, 10),
        "surrogates": _integer(surrogates, "surrogates", 1, 50000 if mpi else 64),
        "workers": _integer(workers, "workers", 1, 256 if mpi else 8),
        "observations_limit": _integer(observations_limit, "observations_limit", 30, 3000),
        "harmonics": _integer(harmonics, "harmonics", 1, 3),
        "seed": _integer(seed, "seed", 0, 2**63 - 1),
    }
    if settings["drift_samples"] % 2 != 1:
        raise ValueError("drift_samples must be odd so the grid includes zero drift.")
    observations = curve.get("observations")
    if not isinstance(observations, list) or not observations:
        raise ValueError("A nonempty observed light curve is required.")
    bands = {str(row.get("band", curve.get("band", "unspecified"))) for row in observations}
    if band is None:
        if len(bands) != 1:
            raise ValueError("Transform experiments require one photometric passband; choose a band.")
        band = bands.pop()
    rows = []
    for row in observations:
        if str(row.get("band", curve.get("band", "unspecified"))) != band:
            continue
        try:
            values = tuple(float(row[key]) for key in ("time_jd", "magnitude", "error_mag"))
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("Each observation requires numeric time_jd, magnitude, error_mag.") from error
        if not all(math.isfinite(value) for value in values) or values[2] <= 0:
            raise ValueError("Observations must be finite with positive measurement uncertainties.")
        rows.append(values)
    if len(rows) < 30:
        raise ValueError("At least 30 observations in the selected band are required.")
    rows.sort(key=lambda row: row[0])
    span = rows[-1][0] - rows[0][0]
    if not math.isfinite(span) or span <= 0:
        raise ValueError("Observation times must have a finite positive baseline.")
    if len({row[0] for row in rows}) < 12:
        raise ValueError("At least 12 distinct observation timestamps are required.")
    digest = hashlib.sha256(json.dumps(rows, separators=(",", ":"), allow_nan=False).encode()).hexdigest()
    available = len(rows)
    if available > observations_limit:
        rows = [rows[round(i * (available - 1) / (observations_limit - 1))]
                for i in range(observations_limit)]
    count, frequencies, h = len(rows), frequency_samples, harmonics
    if count * frequencies * drift_samples * h > 500_000_000:
        raise ValueError("The frequency-drift grid exceeds the native 500 million observation/harmonic visit budget.")
    if count * frequencies * time_samples > 500_000_000:
        raise ValueError("The localized grid exceeds the native 500 million observation/cell visit budget.")
    # This is a transparent operation proxy, not a FLOP count or a cost estimate.
    estimated_work = count * frequencies * (2 * h + h * drift_samples + time_samples + 2 * surrogates * h)
    estimated_work += count * (count - 1) // 2
    if estimated_work > (2_000_000_000_000 if mpi else 2_000_000_000):
        raise ValueError("Requested work exceeds the supported budget; lower grid sizes, trials, or observations.")
    settings.update({"observation_count": count, "observation_span_days": span,
                     "max_frequency_derivative": 8 * drift_cycles / (span * span),
                     "estimated_observation_evaluations": estimated_work})
    times, magnitudes, errors = (np.array([row[column] for row in rows], dtype=float)
                                for column in range(3))
    context = {"times": times, "magnitudes": magnitudes, "errors": errors, "settings": settings}
    provenance = {key: curve.get(key) for key in ("star_id", "name", "source_url", "time_system", "data_source")}
    provenance.update({"input_sha256": digest, "input_observations": available,
                       "used_observations": count, "band": band,
                       "observation_span_days": span,
                       "subsampling": "Evenly spaced sorted row indices including both endpoints" if count < available else "All observations in the selected band",
                       "source_csv_sha256": curve.get("source_csv_sha256") or curve.get("sha256")})
    return context, provenance


def _emit(progress: Progress | None, stage: str, percent: int, detail: str,
          **extra) -> None:
    if progress:
        progress({"stage": stage, "percent": percent, "detail": detail, **extra})


def _base_transforms(context: dict, progress: Progress | None) -> dict:
    native = _native_engine()
    settings = context["settings"]
    times, magnitudes, errors = (context[key] for key in ("times", "magnitudes", "errors"))
    started = time.perf_counter()
    _emit(progress, "stationary", 5, "Measuring the observed stationary search statistic before generating Monte Carlo draws.")
    stationary = native.periodogram(times, magnitudes, errors, settings["min_period_days"],
                                    settings["max_period_days"], settings["frequency_samples"],
                                    settings["harmonics"], 1)
    stationary_seconds = time.perf_counter() - started
    finite_powers = [float(power) for power in stationary["powers"] if math.isfinite(power)]
    if not finite_powers:
        raise ValueError("The stationary frequency search has no identifiable fit.")
    context["observed_max_power"] = max(finite_powers)
    context["injected_period_days"] = float(stationary["period_days"])
    context["injection_base_amplitude_mag"] = float(stationary["amplitude_mag"])
    context["reference_epoch_jd"] = float(stationary["reference_epoch_jd"])
    _emit(progress, "chirp", 12, "Solving weighted harmonic fits over frequency and quadratic phase drift.")
    chirp = native.chirp_periodogram(times, magnitudes, errors, settings["min_period_days"],
                                     settings["max_period_days"], settings["frequency_samples"],
                                     settings["drift_samples"], settings["max_frequency_derivative"],
                                     settings["harmonics"], 1)
    chirp.update({"endpoint_phase_drift_cycles": settings["drift_cycles"],
                  "phase_definition": "f*(t-epoch) + 0.5*fdot*(t-epoch)^2; epoch is the baseline midpoint",
                  "stationary_max_power": context["observed_max_power"],
                  "extra_parameter_caveat": "A drift search maximizes over more parameters; higher power alone is not evidence for period evolution."})
    _emit(progress, "localized", 27, "Tracing locally weighted sinusoidal power through the measured timeline.")
    localized = native.localized_periodogram(times, magnitudes, errors, settings["min_period_days"],
                                             settings["max_period_days"], settings["frequency_samples"],
                                             settings["time_samples"], settings["window_cycles"], 1)
    localized["statistic"] = "Gaussian-localized weighted sinusoidal relative chi-square improvement; not the WWZ statistic"
    _emit(progress, "phase-dispersion", 42, "Checking binned phase dispersion without assuming a sinusoidal waveform.")
    dispersion = native.phase_dispersion(times, magnitudes, errors, settings["min_period_days"],
                                         settings["max_period_days"], settings["frequency_samples"], 12, 1)
    dispersion["statistic"] = "PDM-style weighted within-bin variance ratio; not classic degrees-of-freedom-normalized PDM"
    _emit(progress, "structure-function", 50, "Computing all observation-pair magnitude differences by time lag.")
    structure = native.structure_function(times, magnitudes, errors, 40, 0.0, 1)
    structure["noise_correction"] = "Subtract the pair mean of error_i^2 + error_j^2; negative estimates remain negative"
    return {"stationary": {"period_days": stationary["period_days"],
                            "max_power": context["observed_max_power"],
                            "amplitude_mag": stationary["amplitude_mag"],
                            "native_seconds": stationary_seconds},
            "chirp": chirp, "localized": localized,
            "phase_dispersion": dispersion, "structure_function": structure}


def _task_seed(base_seed: int, task_index: int) -> int:
    """Seeds depend on task identity, never on worker scheduling or MPI rank."""
    digest = hashlib.sha256(f"THOTH-transform-v1:{base_seed}:{task_index}".encode()).digest()
    return int.from_bytes(digest[:8], "little")


def _ensemble_task(task_index: int, context: dict) -> dict:
    native = _native_engine()
    started = time.perf_counter()
    settings = context["settings"]
    times, errors = context["times"], context["errors"]
    seed = _task_seed(settings["seed"], task_index)
    rng = np.random.Generator(np.random.PCG64(seed))
    synthetic = rng.normal(0.0, errors)
    is_null = task_index < settings["surrogates"]
    trial_index = task_index if is_null else task_index - settings["surrogates"]
    amplitude_fraction = (0.25, 0.5, 1.0)[trial_index % 3] if not is_null else 0.0
    amplitude = context["injection_base_amplitude_mag"] * amplitude_fraction
    if not is_null:
        angle = 2 * math.pi * (times - context["reference_epoch_jd"]) / context["injected_period_days"]
        phase = rng.uniform(0, 2 * math.pi)
        # amplitude_mag is peak-to-peak; a sinusoid has half that amplitude.
        synthetic += 0.5 * amplitude * np.sin(angle + phase)
    if not np.isfinite(synthetic).all():
        raise ValueError("Synthetic draw exceeds the supported finite numerical range.")
    native_started = time.perf_counter()
    fit = native.periodogram(times, synthetic, errors, settings["min_period_days"],
                              settings["max_period_days"], settings["frequency_samples"],
                              settings["harmonics"], 1)
    native_seconds = time.perf_counter() - native_started
    powers = [float(value) for value in fit["powers"] if math.isfinite(value)]
    if not powers:
        raise ValueError("A Monte Carlo draw has no identifiable frequency fit.")
    recovered_period = float(fit["period_days"])
    frequency_error = abs(1 / recovered_period - 1 / context["injected_period_days"])
    task = {"task_index": task_index, "trial_index": trial_index,
            "kind": "null" if is_null else "injection", "seed": seed,
            "max_power": max(powers), "recovered_period_days": recovered_period,
            "injected_period_days": context["injected_period_days"],
            "amplitude_fraction": amplitude_fraction, "amplitude_mag": amplitude,
            "recovered": frequency_error <= 1 / settings["observation_span_days"],
            "pid": os.getpid(), "hostname": socket.gethostname(),
            "elapsed_seconds": time.perf_counter() - started,
            "native_seconds": native_seconds,
            "synthetic_magnitudes_sha256": hashlib.sha256(synthetic.astype("<f8").tobytes()).hexdigest(),
            "native_threads_used": fit["threads_used"]}
    if not all(math.isfinite(task[key]) for key in ("max_power", "recovered_period_days", "elapsed_seconds")):
        raise ValueError("A Monte Carlo fit returned a non-finite summary.")
    return task


def _initialize_worker(context: dict) -> None:
    global _PROCESS_CONTEXT
    _PROCESS_CONTEXT = context


def _process_task(index: int) -> dict:
    if _PROCESS_CONTEXT is None:
        raise RuntimeError("Transform worker was not initialized.")
    return _ensemble_task(index, _PROCESS_CONTEXT)


def _local_tasks(context: dict) -> Iterable[dict]:
    count = 2 * context["settings"]["surrogates"]
    workers = context["settings"]["workers"]
    if workers == 1:
        for index in range(count):
            yield _ensemble_task(index, context)
        return
    # Bound outstanding futures rather than placing an entire survey in memory.
    with ProcessPoolExecutor(max_workers=workers, mp_context=multiprocessing.get_context("spawn"),
                             initializer=_initialize_worker, initargs=(context,)) as executor:
        pending = set()
        next_index = 0
        while next_index < count or pending:
            while next_index < count and len(pending) < 2 * workers:
                pending.add(executor.submit(_process_task, next_index))
                next_index += 1
            ready, pending = wait(pending, return_when=FIRST_COMPLETED)
            for future in ready:
                yield future.result()


def _empty_accumulator() -> dict:
    return {"null_powers": [], "exceedances": 0, "groups": [
        {"trials": 0, "recovered": 0} for _ in range(3)], "workers": {},
        "null_trials": [], "injection_trials": [], "count": 0}


def _accumulate(state: dict, task: dict, observed_power: float) -> None:
    state["count"] += 1
    worker_key = f"{task['hostname']}:{task['pid']}"
    worker = state["workers"].setdefault(worker_key, {"hostname": task["hostname"],
        "worker_pid": task["pid"], "tasks_completed": 0, "compute_seconds": 0.0,
        "native_seconds": 0.0})
    worker["tasks_completed"] += 1
    worker["compute_seconds"] += task["elapsed_seconds"]
    worker["native_seconds"] += task["native_seconds"]
    if "mpi_rank" in task:
        worker["mpi_rank"] = task["mpi_rank"]
    if task["kind"] == "null":
        state["null_powers"].append((task["trial_index"], task["max_power"]))
        state["exceedances"] += int(task["max_power"] >= observed_power)
        if task["trial_index"] < _TRIAL_DISPLAY_LIMIT:
            state["null_trials"].append(task)
    else:
        group = state["groups"][task["trial_index"] % 3]
        group["trials"] += 1
        group["recovered"] += int(task["recovered"])
        if task["trial_index"] < _TRIAL_DISPLAY_LIMIT:
            state["injection_trials"].append(task)


def _merge_accumulators(states: list[dict]) -> dict:
    merged = _empty_accumulator()
    for state in states:
        merged["count"] += state["count"]
        merged["exceedances"] += state["exceedances"]
        merged["null_powers"].extend(state["null_powers"])
        merged["null_trials"].extend(state["null_trials"])
        merged["injection_trials"].extend(state["injection_trials"])
        merged["workers"].update(state["workers"])
        for group, source in zip(merged["groups"], state["groups"]):
            group["trials"] += source["trials"]
            group["recovered"] += source["recovered"]
    return merged


def _summarize_ensemble(state: dict, context: dict, elapsed: float, execution: str) -> dict:
    settings = context["settings"]
    trials = settings["surrogates"]
    if state["count"] != 2 * trials or len(state["null_powers"]) != trials:
        raise RuntimeError("The ensemble did not complete every requested task.")
    groups = []
    for fraction, group in zip((0.25, 0.5, 1.0), state["groups"]):
        count, recovered = group["trials"], group["recovered"]
        groups.append({"amplitude_fraction": fraction,
                       "amplitude_mag": fraction * context["injection_base_amplitude_mag"],
                       "injected_period_days": context["injected_period_days"],
                       "trials": count, "recovered": recovered, "alias_count": count - recovered,
                       "recovery_fraction": recovered / count if count else None})
    null_trials = sorted(state["null_trials"], key=lambda task: task["trial_index"])
    injection_trials = sorted(state["injection_trials"], key=lambda task: task["trial_index"])
    recovered = sum(group["recovered"] for group in groups)
    return {"execution": execution, "base_seed": settings["seed"],
            "random_generator": "NumPy PCG64; SHA256-derived per-task seed independent of worker/rank",
            "numpy_version": np.__version__, "surrogates": trials, "injections": trials,
            "task_count": state["count"], "observed_max_power": context["observed_max_power"],
            "exceedances": state["exceedances"],
            "empirical_p_value": (state["exceedances"] + 1) / (trials + 1),
            "p_value_floor": 1 / (trials + 1),
            "null_max_powers": [power for _, power in sorted(state["null_powers"])],
            "null_trials": null_trials, "injection_trials": injection_trials,
            "trial_details_limit_per_kind": _TRIAL_DISPLAY_LIMIT,
            "injection_groups": groups, "recovery_fraction": recovered / trials,
            "frequency_recovery_tolerance_per_day": 1 / settings["observation_span_days"],
            "workers": sorted(state["workers"].values(), key=lambda worker: (worker["hostname"], worker["worker_pid"])),
            "elapsed_seconds": elapsed,
            "native_seconds": sum(worker["native_seconds"] for worker in state["workers"].values()),
            "native_timing_scope": "Sum of elapsed durations inside native frequency calls across all workers; aggregate service time, not parallel wall time",
            "candidate_frequency_evaluations": state["count"] * settings["frequency_samples"],
            "observation_frequency_harmonic_evaluations": state["count"] * settings["observation_count"] * settings["frequency_samples"] * settings["harmonics"],
            "sampling_assumption": "Independent Gaussian white noise with each measured error, sampled at the actual selected observation times",
            "caveats": [
                "The tail estimate is conditional on independent Gaussian reported errors and this fixed stationary frequency grid; it is not calibrated for correlated Mira variability.",
                "The +1 correction prevents zero Monte Carlo tail estimates; few draws cannot establish rare-event significance.",
                "The null calibrates the stationary search only, not the extra frequency-drift or localized-map searches.",
                "Injection tests use a synthetic sinusoid at the best stationary period and three fractions of the observed fitted peak-to-peak amplitude; they do not measure real-star completeness.",
                "Recovery means frequency error within 1/observed_baseline; unrecovered fits can include aliases, low signal, or numerical ambiguity.",
                "Per-task details are capped at 128 per kind; group totals and the null-power distribution include every completed draw.",
                "No serial baseline is timed here, so worker wall time does not imply a measured parallel speedup.",
            ]}


def _finish(base: dict, context: dict, provenance: dict, ensemble: dict,
            pipeline_seconds: float) -> dict:
    settings = context["settings"]
    cell_visits = sum(int(base[key].get("observation_cell_evaluations", 0)) for key in ("chirp", "localized"))
    cell_visits += int(base["phase_dispersion"].get("observation_frequency_evaluations", 0))
    cell_visits += settings["observation_count"] * settings["frequency_samples"]
    ensemble_visits = ensemble["observation_frequency_harmonic_evaluations"]
    pair_evaluations = int(base["structure_function"]["pair_evaluations"])
    native_seconds = base["stationary"]["native_seconds"] + sum(
        float(base[key]["native_seconds"]) for key in ("chirp", "localized", "phase_dispersion", "structure_function"))
    report = {**base, "ensemble": ensemble, "provenance": provenance, "settings": settings,
              "computation": {"pipeline_seconds": pipeline_seconds,
                  "base_native_seconds": native_seconds,
                  "native_seconds": native_seconds + ensemble["native_seconds"],
                  "native_timing_scope": "Base native map durations plus summed native ensemble-call durations across workers; aggregate service time, not pipeline elapsed time",
                  "observation_cell_evaluations": cell_visits,
                  "ensemble_observation_frequency_harmonic_evaluations": ensemble_visits,
                  "structure_function_pair_evaluations": pair_evaluations,
                  "total_observation_evaluations": cell_visits + ensemble_visits + pair_evaluations,
                  "workers_requested": settings["workers"],
                  "stationary_frequency_evaluations": settings["frequency_samples"],
                  "operation_count_definition": "Observation/candidate visits and harmonic work proxies, plus actual pair evaluations; not hardware FLOPs",
                  "native_kernel_threads": 1},
              "caveats": [
                  "Empirical photometry transforms are hypothesis generators, not a physical stellar evolution or hydrodynamic model.",
                  "Quadratic phase drift can compete with aliases, uneven cadence, changing waveform and sparse observations; a winning drift cell alone does not establish secular period change.",
                  "Gaussian-localized power is not the Foster WWZ statistic, and binned weighted dispersion is not classical PDM normalization.",
                  "Structure-function pairs share observations and are correlated; empty lag bins remain missing and noise-corrected estimates may be negative.",
                  "Deterministic row selection preserves the baseline but can omit important fast cadence and rare events; inspect the used row count.",
                  "Historical million-dollar or 80-cluster cost comparisons are not measured; this report records actual work, timing, process IDs and hostnames.",
                  "All maps are grid-limited; increase resolution and validate with independent data before drawing astrophysical conclusions.",
              ]}
    report = _json_finite(report)
    json.dumps(report, allow_nan=False)
    return report


def run_transform_lab(curve: dict, min_period: float, max_period: float,
                      frequency_samples: int = 128, drift_samples: int = 31,
                      time_samples: int = 24, drift_cycles: float = 2.0,
                      window_cycles: float = 3.0, surrogates: int = 12,
                      workers: int = 2, observations_limit: int = 1200,
                      harmonics: int = 2, seed: int = 1729,
                      progress: Progress | None = None, *, band: str | None = None) -> dict:
    """Compute maps, all-pairs lag statistics and a real process-worker ensemble.

    Call from a guarded main function when using multiple spawned workers.
    """
    started = time.perf_counter()
    _emit(progress, "prepare", 2, "Validating single-band measurements and deterministic workload settings.")
    context, provenance = _prepare(curve, min_period, max_period,
        frequency_samples=frequency_samples, drift_samples=drift_samples,
        time_samples=time_samples, drift_cycles=drift_cycles, window_cycles=window_cycles,
        surrogates=surrogates, workers=workers, observations_limit=observations_limit,
        harmonics=harmonics, seed=seed, band=band)
    base = _base_transforms(context, progress)
    _emit(progress, "ensemble", 56, "Dispatching seeded noise-null and signal-injection searches at the measured timestamps.",
          completed=0, total=2 * surrogates)
    ensemble_started = time.perf_counter()
    state = _empty_accumulator()
    for task in _local_tasks(context):
        _accumulate(state, task, context["observed_max_power"])
        _emit(progress, "ensemble", 56 + int(40 * state["count"] / (2 * surrogates)),
              "Completed a real native frequency search in the ensemble.",
              completed=state["count"], total=2 * surrogates,
              worker_pid=task["pid"], hostname=task["hostname"])
    ensemble = _summarize_ensemble(state, context, time.perf_counter() - ensemble_started,
                                  "Serial native tasks" if workers == 1 else "Spawned local process workers")
    report = _finish(base, context, provenance, ensemble, time.perf_counter() - started)
    _emit(progress, "complete", 100, "Native maps and all requested calibration tasks are complete.")
    return report


def run_mpi_transform_lab(*, star_id: str | None = None, input_path: Path | None = None,
                          time_system: str = "JD", band: str | None = None,
                          min_period: float = 50, max_period: float = 1000,
                          frequency_samples: int = 128, drift_samples: int = 31,
                          time_samples: int = 24, drift_cycles: float = 2.0,
                          window_cycles: float = 3.0, surrogates: int = 12,
                          observations_limit: int = 1200, harmonics: int = 2,
                          seed: int = 1729) -> dict | None:
    """Rank zero computes maps; all real ranks share deterministic ensemble tasks.

    Input and task failures are communicated collectively so a failed rank does
    not leave peers waiting at a gather. Only rank zero returns a report.
    """
    try:
        from mpi4py import MPI
    except ImportError as error:
        raise RuntimeError("MPI mode requires mpi4py and an installed MPI runtime.") from error
    comm = MPI.COMM_WORLD
    rank, size = comm.Get_rank(), comm.Get_size()
    context = provenance = base = None
    control = None
    pipeline_started = time.perf_counter()
    if rank == 0:
        try:
            if input_path is not None:
                curve = read_observations_csv(input_path)
                curve["time_system"] = time_system
            else:
                curve = load_lightcurve(star_id or EXAMPLE_STAR_ID)
            context, provenance = _prepare(curve, min_period, max_period,
                frequency_samples=frequency_samples, drift_samples=drift_samples,
                time_samples=time_samples, drift_cycles=drift_cycles, window_cycles=window_cycles,
                surrogates=surrogates, workers=size, observations_limit=observations_limit,
                harmonics=harmonics, seed=seed, band=band, mpi=True)
            base = _base_transforms(context, None)
            control = {"ready": True}
        except Exception as error:
            control = {"error": str(error)}
    control = comm.bcast(control, root=0)
    if "error" in control:
        raise RuntimeError(control["error"])
    comm.Barrier()
    started = MPI.Wtime()
    context = comm.bcast(context, root=0)
    state = _empty_accumulator()
    local_error = None
    try:
        for index in range(rank, 2 * context["settings"]["surrogates"], size):
            task = _ensemble_task(index, context)
            task["mpi_rank"] = rank
            _accumulate(state, task, context["observed_max_power"])
    except Exception as error:
        local_error = f"Rank {rank}: {error}"
    gathered = comm.gather({"state": state, "error": local_error}, root=0)
    elapsed = comm.reduce(MPI.Wtime() - started, op=MPI.MAX, root=0)
    errors = [item["error"] for item in gathered if item["error"]] if rank == 0 else None
    errors = comm.bcast(errors, root=0)
    if errors:
        raise RuntimeError("MPI transform task failed: " + "; ".join(errors))
    report = None
    finish_error = None
    if rank == 0:
        try:
            merged = _merge_accumulators([item["state"] for item in gathered])
            ensemble = _summarize_ensemble(merged, context, elapsed, "MPI rank-sharded native tasks")
            ensemble.update({"mpi_size": size, "mpi_library": MPI.Get_library_version().strip(),
                "timing_scope": "MPI maximum elapsed duration including context broadcast and summary gather; excludes mpiexec launch, serial map preparation and final timing reduction",
                "process_startup_included": False,
                "distinct_hostnames_observed": len({worker["hostname"] for worker in ensemble["workers"]})})
            report = _finish(base, context, provenance, ensemble, time.perf_counter() - pipeline_started)
        except Exception as error:
            finish_error = str(error)
    finish_error = comm.bcast(finish_error, root=0)
    if finish_error:
        raise RuntimeError(finish_error)
    return report


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="THOTH native transform and process/MPI Monte Carlo foundry")
    inputs = parser.add_mutually_exclusive_group()
    inputs.add_argument("--star", help="OGLE star ID; defaults to the bundled measured example")
    inputs.add_argument("--input", type=Path, help="CSV with time_jd,magnitude,error_mag and optional band")
    parser.add_argument("--band")
    parser.add_argument("--time-system", choices=("JD", "HJD", "BJD"), default="JD")
    parser.add_argument("--mpi", action="store_true", help="Use real MPI ranks; up to 50,000 draws of each kind")
    parser.add_argument("--workers", type=int, default=2, help="Local processes, 1..8; MPI uses rank count")
    parser.add_argument("--min-period", type=float, default=50)
    parser.add_argument("--max-period", type=float, default=1000)
    parser.add_argument("--frequency-samples", type=int, default=128)
    parser.add_argument("--drift-samples", type=int, default=31)
    parser.add_argument("--time-samples", type=int, default=24)
    parser.add_argument("--drift-cycles", type=float, default=2)
    parser.add_argument("--window-cycles", type=float, default=3)
    parser.add_argument("--surrogates", type=int, default=12, help="Null draws and equal injection count; 1..64 local or 1..50000 MPI")
    parser.add_argument("--observations-limit", type=int, default=1200)
    parser.add_argument("--harmonics", type=int, default=2)
    parser.add_argument("--seed", type=int, default=1729)
    parser.add_argument("--progress", action="store_true", help="Local progress JSON on stderr")
    parser.add_argument("--output", type=Path, help="JSON output; only rank zero writes in MPI mode")
    args = parser.parse_args(argv)
    options = {key: getattr(args, key) for key in ("min_period", "max_period", "frequency_samples", "drift_samples",
        "time_samples", "drift_cycles", "window_cycles", "surrogates", "observations_limit", "harmonics", "seed", "band")}
    try:
        if args.mpi:
            report = run_mpi_transform_lab(star_id=args.star, input_path=args.input,
                                           time_system=args.time_system, **options)
        else:
            curve = read_observations_csv(args.input) if args.input else load_lightcurve(args.star or EXAMPLE_STAR_ID)
            if args.input:
                curve["time_system"] = args.time_system
            progress = (lambda event: print(json.dumps(event), file=sys.stderr, flush=True)) if args.progress else None
            report = run_transform_lab(curve, workers=args.workers, progress=progress, **options)
        output_error = None
        if report is not None:
            try:
                if args.output:
                    from .cli import write_json
                    write_json(args.output, report)
                    print(json.dumps({"output": str(args.output),
                        "tasks_completed": report["ensemble"]["task_count"],
                        "pipeline_seconds": report["computation"]["pipeline_seconds"]}),
                        file=sys.stderr)
                else:
                    print(json.dumps(report, indent=2, allow_nan=False))
            except (ValueError, OSError) as error:
                output_error = str(error)
        if args.mpi:
            from mpi4py import MPI
            output_error = MPI.COMM_WORLD.bcast(output_error, root=0)
        if output_error:
            raise RuntimeError("Writing the transform report failed: " + output_error)
    except (ValueError, RuntimeError, OSError) as error:
        parser.exit(1, f"Transform foundry failed: {error}\n")


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
