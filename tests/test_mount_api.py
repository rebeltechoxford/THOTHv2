"""Independent router tests never contact a physical device."""
import threading

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from thoth.mount_api import create_mount_router
from thoth.mounts import MountController, MountError, SimulatorMount


class PhysicalFake(SimulatorMount):
    id = "physical"
    simulated = False
    def status(self):
        result = super().status()
        result["capabilities"]["does_refraction"] = True
        result["mount_utc_timestamp"] = 1_800_000_000.0
        return result


@pytest.fixture
def rig():
    clock = [1_800_000_000.0]
    def observed(star, **kwargs):
        return {"star_id": star["id"], "star_name": "Mira", "mount_ready": True,
            "tracking_allowed": True, "reasons": [], "altitude_deg": 50, "azimuth_deg": 100,
            "ra_j2000_hours": 2.0, "dec_j2000_deg": -3.0,
            "ra_topocentric_hours": 2.04, "dec_topocentric_deg": -2.8}
    controller = MountController(adapters={"simulator": SimulatorMount(), "physical": PhysicalFake()},
        control_token="mount-secret", clock=lambda: clock[0], monotonic_clock=lambda: clock[0],
        target_lookup=lambda key: {"id": key} if key == "Mira" else None, pointing=observed)
    app = FastAPI()
    app.include_router(create_mount_router(controller))
    with TestClient(app) as client:
        yield client, controller, clock


SITE = {"star_id": "Mira", "latitude_deg": 34.365, "longitude_deg": -89.538, "elevation_m": 152.4}
AUTH = {"X-THOTH-Mount-Token": "mount-secret"}


def activate(client, adapter="simulator", headers=None):
    assert client.post("/api/mounts/connect", json={"adapter_id": adapter}, headers=headers).status_code == 200
    assert client.post("/api/mounts/arm", json={"aligned_ack": True}, headers=headers).status_code == 200
    response = client.post("/api/mounts/plan", json=SITE)
    assert response.status_code == 200, response.text
    return response.json()


def test_router_simulator_happy_path_exposes_azimuth_and_real_state(rig):
    client, controller, _ = rig
    assert client.get("/api/mounts").json()["active_adapter_id"] == "simulator"
    result = activate(client)
    assert result["allowed"] and result["target"]["azimuth_deg"] == 100
    assert result["coordinate_system"] == "J2000" and result["target_ra_hours"] == 2
    response = client.post("/api/mounts/track", json={"plan_id": result["plan_id"]})
    assert response.status_code == 200
    assert response.json()["simulated"] and response.json()["tracking"]
    assert response.json()["lease_until"]
    assert client.post("/api/mounts/heartbeat", json={}).status_code == 200
    stopped = client.post("/api/mounts/stop", json={}).json()
    assert not stopped["tracking"] and not stopped["slewing"]
    assert stopped["target"] is None and not stopped["stop_errors"]
    assert client.post("/api/mounts/disconnect", json={}).json()["connected"] is False


def test_hardware_token_never_returned_and_protects_all_mutations(rig):
    client, controller, _ = rig
    assert client.post("/api/mounts/connect", json={"adapter_id": "physical"}).status_code == 403
    result = activate(client, "physical", AUTH)
    assert "mount-secret" not in client.get("/api/mounts").text
    assert "mount-secret" not in client.get("/api/mounts/status").text
    for path, body in (("arm", {"aligned_ack": True}), ("track", {"plan_id": result["plan_id"]}),
                       ("heartbeat", {}), ("stop", {}), ("disconnect", {}),
                       ("connect", {"adapter_id": "simulator"})):
        assert client.post("/api/mounts/" + path, json=body).status_code == 403
    assert client.post("/api/mounts/track", json={"plan_id": result["plan_id"]}, headers=AUTH).status_code == 200
    assert client.post("/api/mounts/stop", json={}, headers=AUTH).status_code == 200


@pytest.mark.parametrize("path,body", [("connect", {"adapter_id": "unregistered"}),
    ("connect", {"adapter_id": "simulator", "base_url": "http://arbitrary.test"}),
    ("arm", {"aligned_ack": "true"}), ("arm", {"aligned_ack": 1}),
    ("plan", {**SITE, "latitude_deg": True}), ("plan", {**SITE, "longitude_deg": 181}),
    ("plan", {**SITE, "elevation_m": 10001}), ("plan", {**SITE, "minimum_altitude_deg": 86}),
    ("plan", {**SITE, "latitude_deg": "34.3"}), ("track", {"plan_id": ""})])
def test_invalid_requests_are_rejected_without_motion(rig, path, body):
    client, controller, _ = rig
    response = client.post("/api/mounts/" + path, json=body)
    assert response.status_code == 422
    assert not controller.adapter.calls


def test_nonfinite_json_site_is_rejected(rig):
    client, controller, _ = rig
    response = client.post("/api/mounts/plan", content='{"star_id":"Mira","latitude_deg":NaN,"longitude_deg":0}',
                           headers={"content-type": "application/json"})
    assert response.status_code == 422 and not controller.adapter.calls


def test_missing_star_returns_404(rig):
    client, _, _ = rig
    response = client.post("/api/mounts/plan", json={**SITE, "star_id": "missing"})
    assert response.status_code == 404


def test_planning_is_readonly_and_disconnected_plan_explains_block(rig):
    client, controller, _ = rig
    response = client.post("/api/mounts/plan", json=SITE)
    assert response.status_code == 200
    assert not response.json()["allowed"]
    assert any("Connect" in reason for reason in response.json()["reasons"])
    assert controller.adapter.calls == []


def test_expired_plan_http_409_and_no_replay(rig):
    client, controller, clock = rig
    result = activate(client)
    clock[0] += 16
    response = client.post("/api/mounts/track", json={"plan_id": result["plan_id"]})
    assert response.status_code == 409
    assert not controller.adapter.tracking


def test_adapter_status_error_maps_to_502(rig, monkeypatch):
    client, controller, _ = rig
    def failed():
        raise MountError("Protocol status unavailable.", 502)
    monkeypatch.setattr(controller.adapter, "status", failed)
    response = client.get("/api/mounts/status")
    assert response.status_code == 502 and response.json()["detail"] == "Protocol status unavailable."


def test_stop_reports_each_failed_operation_without_claiming_hardware_stopped(rig, monkeypatch):
    client, controller, _ = rig
    result = activate(client)
    client.post("/api/mounts/track", json={"plan_id": result["plan_id"]})
    def failed():
        raise MountError("Mock abort failed.", 502)
    monkeypatch.setattr(controller.adapter, "abort", failed)
    result = client.post("/api/mounts/stop", json={}).json()
    assert result["stop_errors"] and result["fault"]
    assert not result["tracking"]


def test_concurrent_controller_request_is_rejected(rig):
    client, controller, _ = rig
    held = threading.Event()
    release = threading.Event()
    def occupy():
        with controller.lock:
            held.set()
            release.wait(2)
    thread = threading.Thread(target=occupy)
    thread.start()
    assert held.wait(1)
    try:
        response = client.post("/api/mounts/connect", json={"adapter_id": "simulator"})
        assert response.status_code == 409
        assert not controller.adapter.calls
    finally:
        release.set()
        thread.join()


def test_app_shutdown_stops_its_active_tracking_lease():
    controller = MountController(pointing=lambda star, **kwargs: {"mount_ready": True,
        "tracking_allowed": True, "reasons": [], "ra_j2000_hours": 1, "dec_j2000_deg": 2},
        target_lookup=lambda key: {"id": key})
    app = FastAPI()
    app.include_router(create_mount_router(controller))
    with TestClient(app) as client:
        result = activate(client)
        client.post("/api/mounts/track", json={"plan_id": result["plan_id"]})
        assert controller.adapter.tracking
    assert not controller.adapter.tracking
    assert controller._shutdown.is_set()
