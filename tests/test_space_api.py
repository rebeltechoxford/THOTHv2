"""Exercise reconstruction through HTTP, including missing evidence and job reuse."""
import json
import math
import threading

import pytest
from fastapi.testclient import TestClient

from thoth import datasets, server
from thoth.catalog import EXAMPLE_STAR_ID


@pytest.fixture
def client(monkeypatch, tmp_path):
    monkeypatch.setenv("THOTH_WORKSPACE_DIR", str(tmp_path))
    monkeypatch.setattr(server, "_compute_slot", threading.Lock())
    monkeypatch.setattr(server, "_transform_jobs", {})
    with TestClient(server.app) as connection:
        yield connection


def test_every_catalog_direction_is_retained_and_compressed(client):
    response = client.get("/api/space", headers={"accept-encoding": "gzip"})
    assert response.status_code == 200
    assert response.headers["content-encoding"] == "gzip"
    result = response.json()
    assert result["counts"]["catalog_entries"] == 75916
    assert len(result["stars"]) == len(result["positions"]) == len(result["galactic_positions"]) == 75916
    assert result["counts"]["mapped_entries"] == 75916
    assert sum(cell["count"] for cell in result["density_cells"]) == 75916
    assert result["geometry"]["distance_unit"] is None
    assert any("Mira" in row["aliases"] for row in result["stars"] if row["id"] == "GCVS:omi Cet")
    assert result["computation"]["coordinate_evaluations"] == 75916
    assert len({row["id"] for row in result["stars"]}) == 75916


def test_empty_survey_filter_has_explicit_empty_geometry(client):
    result = client.get("/api/space?catalog=not-a-survey").json()
    assert result["counts"]["catalog_entries"] == 0
    assert result["stars"] == result["positions"] == []
    assert all(cell["count"] == 0 for cell in result["density_cells"])


def test_measured_flux_supports_distinct_3d_families_and_counterfactuals(client):
    reports = []
    for fraction in (0, 1):
        response = client.post("/api/space/star", json={"star_id": EXAMPLE_STAR_ID,
            "radius_fraction": fraction, "phase": 0.4, "resolution": 16})
        assert response.status_code == 200, response.text
        report = response.json()
        assert report["photometry_status"] == "available"
        assert report["provenance"]["photometry"]["input_observations"] == 8369
        assert report["provenance"]["photometry"]["used_observations"] == 3000
        assert len(report["mesh"]["positions"]) == 3 * report["mesh"]["vertex_count"]
        assert len(report["mesh"]["indices"]) == 3 * report["mesh"]["triangle_count"]
        assert report["mesh"]["radius_scale_relative"] == report["selected_model"]["radius_relative"]
        family = report["radiative_family"]
        assert max(abs(value) for value in family["residuals"]) < 1e-10
        assert report["geometry"]["physical_radius"] is None
        assert abs(report["selected_model"]["flux_residual"]) < 1e-10
        assert len(family["counterfactual_predictions"]) == 3
        assert "not new measurements" in family["prediction_caveat"]
        json.dumps(report, allow_nan=False)
        reports.append(report)
    fixed_radius, fixed_temperature = [report["radiative_family"] for report in reports]
    assert fixed_radius["radii_relative"] == pytest.approx([1] * 301)
    assert fixed_temperature["temperatures_k"] == pytest.approx([3000] * 301)
    assert fixed_radius["relative_fluxes"] == fixed_temperature["relative_fluxes"]
    assert fixed_radius["counterfactual_predictions"][2]["relative_fluxes"] != pytest.approx(
        fixed_temperature["counterfactual_predictions"][2]["relative_fluxes"])
    assert not server._compute_slot.locked()


def test_missing_photometry_does_not_invent_structure(client):
    response = client.post("/api/space/star", json={"star_id": "GCVS:omi Cet", "resolution": 16})
    assert response.status_code == 200
    result = response.json()
    assert result["photometry_status"] == "unavailable"
    assert result["phase_model"] == []
    assert result["fit"] is result["radiative_family"] is result["selected_model"] is None
    assert result["distance_evidence"]["candidate_count"] == 0
    assert "illustrative" in result["geometry"]["kind"]


@pytest.mark.parametrize("options", [{"phase": "nan"}, {"phase": 2}, {"resolution": 1000},
    {"radius_fraction": -1}, {"reference_temperature_k": 0}, {"wavelength_um": "inf"}])
def test_invalid_reconstruction_never_reserves_compute(client, options):
    assert client.post("/api/space/star", json={"star_id": EXAMPLE_STAR_ID, **options}).status_code == 422
    assert not server._compute_slot.locked()


def test_star_reconstruction_errors_and_mutex_release(client, monkeypatch):
    from thoth import space
    assert client.post("/api/space/star", json={"star_id": "unknown"}).status_code == 404
    with server._compute_slot:
        assert client.post("/api/space/star", json={"star_id": EXAMPLE_STAR_ID}).status_code == 409
    def fail(*args, **kwargs):
        raise ValueError("Singular observation model")
    monkeypatch.setattr(space, "build_star_model", fail)
    assert client.post("/api/space/star", json={"star_id": EXAMPLE_STAR_ID}).status_code == 422
    assert not server._compute_slot.locked()


def test_actual_bundled_gaia_candidates_remain_unconfirmed(client):
    response = client.get(f"/api/space/evidence/{EXAMPLE_STAR_ID}")
    assert response.status_code == 200
    receipt = response.json()
    assert receipt["archive"] == "ESA Gaia DR3"
    assert receipt["association_status"] == "unconfirmed_position_candidates"
    assert len(receipt["response_sha256"]) == 64
    candidate = receipt["candidates"][0]
    assert candidate["source_id"] == "4056580569471072640"
    assert candidate["parallax"] < 0 < candidate["parallax_error"]
    assert candidate["quality_flags"]
    sky = client.get("/api/space/astrometry").json()
    assert sky["total"] >= 5
    for item in sky["items"]:
        assert isinstance(item["source_id"], str)
        assert 0 < item["distance_p16_pc"] < item["distance_median_pc"] < item["distance_p84_pc"] <= 20000
        assert math.sqrt(sum(value**2 for value in item["position_pc"])) == pytest.approx(item["distance_median_pc"])
    assert client.get("/api/space/evidence/unknown").status_code == 404
    assert client.get(f"/api/space/evidence/{EXAMPLE_STAR_ID}?radius_arcsec=31").status_code == 422


def test_negative_parallax_has_positive_prior_sensitive_posterior(client):
    results = []
    for length in (500, 4000):
        response = client.post("/api/space/distance", json={"parallax_mas": -0.1,
            "parallax_error_mas": 0.2, "prior_length_pc": length})
        assert response.status_code == 200
        result = response.json()
        assert 0 < result["p16_pc"] < result["median_pc"] < result["p84_pc"]
        assert len(result["distances_pc"]) == result["grid_samples"]
        assert result["cumulative_probability"][-1] == pytest.approx(1)
        results.append(result)
    assert results[1]["median_pc"] > results[0]["median_pc"]
    assert client.post("/api/space/distance", json={"parallax_mas": 1, "parallax_error_mas": 0}).status_code == 422


def test_transform_mesh_uses_persisted_native_grid_and_omits_holes(client):
    identifier = "e" * 32
    report = {"kind": "transforms", "state": "complete", "result": {
        "chirp": {"frequencies": [0.01, 0.02, 0.03], "frequency_derivatives": [-1e-8, 0, 1e-8],
                  "powers": [[0.1, 0.2, 0.3], [0.2, None, 0.4], [0.4, 0.5, 0.6]]},
        "provenance": {"input_sha256": "abc"}}}
    datasets.write_record("reports", identifier, report)
    result = client.get(f"/api/space/surfaces/{identifier}").json()
    assert result["provenance"]["input_sha256"] == "abc"
    assert result["axes"]["x"]["values"] == [0.01, 0.02, 0.03]
    assert result["powers"][1][1] is None
    assert 4 in result["mesh"]["missing_vertex_indices"]
    assert 4 not in result["mesh"]["indices"]
    assert client.get(f"/api/space/surfaces/{identifier}?kind=imaginary").status_code == 422
    assert client.get("/api/space/surfaces/" + "f" * 32).status_code == 404
    server._transform_jobs[identifier] = {"state": "running", "result": None}
    assert client.get(f"/api/space/surfaces/{identifier}").status_code == 409
