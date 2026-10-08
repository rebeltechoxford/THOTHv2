"""Validate observing HTTP inputs and real, offline coordinate transformations."""
import json
import math

import pytest
from fastapi.testclient import TestClient

from thoth import server


@pytest.fixture
def client():
    with TestClient(server.app) as connection:
        yield connection


def request_payload(**changes):
    return {"star_id": "GCVS:omi Cet", "latitude_deg": 34.365,
            "longitude_deg": -89.538, "elevation_m": 152.4,
            "time_utc": "2024-10-08T05:00:00Z", **changes}


def test_initial_site_is_labeled_as_approximate(client):
    result = client.get("/api/observing/defaults").json()
    assert result["location"]["label"] == "University, MS 38677"
    assert result["location"]["approximate"] is True
    assert result["location"]["longitude_deg"] < 0
    assert "actual telescope site" in result["location"]["note"]
    assert server.get_star(result["example_star_id"]) is not None


def test_real_catalog_target_returns_finite_local_sky_path(client):
    response = client.post("/api/observing/target", json=request_payload())
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["star_id"] == "GCVS:omi Cet"
    assert -90 <= result["altitude_deg"] <= 90
    assert 0 <= result["azimuth_deg"] < 360
    assert 0 <= result["ra_topocentric_hours"] < 24
    assert math.isfinite(result["sun_separation_deg"])
    assert len(result["trajectory"]) == 49
    assert result["trajectory"][0]["altitude_deg"] == pytest.approx(result["altitude_deg"])
    assert result["earth_orientation"]["status"] in {"definitive", "predicted", "degraded"}
    json.dumps(result, allow_nan=False)


@pytest.mark.parametrize("changes", [
    {"latitude_deg": 91}, {"longitude_deg": -181}, {"elevation_m": 10001},
    {"minimum_altitude_deg": -1}, {"duration_hours": 25}, {"samples": 98},
    {"time_utc": "2024-10-08T05:00:00"}, {"time_utc": "not-a-date"},
    {"latitude_deg": True}, {"duration_hours": True}, {"samples": 49.0},
    {"latitude_deg": "34.365"}, {"unexpected": "ignored fields would hide mistakes"},
])
def test_invalid_observer_or_time_is_rejected(client, changes):
    assert client.post("/api/observing/target", json=request_payload(**changes)).status_code == 422


def test_unknown_target_is_not_replaced_by_example(client):
    response = client.post("/api/observing/target", json=request_payload(star_id="missing star"))
    assert response.status_code == 404


@pytest.mark.parametrize("invalid", ["NaN", "Infinity", "-Infinity"])
def test_nonfinite_json_input_returns_a_finite_validation_response(client, invalid):
    payload = json.dumps(request_payload()).replace('"latitude_deg": 34.365', '"latitude_deg": ' + invalid)
    response = client.post("/api/observing/target", content=payload,
                           headers={"content-type": "application/json"})
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert errors[0]["loc"] == ["body", "latitude_deg"]
    assert all("input" not in error for error in errors)
    json.dumps(response.json(), allow_nan=False)


def test_unavailable_earth_transform_reports_service_error(client, monkeypatch):
    from thoth import observing

    def unavailable(*args, **kwargs):
        raise RuntimeError("Earth orientation data are unavailable.")

    monkeypatch.setattr(observing, "observing_target", unavailable)
    response = client.post("/api/observing/target", json=request_payload())
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]
