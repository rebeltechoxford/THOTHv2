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
from urllib.parse import quote, urlencode
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


def completed_job(path: str, payload: dict, *, timeout: int = 180, return_id: bool = False):
    receipt = request(path, payload)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = request(path + "/" + receipt["job_id"])
        if job["state"] == "complete":
            return (job["result"], receipt["job_id"]) if return_id else job["result"]
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

    atlas = request("/api/space")
    assert atlas["counts"]["catalog_entries"] == catalog["total"]
    assert len(atlas["stars"]) == len(atlas["positions"]) == len(atlas["galactic_positions"]) == catalog["total"]
    assert sum(group["count"] for group in atlas["groups"]) == catalog["total"]
    assert sum(cell["count"] for cell in atlas["density_cells"]) == atlas["counts"]["mapped_entries"]
    assert atlas["geometry"]["distance_unit"] is None
    assert len(atlas["provenance"]["catalog_snapshot_sha256"]) == 64
    assert atlas["computation"]["coordinate_evaluations"] >= catalog["total"]
    print(f"Complete 3D angular atlas retains {catalog['total']} catalog entries and source provenance.", flush=True)

    models = [request("/api/space/star", {"star_id": STAR, "phase": 0.25,
        "resolution": 12, "radius_fraction": fraction, "contrast": 0}) for fraction in (0, 1)]
    for model in models:
        assert model["photometry_status"] == "available"
        assert model["provenance"]["photometry"]["data_source"] == "bundled"
        mesh, family = model["mesh"], model["radiative_family"]
        assert len(mesh["positions"]) == len(mesh["normals"]) == 3 * mesh["vertex_count"]
        assert len(mesh["indices"]) == 3 * mesh["triangle_count"]
        assert all(math.isfinite(value) for value in mesh["positions"])
        radius = model["selected_model"]["radius_relative"]
        assert math.isclose(mesh["minimum_radius"], radius, rel_tol=1e-12)
        assert math.isclose(mesh["maximum_radius"], radius, rel_tol=1e-12)
        assert model["geometry"]["physical_radius"] is None
        assert len(family["radii_relative"]) == len(family["temperatures_k"]) == len(family["phases"]) == 301
        assert all(math.isclose(actual, reconstructed, rel_tol=1e-11, abs_tol=1e-12)
            for actual, reconstructed in zip(family["relative_fluxes"], family["reconstructed_fluxes"]))
        assert [prediction["label"] for prediction in family["counterfactual_predictions"]] == ["V", "I", "K"]
    assert models[0]["relative_flux_at_phase"] == models[1]["relative_flux_at_phase"]
    assert math.isclose(models[0]["selected_model"]["radius_relative"], 1, rel_tol=1e-12)
    assert math.isclose(models[1]["selected_model"]["temperature_k"], 3000, rel_tol=1e-12)
    first_k, second_k = (model["radiative_family"]["counterfactual_predictions"][2]["relative_fluxes"] for model in models)
    assert max(abs(first-second) for first, second in zip(first_k, second_k)) > 0.001
    print("Distinct native 3D radius/temperature families reproduce measured flux and predict different unmeasured K curves.", flush=True)

    from thoth.astrometry import BUNDLED
    snapshot = json.loads(BUNDLED.read_text(encoding="utf-8"))
    assert snapshot["release"] == "Gaia DR3" and snapshot["items"]
    target = next(record for record in snapshot["items"] if any(candidate["distance_usable"] for candidate in record["candidates"]))
    evidence = request("/api/space/evidence/" + quote(target["star_id"], safe="") + "?" +
                       urlencode({"radius_arcsec": target["cone_radius_arcsec"]}))
    assert evidence["response_sha256"] == target["response_sha256"]
    assert evidence["adql_query"] == target["adql_query"] and len(evidence["response_sha256"]) == 64
    assert evidence["association_status"] == "unconfirmed_position_candidates"
    candidate = next(row for row in evidence["candidates"] if row["distance_usable"])
    posterior = request("/api/space/distance", {"parallax_mas": candidate["parallax"],
        "parallax_error_mas": candidate["parallax_error"], "samples": 256})
    assert 0 < posterior["p16_pc"] < posterior["median_pc"] < posterior["p84_pc"] < posterior["upper_bound_pc"]
    assert posterior["cumulative_probability"][-1] == 1
    assert posterior["posterior_evaluations"] > 0 and posterior["native_seconds"] > 0
    spatial = request("/api/space/astrometry")
    assert spatial["total"] > 0
    assert all(item["association_status"] == "unconfirmed_position_candidates" for item in spatial["items"])
    absent = request("/api/space/star", {"star_id": "GCVS:omi Cet", "resolution": 12})
    assert absent["photometry_status"] == "unavailable" and absent["fit"] is None
    assert absent["radiative_family"] is None and absent["relative_flux_at_phase"] is None
    print("Offline acquired Gaia receipt, conditional native distance posterior, and explicit missing-photometry handling passed.", flush=True)

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

    transforms, transform_id = completed_job("/api/transforms/jobs", {
        "star_id": STAR, "min_period": 60, "max_period": 140,
        "frequency_samples": 32, "drift_samples": 5, "time_samples": 8,
        "surrogates": 4, "workers": 2, "observations_limit": 120,
    }, return_id=True)
    assert len(transforms["chirp"]["powers"]) == 5
    assert len(transforms["localized"]["powers"]) == 8
    assert sum(transforms["structure_function"]["pair_counts"]) > 0
    assert transforms["ensemble"]["task_count"] == 8
    assert transforms["computation"]["native_seconds"] > 0
    surface = request(f"/api/space/surfaces/{transform_id}?kind=chirp")
    assert surface["mesh"]["grid_rows"] == 5 and surface["mesh"]["grid_columns"] == 32
    assert surface["powers"] == transforms["chirp"]["powers"]
    assert surface["mesh"]["triangle_count"] > 0
    assert all(math.isfinite(value) for value in surface["mesh"]["positions"])
    assert surface["axes"]["x"]["values"] == transforms["chirp"]["frequencies"]
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
