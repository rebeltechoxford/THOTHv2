"""Measured process/MPI experiments on bootstrap samples of observed photometry.

Local runs time the same deterministic tasks serially and in spawned processes.
MPI is an optional execution path; local workers do not imply multiple computers.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
import hashlib
import json
import math
import multiprocessing
import os
from pathlib import Path
import random
import socket
import statistics
import struct
import sys
import time
from typing import Callable, Sequence

from .catalog import EXAMPLE_STAR_ID, get_star, load_lightcurve

Progress = Callable[[dict], None]
_PROCESS_ROWS: list[tuple[float, float, float]] = []
BASE_SEED = 1729


def _period_limits(star_id: str, minimum: float | None, maximum: float | None) -> tuple[float, float, dict]:
    star = get_star(star_id)
    catalog_period = star.get("period_days") if star else None
    if catalog_period is not None and math.isfinite(catalog_period) and catalog_period > 0:
        low = max(10.0, 0.65 * catalog_period)
        high = max(low * 1.1, 1.5 * catalog_period)
        basis = "Catalog-informed search: max(10 days, 0.65*catalog period) to 1.5*catalog period"
    else:
        low, high = 50.0, 1000.0
        basis = "Default 50..1000 days because no usable catalog period is available"
    if minimum is not None or maximum is not None:
        basis = "User-supplied limit(s); any remaining limit uses the catalog-informed/default range"
    return (low if minimum is None else minimum,
            high if maximum is None else maximum,
            {"catalog_period_days": catalog_period, "period_search_basis": basis})


def _positive_integer(value: int, name: str, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= maximum:
        raise ValueError(f"{name} must be an integer between 1 and {maximum}.")
    return value


def amdahl_speedup(parallel_fraction: float, workers: int) -> float:
    """Fixed-workload model: S(P) = 1 / ((1-p) + p/P)."""
    if not math.isfinite(parallel_fraction) or not 0 <= parallel_fraction <= 1:
        raise ValueError("parallel_fraction must be finite and between 0 and 1.")
    _positive_integer(workers, "workers", 1_000_000)
    return 1 / ((1 - parallel_fraction) + parallel_fraction / workers)


def gustafson_speedup(serial_fraction: float, workers: int) -> float:
    """Scaled-workload model: S(P) = P - s*(P-1)."""
    if not math.isfinite(serial_fraction) or not 0 <= serial_fraction <= 1:
        raise ValueError("serial_fraction must be finite and between 0 and 1.")
    _positive_integer(workers, "workers", 1_000_000)
    return workers - serial_fraction * (workers - 1)


def _settings(workers: int, tasks: int, samples: int, observations_limit: int,
              min_period: float, max_period: float, harmonics: int,
              threads_per_task: int = 1, *, mpi: bool = False) -> dict:
    _positive_integer(workers, "workers", 128 if mpi else 8)
    _positive_integer(tasks, "tasks", 4096 if mpi else 48)
    _positive_integer(samples, "samples", 1200)
    _positive_integer(observations_limit, "observations_limit", 3000)
    _positive_integer(harmonics, "harmonics", 3)
    _positive_integer(threads_per_task, "threads_per_task", 8)
    if samples < 16:
        raise ValueError("samples must be at least 16.")
    if observations_limit < 2 * harmonics + 3:
        raise ValueError("observations_limit must be at least 2 * harmonics + 3.")
    if (not math.isfinite(min_period) or not math.isfinite(max_period)
            or min_period <= 0 or max_period <= min_period):
        raise ValueError("Period limits must be finite and positive, with max_period > min_period.")
    return {"workers": workers, "tasks": tasks, "samples": samples,
            "observations_limit": observations_limit, "min_period_days": min_period,
            "max_period_days": max_period, "harmonics": harmonics,
            "threads_per_task": threads_per_task, "base_seed": BASE_SEED,
            "resampling": "Observed (time, magnitude, error) rows with replacement; no simulated measurements",
            "bootstrap_assumption": "Rows are treated as independent; evolving Mira cycles and time correlation limit interpretation",
            "selection": "Sort by time; select evenly spaced row indices including first and last when above limit"}


def _prepare_rows(observations: Sequence[dict], settings: dict) -> tuple[list, int]:
    bands = {row.get("band", "unspecified") for row in observations}
    if len(bands) > 1:
        raise ValueError("Cluster experiments require observations from one passband.")
    rows = []
    for row in observations:
        try:
            values = tuple(float(row[key]) for key in ("time_jd", "magnitude", "error_mag"))
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("Each observation requires numeric time_jd, magnitude, error_mag.") from error
        if not all(math.isfinite(value) for value in values) or values[2] <= 0:
            raise ValueError("Observations must be finite and measurement errors positive.")
        rows.append(values)
    minimum = 2 * settings["harmonics"] + 3
    if len(rows) < minimum:
        raise ValueError(f"At least {minimum} observations are required.")
    rows.sort(key=lambda row: row[0])
    if rows[-1][0] <= rows[0][0]:
        raise ValueError("Observation times must have a positive baseline.")
    available = len(rows)
    limit = settings["observations_limit"]
    if available > limit:
        rows = [rows[round(index * (available - 1) / (limit - 1))] for index in range(limit)]
    return rows, available


def _initialize_process(rows: list[tuple[float, float, float]]) -> None:
    global _PROCESS_ROWS
    _PROCESS_ROWS = rows


def _fit_task(task_index: int, rows: list[tuple[float, float, float]], settings: dict) -> dict:
    from . import _native

    started = time.perf_counter()
    seed = settings["base_seed"] + task_index
    rng = random.Random(seed)
    indices = [rng.randrange(len(rows)) for _ in rows]
    sample = [rows[index] for index in indices]
    times, magnitudes, errors = zip(*sample)
    fit = _native.periodogram(times, magnitudes, errors,
                              settings["min_period_days"], settings["max_period_days"],
                              settings["samples"], settings["harmonics"],
                              settings["threads_per_task"])
    digest = hashlib.sha256(b"".join(struct.pack("<I", index) for index in indices)).hexdigest()
    result = {"task_index": task_index, "seed": seed, "period_days": fit["period_days"],
              "chi2": fit["chi2"], "reduced_chi2": fit["reduced_chi2"],
              "amplitude_mag": fit["amplitude_mag"],
              "fit_seconds": time.perf_counter() - started,
              "worker_pid": os.getpid(), "hostname": socket.gethostname(),
              "observations": len(rows), "sample_indices_sha256": digest,
              "native_threads_used": fit["threads_used"]}
    if not all(math.isfinite(result[key]) for key in
               ("period_days", "chi2", "reduced_chi2", "amplitude_mag", "fit_seconds")):
        raise ValueError("A bootstrap fit returned a non-finite summary.")
    return result


def _process_fit_task(task_index: int, settings: dict) -> dict:
    return _fit_task(task_index, _PROCESS_ROWS, settings)


def _emit(progress: Progress | None, stage: str, completed: int, total: int,
          task: dict | None = None, state: str = "running") -> None:
    if progress is not None:
        event = {"state": state, "stage": stage, "completed": completed, "total": total}
        if task:
            event.update({key: task[key] for key in
                          ("task_index", "worker_pid", "hostname", "period_days")})
        progress(event)


def _quantile(sorted_values: list[float], fraction: float) -> float:
    location = (len(sorted_values) - 1) * fraction
    lower = math.floor(location)
    upper = math.ceil(location)
    return sorted_values[lower] + (sorted_values[upper] - sorted_values[lower]) * (location - lower)


def _summarize(serial_results: list[dict], parallel_results: list[dict],
               serial_seconds: float, parallel_seconds: float, settings: dict,
               metadata: dict, execution: str) -> dict:
    parallel_results.sort(key=lambda task: task["task_index"])
    serial_results.sort(key=lambda task: task["task_index"])
    periods = [task["period_days"] for task in parallel_results]
    sorted_periods = sorted(periods)
    nodes = {}
    for task in parallel_results:
        key = (task["hostname"], task["worker_pid"])
        node = nodes.setdefault(key, {"hostname": key[0], "worker_pid": key[1],
                                      "tasks_completed": 0, "compute_seconds": 0,
                                      "task_indices": []})
        node["tasks_completed"] += 1
        node["compute_seconds"] += task["fit_seconds"]
        node["task_indices"].append(task["task_index"])
        if "mpi_rank" in task:
            node["mpi_rank"] = task["mpi_rank"]
    same = all(serial["sample_indices_sha256"] == parallel["sample_indices_sha256"]
               and all(math.isclose(serial[key], parallel[key], rel_tol=1e-12, abs_tol=1e-12)
                       for key in ("period_days", "chi2", "amplitude_mag"))
               for serial, parallel in zip(serial_results, parallel_results))
    speedup = serial_seconds / parallel_seconds
    return {**metadata, "execution": execution, "settings": settings,
            "serial_seconds": serial_seconds, "parallel_seconds": parallel_seconds,
            "speedup": speedup, "efficiency": speedup / settings["workers"],
            "same_task_results": same,
            "worker_pids": sorted({task["worker_pid"] for task in parallel_results}),
            "hostnames": sorted({task["hostname"] for task in parallel_results}),
            "node_results": sorted(nodes.values(), key=lambda node: (node["hostname"], node["worker_pid"])),
            "task_timings": {"serial": serial_results, "parallel": parallel_results},
            "period_distribution": {
                "periods_days": periods, "mean_days": statistics.mean(periods),
                "median_days": statistics.median(periods),
                "stddev_days": statistics.stdev(periods) if len(periods) > 1 else 0.0,
                "min_days": min(periods), "max_days": max(periods),
                "p16_days": _quantile(sorted_periods, 0.16),
                "p84_days": _quantile(sorted_periods, 0.84)},
            "scaling_models": {
                "modeled_not_measured": True, "parallel_fraction_assumed": 0.95,
                "scaled_serial_fraction_assumed": 0.05,
                "points": [{"workers": workers,
                            "amdahl_speedup": amdahl_speedup(0.95, workers),
                            "gustafson_speedup": gustafson_speedup(0.05, workers)}
                           for workers in (1, 2, 4, 8, 16, 32, 64, 128)]},
            "interpretation": [
                "This measures compute scheduling, not stellar evolution or physical cluster performance.",
                "Evolving Mira cycles and time-correlated measurements violate the independent-row bootstrap assumption; period quantiles are an illustrative resampling distribution, not calibrated astrophysical confidence intervals.",
                "Repeated timings, larger workloads, and independent machines are needed for a scaling study.",
                "Speedup below one is valid: process startup, data movement, and scheduling can outweigh parallel work."],
            "warnings": [
                "Pairs bootstrap assumes independent observed rows; evolving Mira cycles and time correlation can invalidate confidence-interval interpretations.",
                "Aliases and the finite period grid can produce separated bootstrap peaks.",
                "Hostnames identify execution environments; distinct hostname counts alone do not verify distinct physical machines."]}


def _run_prepared(rows: list, settings: dict, metadata: dict, progress: Progress | None) -> dict:
    total = settings["tasks"]
    _emit(progress, "serial", 0, total)
    serial_results = []
    started = time.perf_counter()
    for task_index in range(total):
        task = _fit_task(task_index, rows, settings)
        serial_results.append(task)
        _emit(progress, "serial", len(serial_results), total, task)
    serial_seconds = time.perf_counter() - started
    _emit(progress, "parallel", 0, total)
    parallel_results = []
    started = time.perf_counter()
    # Spawn is explicit: this works on Windows and avoids inherited native/OpenMP
    # runtime state on POSIX. The timer includes startup, IPC, and pool shutdown.
    with ProcessPoolExecutor(max_workers=settings["workers"],
                             mp_context=multiprocessing.get_context("spawn"),
                             initializer=_initialize_process, initargs=(rows,)) as pool:
        futures = [pool.submit(_process_fit_task, task_index, settings) for task_index in range(total)]
        for future in as_completed(futures):
            task = future.result()
            parallel_results.append(task)
            _emit(progress, "parallel", len(parallel_results), total, task)
    parallel_seconds = time.perf_counter() - started
    report = _summarize(serial_results, parallel_results, serial_seconds, parallel_seconds,
                        settings, metadata, "local spawned processes")
    report["timing_scope"] = (
        "Serial and parallel timers include resampling, fitting, result construction, and parent progress callbacks. "
        "Parallel timing also includes pool startup, observation transfer to each worker, scheduling, IPC, and shutdown. "
        "Source loading and row selection are excluded from both; preparation_seconds records those separately.")
    report["process_startup_included"] = True
    report["distinct_hostnames_observed"] = len(report["hostnames"])
    _emit(progress, "complete", total, total, state="completed")
    return report


def benchmark_observations(observations: Sequence[dict], *, workers: int = 4,
                           tasks: int = 12, samples: int = 400,
                           observations_limit: int = 1200, min_period: float = 50,
                           max_period: float = 1000, harmonics: int = 2,
                           progress: Progress | None = None, metadata: dict | None = None) -> dict:
    """Benchmark supplied measured rows; callers retain responsibility for provenance.

    Scripts calling this function must use an ``if __name__ == '__main__'`` guard,
    as required by spawned multiprocessing. Native threads are fixed to one.
    """
    settings = _settings(workers, tasks, samples, observations_limit,
                         min_period, max_period, harmonics)
    _emit(progress, "preparing", 0, tasks)
    started = time.perf_counter()
    rows, available = _prepare_rows(observations, settings)
    details = {**(metadata or {}), "observations_available": available,
               "observations_used": len(rows), "preparation_seconds": time.perf_counter() - started}
    return _run_prepared(rows, settings, details, progress)


def run_cluster_experiment(star_id: str = EXAMPLE_STAR_ID, workers: int = 4,
                           tasks: int = 12, samples: int = 400,
                           observations_limit: int = 1200, progress: Progress | None = None, *,
                           min_period: float | None = None, max_period: float | None = None) -> dict:
    """Load a real OGLE light curve and compare identical serial/process jobs."""
    settings = _settings(workers, tasks, samples, observations_limit, 50, 1000, 2)
    _emit(progress, "preparing", 0, tasks)
    started = time.perf_counter()
    low, high, search_basis = _period_limits(star_id, min_period, max_period)
    settings = {**_settings(workers, tasks, samples, observations_limit, low, high, 2),
                **search_basis}
    curve = load_lightcurve(star_id)
    rows, available = _prepare_rows(curve["observations"], settings)
    metadata = {key: curve.get(key) for key in
                ("star_id", "source_url", "time_system", "band", "data_source")}
    metadata.update({"observations_available": available, "observations_used": len(rows),
                     "preparation_seconds": time.perf_counter() - started})
    return _run_prepared(rows, settings, metadata, progress)


def run_mpi_experiment(star_id: str = EXAMPLE_STAR_ID, *, tasks: int = 12,
                       samples: int = 400, observations_limit: int = 1200,
                       threads_per_rank: int = 1, min_period: float | None = None,
                       max_period: float | None = None) -> dict | None:
    """Run identical rank-sharded jobs under mpi4py; only rank zero returns a report.

    MPI wall time includes input broadcast and result gather but not mpiexec
    process launch. Rank zero alone loads the archive and runs the serial baseline.
    """
    try:
        from mpi4py import MPI
    except ImportError as error:
        raise RuntimeError("MPI mode requires mpi4py and an installed MPI runtime.") from error
    comm = MPI.COMM_WORLD
    rank, size = comm.Get_rank(), comm.Get_size()
    rows = metadata = serial_results = settings = None
    control = None
    if rank == 0:
        try:
            settings = _settings(size, tasks, samples, observations_limit, 50, 1000, 2,
                                 threads_per_rank, mpi=True)
            started = time.perf_counter()
            low, high, search_basis = _period_limits(star_id, min_period, max_period)
            settings = {**_settings(size, tasks, samples, observations_limit, low, high, 2,
                                    threads_per_rank, mpi=True), **search_basis}
            curve = load_lightcurve(star_id)
            rows, available = _prepare_rows(curve["observations"], settings)
            metadata = {key: curve.get(key) for key in
                        ("star_id", "source_url", "time_system", "band", "data_source")}
            metadata.update({"observations_available": available, "observations_used": len(rows),
                             "preparation_seconds": time.perf_counter() - started})
            started = MPI.Wtime()
            serial_results = [_fit_task(index, rows, settings) for index in range(tasks)]
            serial_seconds = MPI.Wtime() - started
            control = {"settings": settings, "serial_seconds": serial_seconds}
        except Exception as error:
            control = {"error": str(error)}
    control = comm.bcast(control, root=0)
    if "error" in control:
        raise RuntimeError(control["error"])
    settings = control["settings"]
    comm.Barrier()
    started = MPI.Wtime()
    rows = comm.bcast(rows, root=0)
    local_results, local_error = [], None
    try:
        for index in range(rank, settings["tasks"], size):
            task = _fit_task(index, rows, settings)
            task["mpi_rank"] = rank
            local_results.append(task)
    except Exception as error:
        local_error = str(error)
    gathered = comm.gather({"tasks": local_results, "error": local_error}, root=0)
    parallel_seconds = comm.reduce(MPI.Wtime() - started, op=MPI.MAX, root=0)
    errors = [item["error"] for item in gathered if item["error"]] if rank == 0 else None
    errors = comm.bcast(errors, root=0)
    if errors:
        raise RuntimeError("MPI task failed: " + "; ".join(errors))
    if rank != 0:
        return None
    parallel_results = [task for item in gathered for task in item["tasks"]]
    report = _summarize(serial_results, parallel_results, control["serial_seconds"],
                        parallel_seconds, settings, metadata, "MPI rank-sharded jobs")
    report.update({"mpi_size": size, "mpi_library": MPI.Get_library_version().strip(),
                   "mpi_clock": "MPI.Wtime; maximum elapsed duration across ranks",
                   "process_startup_included": False,
                   "distinct_hostnames_observed": len(report["hostnames"]),
                   "timing_scope": "Parallel MPI timer includes observation broadcast, rank-sharded bootstrap fits, and result gather. Source loading, the final timing reduction, and mpiexec process launch are excluded. Serial baseline uses the same per-task native thread setting."})
    return report


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="THOTH measured serial/process/MPI bootstrap experiment")
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--local", action="store_true", help="Spawn local workers (default)")
    modes.add_argument("--mpi", action="store_true", help="Use MPI.COMM_WORLD; launch under mpiexec/srun")
    parser.add_argument("--star", default=EXAMPLE_STAR_ID)
    parser.add_argument("--workers", type=int, default=4, help="Local worker processes, 1..8; MPI uses rank count")
    parser.add_argument("--tasks", type=int, default=12, help="Deterministic bootstrap tasks, 1..48 local or 1..4096 MPI")
    parser.add_argument("--samples", type=int, default=400, help="Frequency-grid samples per fit, 16..1200")
    parser.add_argument("--observations-limit", type=int, default=1200, help="Evenly selected real rows, 7..3000")
    parser.add_argument("--threads-per-rank", type=int, default=1, help="MPI native/OpenMP threads per task, 1..8")
    parser.add_argument("--min-period", type=float, help="Override the catalog-informed minimum period in days")
    parser.add_argument("--max-period", type=float, help="Override the catalog-informed maximum period in days")
    parser.add_argument("--output", type=Path, help="Save a JSON report; MPI writes only on rank zero")
    parser.add_argument("--progress", action="store_true", help="Print local progress to stderr")
    args = parser.parse_args(argv)
    try:
        if args.mpi:
            report = run_mpi_experiment(args.star, tasks=args.tasks, samples=args.samples,
                                        observations_limit=args.observations_limit,
                                        threads_per_rank=args.threads_per_rank,
                                        min_period=args.min_period, max_period=args.max_period)
        else:
            if args.threads_per_rank != 1:
                parser.error("--threads-per-rank applies only to --mpi; local tasks always use one native thread")
            progress = (lambda event: print(json.dumps(event), file=sys.stderr, flush=True)) if args.progress else None
            report = run_cluster_experiment(args.star, args.workers, args.tasks, args.samples,
                                            args.observations_limit, progress,
                                            min_period=args.min_period, max_period=args.max_period)
        if report is not None:
            text = json.dumps(report, indent=2, allow_nan=False)
            if args.output:
                args.output.parent.mkdir(parents=True, exist_ok=True)
                args.output.write_text(text + "\n", encoding="utf-8")
            print(text)
    except (ValueError, RuntimeError, OSError) as error:
        parser.exit(1, f"Cluster experiment failed: {error}\n")


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
