"""Isolated archive receipts, identity guards, and conditional spatial inference."""
import copy
import hashlib
import json
import math

from fastapi.testclient import TestClient
import httpx
import numpy as np
import pytest

from thoth import astrometry
from thoth import server


HEADER = "source_id,ra,dec,parallax,parallax_error,pmra,pmdec,ruwe,phot_g_mean_mag\n"
PRECISE_ID = "9007199254740993123"


def csv_fixture(ra=10., dec=20., parallax=-.2, error=.3, source_id=PRECISE_ID):
    return HEADER + f"{source_id},{ra},{dec},{parallax},{error},1.2,-3.4,1.1,12.3\n"


@pytest.fixture
def isolated(monkeypatch, tmp_path):
    monkeypatch.setattr(astrometry, "workspace_directory", lambda: tmp_path)
    monkeypatch.setattr(astrometry, "BUNDLED", tmp_path / "bundled.json")
    return {"id": "test-star", "name": "Test star", "ra_deg": 10., "dec_deg": 20.}


def archive_response(url, text):
    return httpx.Response(200, text=text, request=httpx.Request("GET", url))


def test_gaia_identifiers_stay_exact_strings_and_negative_parallaxes_remain_usable(isolated):
    candidates = astrometry.parse_candidates(csv_fixture(), isolated)
    assert candidates[0]["source_id"] == PRECISE_ID
    assert isinstance(candidates[0]["source_id"], str)
    assert candidates[0]["parallax"] == -.2
    assert candidates[0]["distance_usable"] is True
    assert candidates[0]["separation_arcsec"] == pytest.approx(0, abs=1e-10)
    assert any("Nonpositive" in text for text in candidates[0]["quality_flags"])
    assert any("Low parallax" in text for text in candidates[0]["quality_flags"])
    json.dumps(candidates, allow_nan=False)


def test_missing_parallax_keeps_candidate_without_inventing_distance(isolated):
    text = HEADER + "123,10,20,,,,,,\n"
    candidate = astrometry.parse_candidates(text, isolated)[0]
    assert candidate["parallax"] is None
    assert candidate["parallax_error"] is None
    assert candidate["distance_usable"] is False
    assert candidate["ruwe"] is None
    assert candidate["quality_flags"]


def test_angular_separation_handles_wraparound_and_poles():
    assert astrometry.separation_arcsec(359.999, 0, .001, 0) == pytest.approx(7.2, rel=1e-10)
    assert astrometry.separation_arcsec(0, 90, 180, 90) == pytest.approx(0, abs=1e-9)
    assert astrometry.separation_arcsec(0, 0, 180, 0) == pytest.approx(180*3600)


def test_multiple_candidates_are_preserved_sorted_and_unconfirmed(monkeypatch, isolated):
    text = csv_fixture(10.0001, source_id="123") + csv_fixture().split("\n", 1)[1]
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, text))
    record = astrometry.acquire_evidence(isolated)
    assert record["candidate_count"] == 2
    assert [row["source_id"] for row in record["candidates"]] == [PRECISE_ID, "123"]
    assert record["association_status"] == "unconfirmed_position_candidates"
    assert "closest angular match is not proof" in " ".join(record["caveats"])
    assert record["gaia_reference_epoch_jyear"] == 2016.
    assert record["response_sha256"] == hashlib.sha256(text.encode()).hexdigest()
    assert record["source_url"] == astrometry.ESA_TAP
    json.dumps(record, allow_nan=False)


def test_receipt_caching_avoids_reacquisition_and_refresh_is_explicit(monkeypatch, isolated):
    calls = []

    def get(url, **kwargs):
        calls.append((url, kwargs))
        return archive_response(url, csv_fixture())

    monkeypatch.setattr(astrometry.httpx, "get", get)
    first = astrometry.acquire_evidence(isolated)
    cached = astrometry.acquire_evidence(isolated)
    assert cached == first
    assert len(calls) == 1
    refreshed = astrometry.acquire_evidence(isolated, refresh=True)
    assert len(calls) == 2
    assert refreshed["response_sha256"] == first["response_sha256"]
    assert not list(astrometry.workspace_directory().rglob("*.tmp"))
    assert "gaiadr3.gaia_source" in calls[0][1]["params"]["QUERY"]
    assert calls[0][1]["params"]["FORMAT"] == "csv"
    assert calls[0][1]["timeout"] == 20
    query = calls[0][1]["params"]["QUERY"]
    assert "DISTANCE(" in query and "AS angular_distance" in query
    assert "ORDER BY angular_distance" in query


def test_public_mirror_fallback_preserves_original_response_receipt(monkeypatch, isolated):
    calls = []

    def get(url, **kwargs):
        calls.append((url, kwargs))
        if url == astrometry.ESA_TAP:
            raise httpx.ConnectError("offline", request=httpx.Request("GET", url))
        return archive_response(url, csv_fixture())

    monkeypatch.setattr(astrometry.httpx, "get", get)
    record = astrometry.acquire_evidence(isolated)
    assert [url for url, _ in calls] == [astrometry.ESA_TAP, astrometry.CDS_TAP]
    assert record["source_url"] == astrometry.CDS_TAP
    assert record["archive"] == "Gaia DR3 / CDS mirror"
    assert '"I/355/gaiadr3"' in record["adql_query"]
    assert "Source AS source_id" in record["adql_query"]
    assert record["response_sha256"] == hashlib.sha256(csv_fixture().encode()).hexdigest()


def test_failed_archives_do_not_substitute_fake_candidates(monkeypatch, isolated):
    def get(url, **kwargs):
        return archive_response(url, "<html>archive maintenance</html>")

    monkeypatch.setattr(astrometry.httpx, "get", get)
    with pytest.raises(RuntimeError, match="could not be acquired"):
        astrometry.acquire_evidence(isolated)
    assert astrometry.cached_evidence(isolated["id"]) is None


@pytest.mark.parametrize("options", [
    {"ra": -1}, {"ra": 361}, {"dec": 91}, {"parallax": "nan"},
    {"error": "inf"}, {"source_id": "1e19"}, {"source_id": "١٢٣"},
])
def test_malformed_archive_coordinates_numbers_and_identifiers_are_rejected(isolated, options):
    with pytest.raises(ValueError):
        astrometry.parse_candidates(csv_fixture(**options), isolated)


@pytest.mark.parametrize("radius", [0, 31, np.nan, np.inf])
def test_invalid_cones_fail_before_network(monkeypatch, isolated, radius):
    def unexpected(*args, **kwargs):
        pytest.fail("Invalid request reached the archive")
    monkeypatch.setattr(astrometry.httpx, "get", unexpected)
    with pytest.raises(ValueError):
        astrometry.acquire_evidence(isolated, radius)


@pytest.mark.parametrize("changes", [{"ra_deg": -1}, {"ra_deg": 360}, {"dec_deg": 91}, {"dec_deg": None}])
def test_invalid_catalog_coordinates_fail_before_network(monkeypatch, isolated, changes):
    def unexpected(*args, **kwargs):
        pytest.fail("Invalid source coordinates reached the archive")
    monkeypatch.setattr(astrometry.httpx, "get", unexpected)
    with pytest.raises(ValueError):
        astrometry.acquire_evidence({**isolated, **changes})


def test_duplicate_gaia_sources_do_not_create_false_identity_ambiguity(isolated):
    text = csv_fixture() + csv_fixture().split("\n", 1)[1]
    with pytest.raises(ValueError):
        astrometry.parse_candidates(text, isolated)


def test_outside_cone_response_is_not_cached_as_valid_evidence(monkeypatch, isolated):
    text = csv_fixture(10.1)
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, text))
    with pytest.raises(RuntimeError):
        astrometry.acquire_evidence(isolated, 3)
    assert astrometry.cached_evidence(isolated["id"]) is None


def test_changed_catalog_coordinates_invalidate_cached_identity(monkeypatch, isolated):
    calls = []
    def get(url, **kwargs):
        calls.append(kwargs["params"]["QUERY"])
        return archive_response(url, csv_fixture())
    monkeypatch.setattr(astrometry.httpx, "get", get)
    astrometry.acquire_evidence(isolated)
    moved = {**isolated, "ra_deg": 10.0003}
    record = astrometry.acquire_evidence(moved)
    assert len(calls) == 2
    assert record["catalog_ra_deg"] == moved["ra_deg"]


def test_cached_wrong_identity_is_not_reused(monkeypatch, isolated):
    calls = []
    def get(url, **kwargs):
        calls.append(url)
        return archive_response(url, csv_fixture())
    monkeypatch.setattr(astrometry.httpx, "get", get)
    first = astrometry.acquire_evidence(isolated)
    corrupted = {**first, "star_id": "wrong-object"}
    astrometry._cache_path(isolated["id"], 3).write_text(json.dumps(corrupted), encoding="utf-8")
    restored = astrometry.acquire_evidence(isolated)
    assert restored["star_id"] == isolated["id"]
    assert len(calls) == 2


def test_nonfinite_or_corrupt_cached_receipt_is_reacquired(monkeypatch, isolated):
    calls = []
    def get(url, **kwargs):
        calls.append(url)
        return archive_response(url, csv_fixture())
    monkeypatch.setattr(astrometry.httpx, "get", get)
    first = astrometry.acquire_evidence(isolated)
    broken = copy.deepcopy(first)
    broken["candidates"][0]["parallax"] = float("nan")
    astrometry._cache_path(isolated["id"], 3).write_text(json.dumps(broken), encoding="utf-8")
    restored = astrometry.acquire_evidence(isolated)
    assert math.isfinite(restored["candidates"][0]["parallax"])
    assert len(calls) == 2
    astrometry._cache_path(isolated["id"], 3).write_text("{truncated", encoding="utf-8")
    restored = astrometry.acquire_evidence(isolated)
    assert restored["candidate_count"] == 1
    assert len(calls) == 3


def test_cache_paths_are_hashed_and_do_not_follow_star_identifier_paths(isolated):
    root = astrometry.workspace_directory() / "astrometry"
    path = astrometry._cache_path("../../foreign/file.json", 3)
    assert path.parent == root
    assert len(path.stem) == 64
    assert path.suffix == ".json"


def test_bundled_evidence_uses_exact_object_and_cone(monkeypatch, isolated):
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, csv_fixture()))
    record = astrometry.acquire_evidence(isolated)
    astrometry._cache_path(isolated["id"], 3).unlink()
    astrometry.BUNDLED.write_text(json.dumps({"release": "Gaia DR3", "items": [record]}), encoding="utf-8")
    assert astrometry.cached_evidence(isolated["id"], 3) == record
    assert astrometry.cached_evidence("other-object", 3) is None
    assert astrometry.cached_evidence(isolated["id"], 4) is None


def test_spatial_candidates_keep_association_ambiguity_and_negative_parallax(monkeypatch, isolated):
    text = csv_fixture() + csv_fixture(10.0001, parallax=1, error=.05, source_id="123").split("\n",1)[1]
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, text))
    record = astrometry.acquire_evidence(isolated)
    map_data = astrometry.spatial_candidates(1350)
    assert map_data["total"] == 2
    assert {row["source_id"] for row in map_data["items"]} == {PRECISE_ID, "123"}
    for row in map_data["items"]:
        assert row["association_status"] == "unconfirmed_position_candidates"
        assert row["distance_p16_pc"] < row["distance_median_pc"] < row["distance_p84_pc"]
        assert row["distance_p16_pc"] > 0
        assert np.linalg.norm(row["direction"]) == pytest.approx(1)
        assert np.linalg.norm(row["position_pc"]) == pytest.approx(row["distance_median_pc"])
        assert row["response_sha256"] == record["response_sha256"]
        assert row["retrieved_utc"] == record["retrieved_utc"]
        assert row["gaia_reference_epoch_jyear"] == 2016.
        assert row["cone_radius_arcsec"] == 3.
    assert any(row["parallax_mas"] < 0 for row in map_data["items"])
    json.dumps(map_data, allow_nan=False)


def test_spatial_candidates_deduplicate_same_receipt_and_skip_missing_parallax(monkeypatch, isolated):
    text = csv_fixture() + "123,10,20,,,,,,\n"
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, text))
    record = astrometry.acquire_evidence(isolated)
    astrometry.BUNDLED.write_text(json.dumps({"items": [record]}), encoding="utf-8")
    mapped = astrometry.spatial_candidates()
    assert mapped["total"] == 1
    assert mapped["items"][0]["source_id"] == PRECISE_ID


def test_bad_local_receipt_does_not_hide_other_valid_spatial_evidence(monkeypatch, isolated):
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, csv_fixture()))
    record = astrometry.acquire_evidence(isolated)
    bad = copy.deepcopy(record)
    bad["star_id"] = "bad-star"
    bad["candidates"][0]["parallax_error"] = float("inf")
    bad_path = astrometry._cache_path(bad["star_id"], 3)
    bad_path.write_text(json.dumps(bad), encoding="utf-8")
    result = astrometry.spatial_candidates()
    assert result["total"] == 1
    assert result["items"][0]["star_id"] == isolated["id"]
    assert result["rejected_cache_records"] == 1
    json.dumps(result, allow_nan=False)


@pytest.mark.parametrize("missing_field", ["name", "gaia_reference_epoch_jyear", "adql_query", "retrieved_utc", "caveats"])
def test_incomplete_cached_schema_is_excluded_before_map_serialization(monkeypatch, isolated, missing_field):
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, csv_fixture()))
    record = astrometry.acquire_evidence(isolated)
    bad = copy.deepcopy(record)
    bad["star_id"] = "bad-star"
    del bad[missing_field]
    astrometry._cache_path(bad["star_id"], 3).write_text(json.dumps(bad), encoding="utf-8")
    result = astrometry.spatial_candidates()
    assert result["total"] == 1
    assert result["rejected_cache_records"] == 1


def test_posterior_unsupported_cached_numbers_do_not_hide_valid_candidates(monkeypatch, isolated):
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, csv_fixture()))
    record = astrometry.acquire_evidence(isolated)
    bad = copy.deepcopy(record)
    bad["star_id"] = "bad-star"
    bad["candidates"][0]["parallax_error"] = 1e-7
    astrometry._cache_path(bad["star_id"], 3).write_text(json.dumps(bad), encoding="utf-8")
    result = astrometry.spatial_candidates()
    assert result["total"] == 1
    assert result["rejected_cache_records"] == 0
    assert result["skipped_candidates"][0]["star_id"] == "bad-star"
    assert "Parallax" in result["skipped_candidates"][0]["reason"]


def test_query_limit_keeps_incomplete_inventory_explicit(monkeypatch, isolated):
    text = HEADER + "".join(csv_fixture(source_id=str(100+i)).split("\n", 1)[1] for i in range(21))
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, text))
    result = astrometry.acquire_evidence(isolated)
    assert result["candidate_count"] == 21
    assert result["query_limit_reached"] is True
    assert result["association_status"] == "unconfirmed_position_candidates"
    assert any("21-row limit" in caveat for caveat in result["caveats"])


@pytest.fixture
def api_client(monkeypatch, isolated):
    monkeypatch.setattr(server, "get_star", lambda identifier: copy.deepcopy(isolated) if identifier == isolated["id"] else None)
    with TestClient(server.app) as client:
        yield client


def test_space_distance_api_supports_negative_parallax_and_reports_bounded_prior(api_client):
    response = api_client.post("/api/space/distance", json={"parallax_mas": -.2, "parallax_error_mas": .3})
    assert response.status_code == 200
    result = response.json()
    assert 0 < result["p16_pc"] < result["median_pc"] < result["p84_pc"] <= 20000
    assert result["lower_bound_pc"] > 0
    assert result["upper_bound_pc"] == 20000
    assert result["prior_length_pc"] == 1350
    assert result["parallax_mas"] == -.2


@pytest.mark.parametrize("settings", [
    {"parallax_mas": "nan", "parallax_error_mas": .3},
    {"parallax_mas": 1, "parallax_error_mas": 0},
    {"parallax_mas": 1, "parallax_error_mas": .3, "samples": 127},
    {"parallax_mas": 1, "parallax_error_mas": .3, "prior_length_pc": "inf"},
])
def test_distance_api_guards(api_client, settings):
    assert api_client.post("/api/space/distance", json=settings).status_code == 422


def test_archive_api_maps_outages_to_dependency_failure(api_client, monkeypatch):
    def unavailable(*args, **kwargs):
        raise RuntimeError("Gaia archive unavailable")
    monkeypatch.setattr(astrometry, "acquire_evidence", unavailable)
    response = api_client.get("/api/space/evidence/test-star")
    assert response.status_code == 424
    assert "Gaia archive" in response.json()["detail"]
    assert api_client.get("/api/space/evidence/no-such-star").status_code == 404
    assert api_client.get("/api/space/evidence/test-star?radius_arcsec=nan").status_code == 422


def test_archive_api_returns_auditable_candidates_without_network_inference(api_client, monkeypatch, isolated):
    monkeypatch.setattr(astrometry.httpx, "get", lambda url, **kwargs: archive_response(url, csv_fixture()))
    response = api_client.get("/api/space/evidence/test-star")
    assert response.status_code == 200
    result = response.json()
    assert result["candidates"][0]["source_id"] == PRECISE_ID
    assert result["association_status"] == "unconfirmed_position_candidates"
    spatial = api_client.get("/api/space/astrometry")
    assert spatial.status_code == 200
    assert spatial.json()["total"] == 1


def test_star_api_reports_missing_photometry_and_releases_compute_slot(api_client):
    response = api_client.post("/api/space/star", json={"star_id": "test-star", "resolution": 12})
    assert response.status_code == 200, response.text
    assert response.json()["photometry_status"] == "unavailable"
    assert response.json()["relative_flux_at_phase"] is None
    assert response.json()["geometry"]["physical_radius"] is None
    assert server._compute_slot.acquire(blocking=False)
    server._compute_slot.release()


def test_star_api_honors_existing_compute_job(api_client):
    assert server._compute_slot.acquire(blocking=False)
    try:
        assert api_client.post("/api/space/star", json={"star_id": "test-star"}).status_code == 409
    finally:
        server._compute_slot.release()


def test_space_height_mesh_requires_completed_transform_job(api_client, monkeypatch):
    monkeypatch.setattr(server, "transform_job", lambda identifier: {"state": "running", "result": None})
    assert api_client.get("/api/space/surfaces/test-job").status_code == 409
    assert api_client.get("/api/space/surfaces/test-job?kind=other").status_code == 422


def test_space_height_mesh_missing_native_backend_reports_service_unavailable(api_client, monkeypatch):
    from thoth import space
    monkeypatch.setattr(server, "transform_job", lambda identifier: {"state": "complete", "result": {}})
    def unavailable(*args, **kwargs):
        raise RuntimeError("Native numerical engine unavailable")
    monkeypatch.setattr(space, "build_transform_surface", unavailable)
    response = api_client.get("/api/space/surfaces/test-job")
    assert response.status_code == 503
    assert "Native" in response.json()["detail"]
