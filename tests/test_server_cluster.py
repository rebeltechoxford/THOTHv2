"""Controlled API job orchestration; real processes are covered separately."""
import threading
import time

from fastapi.testclient import TestClient
import pytest

from thoth import cluster, server
from thoth.catalog import EXAMPLE_STAR_ID


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(server, "_jobs", {})
    monkeypatch.setattr(server, "_jobs_lock", threading.Lock())
    monkeypatch.setattr(server, "_compute_slot", threading.Lock())
    monkeypatch.setattr(server, "native_status", lambda: {"native_available": True})
    with TestClient(server.app) as test_client:
        yield test_client


def wait_for_job(client, job_id, expected):
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        response = client.get(f"/api/cluster/jobs/{job_id}")
        assert response.status_code == 200
        job = response.json()
        if job["state"] == expected and (expected not in {"complete", "failed"}
                                         or not server._compute_slot.locked()):
            return job
        time.sleep(0.002)
    pytest.fail(f"Job {job_id} did not reach state {expected!r}; last state: {job['state']}")


def test_cluster_job_progress_lifecycle_and_busy_rejection(client, monkeypatch):
    entered, release = threading.Event(), threading.Event()
    calls = []

    def controlled_runner(**settings):
        calls.append(settings)
        settings["progress"]({"state": "running", "stage": "serial", "completed": 1, "total": 2})
        entered.set()
        assert release.wait(5), "Test did not release controlled runner"
        settings["progress"]({"state": "completed", "stage": "complete", "completed": 2, "total": 2})
        return {"same_task_results": True, "execution": "controlled runner"}

    monkeypatch.setattr(cluster, "run_cluster_experiment", controlled_runner)
    response = client.post("/api/cluster/jobs", json={"star_id": EXAMPLE_STAR_ID, "workers": 2, "tasks": 2})
    assert response.status_code == 202
    job_id = response.json()["job_id"]
    try:
        assert entered.wait(5)
        running = client.get(f"/api/cluster/jobs/{job_id}").json()
        assert running["state"] == "running"
        assert running["progress"]["stage"] == "serial"
        assert running["events"][0]["elapsed_seconds"] >= 0
        busy = client.post("/api/cluster/jobs", json={"tasks": 2})
        assert busy.status_code == 409
        assert "already running" in busy.json()["detail"]
    finally:
        release.set()
    completed = wait_for_job(client, job_id, "complete")
    assert completed["error"] is None
    assert completed["result"]["same_task_results"] is True
    assert completed["result"]["workers"] == 2 and completed["result"]["tasks"] == 2
    assert completed["progress"]["stage"] == "complete"
    assert len(calls) == 1
    assert server._compute_slot.acquire(blocking=False)
    server._compute_slot.release()


def test_cluster_runner_failure_is_visible_and_releases_compute_slot(client, monkeypatch):
    def failed_runner(**settings):
        raise RuntimeError("Measured archive unavailable")

    monkeypatch.setattr(cluster, "run_cluster_experiment", failed_runner)
    started = client.post("/api/cluster/jobs", json={"tasks": 2})
    assert started.status_code == 202
    failed = wait_for_job(client, started.json()["job_id"], "failed")
    assert failed["error"] == "Measured archive unavailable"
    assert failed["result"] is None
    next_job = client.post("/api/cluster/jobs", json={"tasks": 2})
    assert next_job.status_code == 202
    wait_for_job(client, next_job.json()["job_id"], "failed")


@pytest.mark.parametrize("settings", [{"workers": 0}, {"workers": 9}, {"tasks": 1},
                                     {"tasks": 49}, {"samples": 49}, {"samples": 1201},
                                     {"observations_limit": 49}, {"observations_limit": 3001}])
def test_cluster_resource_constraints_fail_before_dispatch(client, monkeypatch, settings):
    def unexpected_runner(**options):
        pytest.fail("Invalid request dispatched a cluster runner")

    monkeypatch.setattr(cluster, "run_cluster_experiment", unexpected_runner)
    response = client.post("/api/cluster/jobs", json=settings)
    assert response.status_code == 422
    assert not server._jobs
    assert not server._compute_slot.locked()


def test_unknown_cluster_star_job_and_missing_engine_are_explicit(client, monkeypatch):
    assert client.get("/api/cluster/jobs/unknown-job").status_code == 404
    assert client.post("/api/cluster/jobs", json={"star_id": "unknown-star"}).status_code == 404
    monkeypatch.setattr(server, "native_status", lambda: {"native_available": False})
    response = client.post("/api/cluster/jobs", json={"tasks": 2})
    assert response.status_code == 503
    assert "native engine" in response.json()["detail"]
    assert not server._compute_slot.locked()
