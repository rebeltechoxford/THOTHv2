"""Repeated local strong/weak scaling studies with observed OGLE photometry."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import statistics

from thoth.catalog import EXAMPLE_STAR_ID
from thoth.cluster import run_cluster_experiment


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--star", default=EXAMPLE_STAR_ID)
    parser.add_argument("--workers", nargs="+", type=int, default=[1, 2, 4])
    parser.add_argument("--tasks", type=int, default=12, help="Fixed total tasks for strong scaling; tasks per worker for weak scaling")
    parser.add_argument("--weak", action="store_true", help="Grow total tasks with worker count")
    parser.add_argument("--repeats", type=int, default=3)
    parser.add_argument("--samples", type=int, default=800)
    parser.add_argument("--observations-limit", type=int, default=2400)
    parser.add_argument("--output", type=Path, default=Path("reports/cluster-scaling.json"))
    args = parser.parse_args()
    if not 1 <= args.repeats <= 10:
        parser.error("repeats must be between 1 and 10")
    if 1 not in args.workers or any(not 1 <= value <= 8 for value in args.workers):
        parser.error("workers must include 1 and contain values between 1 and 8")
    if args.tasks < 1 or any((args.tasks * workers if args.weak else args.tasks) > 48 for workers in args.workers):
        parser.error("each local run must have 1..48 tasks; reduce tasks per worker for weak scaling")
    studies = []
    for workers in sorted(set(args.workers)):
        tasks = args.tasks * workers if args.weak else args.tasks
        runs = [run_cluster_experiment(args.star, workers, tasks, args.samples,
                                        args.observations_limit) for _ in range(args.repeats)]
        serial = statistics.median(run["serial_seconds"] for run in runs)
        parallel = statistics.median(run["parallel_seconds"] for run in runs)
        studies.append({"workers": workers, "tasks": tasks, "median_serial_seconds": serial,
                        "median_parallel_seconds": parallel,
                        "tasks_per_second": tasks / parallel,
                        "same_workload_serial_speedup": serial / parallel,
                        "runs": runs})
    baseline = next(study for study in studies if study["workers"] == 1)
    for study in studies:
        if args.weak:
            study["weak_scaling_efficiency"] = baseline["median_parallel_seconds"] / study["median_parallel_seconds"]
        else:
            study["strong_scaling_speedup"] = baseline["median_parallel_seconds"] / study["median_parallel_seconds"]
    report = {"kind": "weak scaling" if args.weak else "strong scaling", "star_id": args.star,
              "repeats": args.repeats, "timing_scope": "Local pool startup/IPC/shutdown included; source preparation excluded",
              "baseline": "One-worker spawned-pool median for cross-worker scaling; each run also has a direct serial baseline",
              "studies": studies}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    print(json.dumps({"kind": report["kind"], "output": str(args.output),
                      "timings": [{key: value for key, value in study.items() if key != "runs"}
                                  for study in studies]}, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
