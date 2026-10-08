"""Horizontal conventions, time handling, offline receipts and motion gates."""
from datetime import datetime, timedelta, timezone
import json
import math

import astropy.utils.data
from astropy.utils import iers
import pytest

from thoth.observing import _gate, observing_target


STAR = {"id": "geometry-fixture", "name": "Synthetic fixed direction",
        "ra_deg": 83.6331, "dec_deg": 22.0145,
        "source_url": "synthetic://horizontal-geometry", "catalog": "Test fixture"}
DATE = "2024-01-01T06:00:00Z"


def observe(star=None, **kwargs):
    defaults = {"latitude_deg": 34.365, "longitude_deg": -89.538,
                "elevation_m": 152.4, "when": DATE, "duration_hours": 0.5, "samples": 13}
    defaults.update(kwargs)
    return observing_target(STAR if star is None else star, **defaults)


def spherical_horizontal(latitude_deg, declination_deg, hour_angle_hours):
    """Independent equatorial-to-horizontal spherical rotation, east of north."""
    phi, dec, hour = map(math.radians, (latitude_deg, declination_deg, hour_angle_hours * 15))
    altitude = math.asin(math.sin(phi) * math.sin(dec) + math.cos(phi) * math.cos(dec) * math.cos(hour))
    east = -math.cos(dec) * math.sin(hour)
    north = math.sin(dec) * math.cos(phi) - math.cos(dec) * math.sin(phi) * math.cos(hour)
    return math.degrees(altitude), math.degrees(math.atan2(east, north)) % 360


@pytest.mark.parametrize("latitude,longitude,ra,dec", [
    (34.365, -89.538, 83.6331, 22.0145),
    (0, 0, 0, -35),
    (-45, 179, 280, 60),
    (65, -120, 155, -20),
])
def test_horizontal_agrees_with_independent_hour_angle_rotation(latitude, longitude, ra, dec):
    result = observe({**STAR, "ra_deg": ra, "dec_deg": dec},
                     latitude_deg=latitude, longitude_deg=longitude)
    altitude, azimuth = spherical_horizontal(latitude, result["dec_topocentric_deg"], result["hour_angle_hours"])
    # Spherical geometry omits polar motion, which the Astropy model includes.
    assert result["altitude_deg"] == pytest.approx(altitude, abs=1 / 3600)
    assert (result["azimuth_deg"] - azimuth + 180) % 360 - 180 == pytest.approx(0, abs=1 / 3600)


def test_cardinal_convention_in_independent_rotation():
    assert spherical_horizontal(0, 0, -6) == pytest.approx((0, 90), abs=1e-12)
    assert spherical_horizontal(0, 0, 6) == pytest.approx((0, 270), abs=1e-12)
    assert spherical_horizontal(30, -10, 0) == pytest.approx((50, 180), abs=1e-12)
    assert spherical_horizontal(30, 60, 0) == pytest.approx((60, 0), abs=1e-12)


def test_known_astropy_erfa_regression_fixture_and_apparent_frame():
    result = observe()
    assert result["altitude_deg"] == pytest.approx(70.7389799432, abs=1 / 3600)
    assert result["azimuth_deg"] == pytest.approx(234.5949259232, abs=1 / 3600)
    assert result["ra_topocentric_hours"] == pytest.approx(5.59991214235, abs=1e-7)
    assert result["dec_topocentric_deg"] == pytest.approx(22.0312719458, abs=1e-6)
    assert result["ra_j2000_hours"] == STAR["ra_deg"] / 15
    assert result["dec_j2000_deg"] == STAR["dec_deg"]
    assert result["hour_angle_hours"] == pytest.approx(
        (result["lst_hours"] - result["ra_topocentric_hours"] + 12) % 24 - 12)
    assert result["zenith_distance_deg"] == pytest.approx(90 - result["altitude_deg"])
    assert "TETE" in result["model"]["apparent_equatorial_frame"]


def test_east_positive_longitude_changes_apparent_lst_by_three_hours():
    west = observe(latitude_deg=10, longitude_deg=-20)
    east = observe(latitude_deg=10, longitude_deg=25)
    assert (east["lst_hours"] - west["lst_hours"]) % 24 == pytest.approx(3, abs=1e-8)


def test_trajectory_contains_all_sampled_sun_and_altitude_gates_and_exact_endpoints():
    result = observe(duration_hours=12, samples=49)
    assert len(result["trajectory"]) == 49
    assert result["trajectory"][0]["time_utc"] == "2024-01-01T06:00:00.000Z"
    assert result["trajectory"][-1]["time_utc"] == "2024-01-01T18:00:00.000Z"
    assert result["sample_interval_seconds"] == 900
    assert result["tracking_allowed"] is True
    assert any(point["nighttime"] is False for point in result["trajectory"])
    assert any(point["tracking_allowed"] is False for point in result["trajectory"])
    for point in result["trajectory"]:
        assert 0 <= point["sun_separation_deg"] <= 180
        assert -90 <= point["altitude_deg"] <= 90
        expected = (point["altitude_deg"] >= 20 and point["sun_separation_deg"] >= 30
                    and point["sun_altitude_deg"] < -6 and point["mount_ready"])
        assert point["tracking_allowed"] == expected
        assert bool(point["reasons"]) != expected
    json.dumps(result, allow_nan=False)


def test_equivalent_explicit_offsets_and_datetimes_are_identical():
    utc = observe()
    local = observe(when="2024-01-01T00:00:00-06:00")
    aware = observe(when=datetime(2024, 1, 1, 6, tzinfo=timezone.utc))
    assert utc["time_utc"] == local["time_utc"] == aware["time_utc"]
    assert utc["altitude_deg"] == local["altitude_deg"] == aware["altitude_deg"]


def test_offline_calculations_do_not_download_and_restore_astropy_configuration(monkeypatch):
    def forbidden(*args, **kwargs):
        pytest.fail("An offline observing calculation attempted a network download.")
    monkeypatch.setattr(astropy.utils.data, "download_file", forbidden)
    original_download = iers.conf.auto_download
    original_accuracy = iers.conf.iers_degraded_accuracy
    result = observe()
    assert result["model"]["network_downloads"] is False
    assert result["earth_orientation"]["status"] in {"definitive", "rapid"}
    assert result["earth_orientation"]["mount_ready"] is True
    assert result["earth_orientation"]["package_version"]
    assert result["earth_orientation"]["bundled_start_utc"] < result["time_utc"]
    assert result["earth_orientation"]["bundled_end_utc"] > result["time_utc"]
    assert iers.conf.auto_download == original_download
    assert iers.conf.iers_degraded_accuracy == original_accuracy


def test_far_future_remains_explicitly_approximate_and_cannot_authorize_motion():
    result = observe(when="2099-06-01T06:00:00Z")
    assert result["earth_orientation"]["status"] == "degraded"
    assert result["earth_orientation"]["degraded"] is True
    assert result["mount_ready"] is result["tracking_allowed"] is False
    assert all(point["mount_ready"] is point["tracking_allowed"] is False for point in result["trajectory"])
    assert any("outside bundled coverage" in reason for reason in result["reasons"])
    assert any("nearest UT1" in caveat for caveat in result["caveats"])
    json.dumps(result, allow_nan=False)


@pytest.mark.parametrize("altitude,sun_altitude,sun_separation,ready,allowed", [
    (20, -6.001, 30, True, True),
    (19.999, -10, 90, True, False),
    (45, -6, 90, True, False),
    (45, -10, 29.999, True, False),
    (45, -10, 90, False, False),
])
def test_tracking_gate_boundary_conditions(altitude, sun_altitude, sun_separation, ready, allowed):
    result = _gate(altitude, sun_altitude, sun_separation, 20, ready)
    assert result["tracking_allowed"] is allowed


@pytest.mark.parametrize("kwargs", [
    {"latitude_deg": 90.001}, {"latitude_deg": True}, {"latitude_deg": float("nan")},
    {"longitude_deg": -180.001}, {"longitude_deg": float("inf")},
    {"elevation_m": -501}, {"elevation_m": 10_001},
    {"minimum_altitude_deg": -0.1}, {"minimum_altitude_deg": 85.1},
    {"duration_hours": 0}, {"duration_hours": 25},
    {"samples": 12}, {"samples": 98}, {"samples": True}, {"samples": 13.0},
    {"when": "2024-01-01T06:00:00"}, {"when": "2024-01-01"},
    {"when": datetime(2024, 1, 1)}, {"when": "2024-02-30T06:00:00Z"},
    {"when": "1999-12-31T23:59:00Z"}, {"when": "2101-01-01T06:00:00Z"},
    {"when": "2100-12-31T23:50:00Z"},
])
def test_invalid_observer_and_time_are_rejected_before_transformation(kwargs):
    with pytest.raises(ValueError):
        observe(**kwargs)


@pytest.mark.parametrize("star", [
    None, {}, {"id": "x", "ra_deg": None, "dec_deg": 0},
    {"id": "x", "ra_deg": 360, "dec_deg": 0},
    {"id": "x", "ra_deg": -0.01, "dec_deg": 0},
    {"id": "x", "ra_deg": 0, "dec_deg": 90.01},
    {"id": "x", "ra_deg": 0, "dec_deg": float("nan")},
    {"id": "x", "ra_deg": True, "dec_deg": 0},
    {"id": "x", "ra_deg": 0, "dec_deg": 0, "coordinate_system": "galactic"},
])
def test_unknown_or_invalid_catalog_coordinates_are_not_invented(star):
    with pytest.raises(ValueError):
        observing_target(star, latitude_deg=34.365, longitude_deg=-89.538, when=DATE)


def test_poles_and_coordinate_wrap_endpoints_remain_finite():
    result = observe({**STAR, "ra_deg": 359.999999, "dec_deg": 90},
                     latitude_deg=-90, longitude_deg=-180)
    assert -90 <= result["altitude_deg"] <= 90
    assert 0 <= result["lst_hours"] < 24
    assert -12 <= result["hour_angle_hours"] < 12
    json.dumps(result, allow_nan=False)


def test_malformed_non_coordinate_metadata_cannot_inject_nonfinite_json():
    result = observe({**STAR, "source_url": float("nan"), "catalog": {"invalid": float("inf")}})
    assert result["provenance"]["catalog_source_url"] is None
    assert result["provenance"]["catalog"] is None
    json.dumps(result, allow_nan=False)


def test_default_time_is_current_utc_not_a_browser_timezone():
    before = datetime.now(timezone.utc) - timedelta(seconds=1)
    result = observe(when=None)
    after = datetime.now(timezone.utc) + timedelta(seconds=1)
    parsed = datetime.fromisoformat(result["time_utc"].replace("Z", "+00:00"))
    assert before <= parsed <= after
