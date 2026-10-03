import csv
import io
import math

from fastapi.testclient import TestClient
import pytest

from thoth.catalog import EXAMPLE_STAR_ID, get_star
from thoth.server import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_catalog_pagination_filters_and_numeric_sort(client):
    response = client.get("/api/catalog", params={"catalog": "OGLE SMC", "min_period": 200,
                                                 "max_period": 300, "sort": "period_days",
                                                 "direction": "desc", "page_size": 7})
    assert response.status_code == 200
    result = response.json()
    assert len(result["items"]) == 7
    assert result["total"] > 7
    assert result["summary"]["total_stars"] >= 75000
    assert "not a deduplicated" in result["summary"]["coverage_note"]
    periods = [star["period_days"] for star in result["items"]]
    assert periods == sorted(periods, reverse=True)
    assert all(star["catalog"] == "OGLE SMC" and 200 <= star["period_days"] <= 300
               for star in result["items"])
    next_page = client.get("/api/catalog", params={"catalog": "OGLE SMC", "min_period": 200,
                                                  "max_period": 300, "sort": "period_days",
                                                  "direction": "desc", "page_size": 7, "page": 2}).json()
    assert not {star["id"] for star in result["items"]} & {star["id"] for star in next_page["items"]}


def test_mira_alias_search_and_exact_identifier_route(client):
    response = client.get("/api/catalog", params={"search": "Mira", "catalog": "GCVS"})
    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 1
    assert result["items"][0]["id"] == "GCVS:omi Cet"
    detail = client.get("/api/stars/GCVS:omi%20Cet")
    assert detail.status_code == 200
    assert detail.json()["period_days"] == 331.96
    assert detail.json()["mean_v_mag"] is None


def test_preserved_cross_catalog_names_are_searchable(client):
    response = client.get("/api/catalog", params={"search": "omicron Ceti", "catalog": "GCVS"})
    assert response.status_code == 200
    assert [row["id"] for row in response.json()["items"]] == ["GCVS:omi Cet"]
    target = get_star("OGLE-BLG-LPV-000009")
    assert target["aliases"] == ["Terz V 3396"]
    response = client.get("/api/catalog", params={"search": target["aliases"][0], "catalog": "OGLE BLG"})
    assert response.status_code == 200
    assert target["id"] in {row["id"] for row in response.json()["items"]}


def test_filtered_export_has_same_source_backed_entries(client):
    params = {"catalog": "OGLE SMC", "min_period": 250, "max_period": 275}
    catalog = client.get("/api/catalog", params={**params, "page_size": 500}).json()
    response = client.get("/api/export/catalog", params=params)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "thoth-mira-catalog.csv" in response.headers["content-disposition"]
    rows = list(csv.DictReader(io.StringIO(response.text)))
    assert {row["id"] for row in rows} == {row["id"] for row in catalog["items"]}
    assert all(row["source_url"].startswith("https://ftp.astrouw.edu.pl/") for row in rows)


@pytest.mark.parametrize("params", [{"page": 0}, {"page_size": 501}, {"sort": "untrusted"},
                                    {"direction": "random"}, {"min_period": -1},
                                    {"min_period": "nan"}, {"min_period": 300, "max_period": 200}])
def test_invalid_catalog_constraints_return_422(client, params):
    assert client.get("/api/catalog", params=params).status_code == 422


def test_unknown_star_and_unavailable_photometry_are_explicit(client):
    assert client.get("/api/stars/unknown-star").status_code == 404
    assert client.get("/api/stars/unknown-star/lightcurve").status_code == 404
    response = client.get("/api/stars/GCVS:omi%20Cet/lightcurve")
    assert response.status_code == 424
    assert "No time-series" in response.json()["detail"]


def test_real_bundled_lightcurve_retains_all_measurements(client):
    response = client.get(f"/api/stars/{EXAMPLE_STAR_ID}/lightcurve")
    assert response.status_code == 200
    curve = response.json()
    assert curve["data_source"] == "bundled"
    assert curve["time_system"] == "HJD"
    assert len(curve["observations"]) == 8369
    assert curve["observations"][0] == {
        "time_jd": 2455260.85336, "magnitude": 13.466, "error_mag": 0.005, "band": "I"}


def test_api_real_native_fit_includes_provenance_and_cautions(client):
    response = client.post("/api/analyze", json={"star_id": EXAMPLE_STAR_ID, "min_period": 90,
                                                "max_period": 94, "samples": 50, "harmonics": 2,
                                                "threads": 1})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["period_days"] == pytest.approx(get_star(EXAMPLE_STAR_ID)["period_days"], abs=0.5)
    assert result["n_observations"] == 8369
    assert len(result["frequencies"]) == len(result["powers"]) == 50
    assert result["chi2"] > 0 and math.isfinite(result["reduced_chi2"])
    assert result["band"] == "I" and result["time_system"] == "HJD"
    assert result["source_url"].endswith(EXAMPLE_STAR_ID + ".dat")
    assert any("not a probability" in warning for warning in result["warnings"])


@pytest.mark.parametrize("options", [{"min_period": 100, "max_period": 50}, {"samples": 49},
                                     {"harmonics": 4}, {"threads": 33}, {"min_period": "nan"}])
def test_invalid_analysis_constraints_fail_before_computation(client, options):
    assert client.post("/api/analyze", json={"star_id": EXAMPLE_STAR_ID, **options}).status_code == 422


def test_unknown_analysis_target_returns_404(client):
    assert client.post("/api/analyze", json={"star_id": "no-such-star", "samples": 50}).status_code == 404
