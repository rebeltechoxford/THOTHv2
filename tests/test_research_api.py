"""Validate imported evidence, persistent reports and exclusive compute dispatch."""
import hashlib
import math
import re
import threading
import time

import pytest
from fastapi.testclient import TestClient

from thoth import datasets, server


def observation_csv(bands=("I",), offset=2_450_000):
    lines = ["time_jd,magnitude,error_mag,band"]
    for index in range(60):
        lines.append(f"{offset + index * 20},{14 + math.sin(index / 3):.8f},0.05,{bands[index % len(bands)]}")
    return "\n".join(lines)


@pytest.fixture
def client(monkeypatch, tmp_path):
    monkeypatch.setenv("THOTH_WORKSPACE_DIR", str(tmp_path))
    monkeypatch.setattr(server, "_research_jobs", {})
    monkeypatch.setattr(server, "_research_jobs_lock", threading.Lock())
    monkeypatch.setattr(server, "_compute_slot", threading.Lock())
    with TestClient(server.app) as connection:
        yield connection


def test_import_preserves_provenance_and_selects_a_single_band(client):
    text = observation_csv(("I", "V"))
    response = client.post("/api/datasets", json={"name": "My candidate", "csv_text": text,
                                                  "time_system": "HJD", "band": "I"})
    assert response.status_code == 201, response.text
    metadata = response.json()
    assert metadata["observations_count"] == 30
    assert metadata["excluded_other_bands"] == 30
    assert metadata["sha256"] == hashlib.sha256(text.encode()).hexdigest()
    stored = client.get(f"/api/datasets/{metadata['dataset_id']}").json()
    assert stored["time_system"] == "HJD"
    assert {row["band"] for row in stored["observations"]} == {"I"}
    assert stored["observations"][0]["time_jd"] == 2_450_000
    # A fresh filesystem read proves it is not just an in-memory upload.
    assert datasets.read_record("datasets", metadata["dataset_id"]) == stored
    inventory = client.get("/api/datasets").json()
    assert inventory["total"] == 1 and inventory["items"][0]["dataset_id"] == metadata["dataset_id"]
    assert "observations" not in inventory["items"][0]
    assert client.get("/api/datasets/..%2Fprivate").status_code == 404


@pytest.mark.parametrize("replacement", [{"time_system": "UTC"}, {"band": " "},
    {"csv_text": observation_csv(offset=50_000)}, {"csv_text": "time_jd,magnitude,error_mag\n2450000,14,0"},
    {"csv_text": observation_csv().replace("0.05", "nan", 1)}])
def test_import_rejects_ambiguous_or_invalid_evidence(client, replacement):
    body = {"name": "Candidate", "csv_text": observation_csv(), "time_system": "BJD", "band": "I"}
    assert client.post("/api/datasets", json={**body, **replacement}).status_code == 422


def test_research_job_reports_progress_and_survives_process_history_loss(client, monkeypatch):
    from thoth import research
    entered, release = threading.Event(), threading.Event()

    def investigate(curve, **settings):
        assert curve["data_source"] == "user_upload"
        settings["progress"]({"stage": "comparison", "percent": 40})
        entered.set()
        assert release.wait(5)
        return {"selected_model": {"period_days": 300}, "provenance": {"sha256": curve["sha256"]}}

    monkeypatch.setattr(research, "investigate_lightcurve", investigate)
    imported = client.post("/api/datasets", json={"name": "Candidate", "csv_text": observation_csv(),
                                                  "time_system": "JD", "band": "I"}).json()
    started = client.post("/api/research/jobs", json={"dataset_id": imported["dataset_id"]})
    assert started.status_code == 202
    identifier = started.json()["job_id"]
    try:
        assert entered.wait(5)
        assert client.get(f"/api/research/jobs/{identifier}").json()["progress"]["percent"] == 40
        assert client.post("/api/cluster/jobs", json={"tasks": 2}).status_code == 409
        assert client.post("/api/simulation", json={}).status_code == 409
        assert client.post("/api/analyze", json={"star_id": "OGLE-BLG-LPV-096697"}).status_code == 409
    finally:
        release.set()
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and server._compute_slot.locked():
        time.sleep(0.005)
    assert not server._compute_slot.locked()
    result = client.get(f"/api/research/jobs/{identifier}").json()
    assert result["state"] == "complete", result
    server._research_jobs.clear()
    saved = client.get(f"/api/research/jobs/{identifier}").json()
    assert saved["result"] == result["result"]
    assert saved["result"]["request"]["dataset_id"] == imported["dataset_id"]


@pytest.mark.parametrize("body", [{}, {"star_id": "x", "dataset_id": "a" * 32},
    {"star_id": "OGLE-BLG-LPV-096697", "min_period": 400, "max_period": 100},
    {"star_id": "OGLE-BLG-LPV-096697", "samples": 3001}])
def test_invalid_research_requests_do_not_take_compute_slot(client, body):
    assert client.post("/api/research/jobs", json=body).status_code == 422
    assert not server._compute_slot.locked()


def test_simulation_api_returns_real_convergence_diagnostics(client):
    response = client.post("/api/simulation", json={"cycles": 3, "steps_per_cycle": 100})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["computation"]
    assert result["convergence"]["max_displacement_difference"] < 0.001
    assert result["model_kind"]
    assert not server._compute_slot.locked()


def test_packaged_frontend_module_mime_is_valid_even_on_windows(client):
    response = client.get("/")
    assert response.status_code == 200
    scripts = re.findall(r'src="(/assets/[^\"]+\.js)"', response.text)
    assert scripts, "Build the TypeScript interface before validating packaged assets."
    for path in scripts:
        asset = client.get(path)
        assert asset.status_code == 200
        assert asset.headers["content-type"].startswith("application/javascript")


def test_nonfinite_research_report_is_explicit_failure_not_an_unreadable_job(client, monkeypatch):
    from thoth import research
    monkeypatch.setattr(research, "investigate_lightcurve", lambda *args, **kwargs: {"score": float("inf")})
    receipt = client.post("/api/research/jobs", json={"star_id": "OGLE-BLG-LPV-096697"})
    identifier = receipt.json()["job_id"]
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and server._compute_slot.locked():
        time.sleep(0.005)
    response = client.get(f"/api/research/jobs/{identifier}")
    assert response.status_code == 200
    assert response.json()["state"] == "failed"
    assert response.json()["result"] is None
