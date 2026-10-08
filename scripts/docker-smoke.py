"""Exercise the installed application inside its actual non-root runtime image.

Uses bundled measured data, so this check never depends on upstream archives.
Run after the server is healthy: docker compose exec -T observatory python
scripts/docker-smoke.py --mpi
"""
from __future__ import annotations

import argparse
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen


BASE = "http://127.0.0.1:8765"
STAR = "OGLE-BLG-LPV-096697"


def request(path: str, payload: dict | None = None):
    body = json.dumps(payload).encode() if payload is not None else None
    headers = {"Content-Type": "application/json"} if body is not None else {}
    for attempt in range(30):
        try:
            with urlopen(Request(BASE + path, data=body, headers=headers), timeout=90) as response:
                raw = response.read()
                if "application/json" in response.headers.get("Content-Type", ""):
                    return json.loads(raw)
                return raw.decode("utf-8")
        except HTTPError as error:
            # A completed report may still be finishing its atomic persistence
            # write before releasing the shared compute slot.
            if error.code != 409 or payload is None or attempt == 29:
                raise
            time.sleep(0.1)


def completed_job(path: str, payload: dict, *, timeout: int = 180):
    receipt = request(path, payload)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = request(path + "/" + receipt["job_id"])
        if job["state"] == "complete":
            return job["result"]
        if job["state"] == "failed":
            raise AssertionError(job.get("error"))
        time.sleep(0.25)
    raise AssertionError(f"Compute job did not complete within {timeout} seconds")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mpi", action="store_true")
    args = parser.parse_args()
    if hasattr(os, "geteuid"):
        assert os.geteuid() != 0, "The runtime must execute as a non-root user"

    request("/api/health")
    status = request("/api/status")
    assert status["native_available"], status
    catalog = request("/api/catalog?page_size=1")
    assert catalog["total"] >= 70_000 and catalog["items"], "Bundled catalog missing"
    html = request("/")
    assets = re.findall(r'(?:src|href)="(/assets/[^\"]+)"', html)
    assert any(path.endswith(".js") for path in assets), "Compiled TypeScript bundle missing"
    for asset in assets:
        assert request(asset), f"Empty or unavailable frontend asset: {asset}"
    print("Packaged TypeScript UI, catalog, and native-engine readiness passed.", flush=True)

    fit = request("/api/analyze", {"star_id": STAR, "samples": 200, "threads": 2})
    assert fit["n_observations"] > 100 and fit["period_days"] > 0
    assert fit["source_url"] and fit["time_system"] == "HJD"
    process_report = completed_job("/api/cluster/jobs", {
        "star_id": STAR, "workers": 4, "tasks": 12,
        "samples": 400, "observations_limit": 600,
    })
    assert process_report["same_task_results"], "Process results differ from identical serial work"
    assert len(process_report["worker_pids"]) >= 2, "No actual parallel worker execution"
    assert process_report["data_source"] == "bundled"
    print(f"Native fit P={fit['period_days']:.3f} days; process worker PIDs={process_report['worker_pids']}.", flush=True)

    simulation = request("/api/simulation", {"cycles": 4, "steps_per_cycle": 128})
    assert len(simulation["times_days"]) == len(simulation["displacement"]) > 100
    assert all(math.isfinite(value) for value in simulation["displacement"])
    assert simulation["convergence"]["refinement_ratio"] == 2
    assert math.isfinite(simulation["convergence"]["energy_balance_error"])
    assert simulation["computation"]["derivative_evaluations"] > 0
    research = completed_job("/api/research/jobs", {
        "star_id": STAR, "min_period": 60, "max_period": 140,
        "samples": 120, "observations_limit": 400, "threads": 1,
    })
    assert len(research["models"]) == 3 and research["holdout_observations"] > 0
    assert math.isfinite(research["selected_model"]["holdout_weighted_rmse_mag"])
    assert research["computation"]["frequency_scans"] >= 4
    assert research["computation"]["native_seconds"] > 0
    assert research["provenance"]["source_url"] and research["provenance"]["time_system"] == "HJD"
    print("Native RK4 convergence and measured-data hypothesis research passed.", flush=True)

    transforms = completed_job("/api/transforms/jobs", {
        "star_id": STAR, "min_period": 60, "max_period": 140,
        "frequency_samples": 32, "drift_samples": 5, "time_samples": 8,
        "surrogates": 4, "workers": 2, "observations_limit": 120,
    })
    assert len(transforms["chirp"]["powers"]) == 5
    assert len(transforms["localized"]["powers"]) == 8
    assert sum(transforms["structure_function"]["pair_counts"]) > 0
    assert transforms["ensemble"]["task_count"] == 8
    assert transforms["computation"]["native_seconds"] > 0
    print("Frequency/drift, localized, phase-dispersion, pairwise and real ensemble transforms passed.", flush=True)

    curve = request(f"/api/stars/{STAR}/lightcurve")
    csv_text = "time_jd,magnitude,error_mag\n" + "\n".join(
        f"{row['time_jd']},{row['magnitude']},{row['error_mag']}"
        for row in curve["observations"][:60]
    )
    uploaded = request("/api/datasets", {
        "name": "Container smoke: subset of real bundled OGLE measurements",
        "csv_text": csv_text, "time_system": "HJD", "band": "I",
    })
    restored = request("/api/datasets/" + uploaded["dataset_id"])
    assert restored["observations_count"] == 60
    assert restored["data_source"] == "user_upload"
    print("User-observation imports persist in the writable workspace volume.", flush=True)

    cache_dir = Path(os.environ.get("THOTH_CACHE_DIR", tempfile.gettempdir()))
    with tempfile.NamedTemporaryFile(dir=cache_dir):
        pass
    if args.mpi:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "mpi.json"
            subprocess.run([
                "mpiexec", "--oversubscribe", "-n", "2", sys.executable,
                "-m", "thoth.cluster", "--mpi", "--tasks", "4",
                "--samples", "100", "--observations-limit", "300",
                "--output", str(output),
            ], check=True, timeout=120)
            report = json.loads(output.read_text(encoding="utf-8"))
            assert report["mpi_size"] == 2 and report["same_task_results"]
            assert {node["mpi_rank"] for node in report["node_results"]} == {0, 1}
            print("Two real MPI ranks completed identical native work; writable cache passed.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
