"""The transform service must preserve evidence and release its compute reservation."""
import json
import threading
import time

import pytest
from fastapi.testclient import TestClient

from thoth import datasets, server


STAR = "OGLE-BLG-LPV-096697"


@pytest.fixture
def client(monkeypatch, tmp_path):
    monkeypatch.setenv("THOTH_WORKSPACE_DIR", str(tmp_path))
    monkeypatch.setattr(server, "_transform_jobs", {})
    monkeypatch.setattr(server, "_transform_jobs_lock", threading.Lock())
    monkeypatch.setattr(server, "_compute_slot", threading.Lock())
    with TestClient(server.app) as connection:
        yield connection


def await_completion(client, identifier):
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline and server._compute_slot.locked():
        time.sleep(0.01)
    assert not server._compute_slot.locked(), "Transform did not release its reservation"
    return client.get(f"/api/transforms/jobs/{identifier}").json()


@pytest.mark.parametrize("body", [{}, {"star_id": STAR, "dataset_id": "a" * 32},
    {"star_id": STAR, "min_period": 200, "max_period": 100},
    {"star_id": STAR, "frequency_samples": 385}, {"star_id": STAR, "surrogates": 65},
    {"star_id": STAR, "drift_cycles": "nan"}, {"star_id": STAR, "seed": -1},
    {"star_id": STAR, "surrogates": 0}, {"star_id": STAR, "drift_samples": 4}])
def test_invalid_settings_never_reserve_compute(client, body):
    assert client.post("/api/transforms/jobs", json=body).status_code == 422
    assert not server._compute_slot.locked()


def test_saved_transforms_survive_session_loss_and_exclude_concurrent_work(client, monkeypatch):
    from thoth import transforms
    entered, release = threading.Event(), threading.Event()

    def run(curve, **settings):
        assert curve["data_source"] == "user_upload"
        settings["progress"]({"stage": "chirp", "percent": 20, "detail": "Testing a changing frequency"})
        entered.set()
        assert release.wait(5)
        return {"provenance": {"input_sha256": curve["sha256"]}, "chirp": {"powers": [[0.25, None]]}}

    monkeypatch.setattr(transforms, "run_transform_lab", run)
    text = "time_jd,magnitude,error_mag,band\n" + "\n".join(
        f"{2450000 + index * 20},{14 + index / 100},0.05,I" for index in range(60))
    record = datasets.import_dataset("Transform evidence", text, "HJD", "I")
    receipt = client.post("/api/transforms/jobs", json={"dataset_id": record["dataset_id"]})
    assert receipt.status_code == 202, receipt.text
    identifier = receipt.json()["job_id"]
    try:
        assert entered.wait(5)
        active = client.get(f"/api/transforms/jobs/{identifier}").json()
        assert active["state"] == "running" and active["progress"]["stage"] == "chirp"
        assert client.post("/api/transforms/jobs", json={"star_id": STAR}).status_code == 409
        assert client.post("/api/research/jobs", json={"star_id": STAR}).status_code == 409
        assert client.post("/api/simulation", json={}).status_code == 409
    finally:
        release.set()
    finished = await_completion(client, identifier)
    assert finished["state"] == "complete", finished
    server._transform_jobs.clear()
    assert client.get(f"/api/transforms/jobs/{identifier}").json()["result"] == finished["result"]
    assert client.get("/api/transforms/jobs/" + "b" * 32).status_code == 404


@pytest.mark.parametrize("report", [{"invalid": float("inf")}, {"invalid": float("nan")}])
def test_unserializable_reports_fail_and_release_compute(client, monkeypatch, report):
    from thoth import transforms
    monkeypatch.setattr(transforms, "run_transform_lab", lambda *args, **kwargs: report)
    receipt = client.post("/api/transforms/jobs", json={"star_id": STAR})
    assert receipt.status_code == 202
    finished = await_completion(client, receipt.json()["job_id"])
    assert finished["state"] == "failed" and finished["result"] is None


def test_measured_curve_runs_all_native_transforms_through_api(client):
    receipt = client.post("/api/transforms/jobs", json={
        "star_id": STAR, "min_period": 80, "max_period": 110, "frequency_samples": 32,
        "drift_samples": 5, "time_samples": 8, "surrogates": 2, "workers": 1,
        "observations_limit": 120, "harmonics": 1,
    })
    assert receipt.status_code == 202, receipt.text
    finished = await_completion(client, receipt.json()["job_id"])
    assert finished["state"] == "complete", finished
    result = finished["result"]
    assert len(result["chirp"]["powers"]) == 5
    assert len(result["localized"]["powers"]) == 8
    assert len(result["structure_function"]["pair_counts"]) > 0
    assert result["computation"]["native_seconds"] > 0
    assert result["ensemble"]["task_count"] == 4
    json.dumps(result, allow_nan=False)
