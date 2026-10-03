import gzip
import hashlib
from importlib.resources import files
from unittest.mock import patch

import pytest

from thoth.catalog import (
    CatalogError, EXAMPLE_STAR_ID, catalog_manifest, get_star, load_catalog,
    load_lightcurve, normalize_gcvs, normalize_ogle, parse_photometry,
)


def test_complete_snapshot_has_all_five_source_catalogs_and_valid_checksum():
    manifest = catalog_manifest()
    records = load_catalog()
    assert len(records) == manifest["catalog_entries"]
    assert len(records) >= 75000
    assert len({row["id"] for row in records}) == len(records)
    counts = {catalog: sum(row["catalog"] == catalog for row in records)
              for catalog in manifest["counts_by_catalog"]}
    assert counts == manifest["counts_by_catalog"]
    assert set(counts) == {"OGLE BLG", "OGLE GD", "OGLE LMC", "OGLE SMC", "GCVS"}
    raw = files("thoth").joinpath("data", "catalog.jsonl.gz").read_bytes()
    assert hashlib.sha256(raw).hexdigest() == manifest["snapshot_sha256"]
    assert len(gzip.decompress(raw).splitlines()) == len(records)
    assert all(row["classification"] == "Mira" for row in records)
    assert all(row["ra_deg"] is None or 0 <= row["ra_deg"] < 360 for row in records)
    assert all(row["dec_deg"] is None or -90 <= row["dec_deg"] <= 90 for row in records)


def test_known_star_and_alias_preserve_means_and_catalog_identity():
    mira = get_star("Mira")
    assert mira["id"] == "GCVS:omi Cet"
    assert mira["period_days"] > 300
    assert mira["mean_i_mag"] is None
    assert mira["mean_v_mag"] is None
    assert mira["amplitude_i_mag"] is None
    assert mira["epoch_max_jd"] > 2400000
    example = get_star(EXAMPLE_STAR_ID)
    assert example["period_days"] == 91.97
    assert example["mean_i_mag"] == 14.276
    assert example["amplitude_i_mag"] == 1.986
    assert example["ra_deg"] == pytest.approx(268.292125)
    assert example["dec_deg"] == pytest.approx(-29.0782222222)
    example["period_days"] = 1
    assert get_star(EXAMPLE_STAR_ID)["period_days"] == 91.97


@pytest.mark.parametrize("star_id,minimum", [(EXAMPLE_STAR_ID, 8300), ("OGLE-LMC-LPV-04312", 450)])
def test_bundled_real_lightcurves_are_available_offline(star_id, minimum):
    with patch("thoth.catalog._download_text", side_effect=AssertionError("Offline test contacted network")):
        curve = load_lightcurve(star_id)
    assert curve["data_source"] == "bundled"
    assert curve["time_system"] == "HJD"
    assert curve["band"] == "I"
    assert len(curve["observations"]) >= minimum
    assert curve["observations"][0]["time_jd"] > 2450000
    assert all(row["error_mag"] > 0 and row["band"] == "I" for row in curve["observations"])


def test_photometry_time_offset_and_sorting_are_explicit():
    result = parse_photometry("5261.79151 13.496 0.005\n5260.85336 13.466 0.005\n")
    assert result[0] == {"time_jd": 2455260.85336, "magnitude": 13.466, "error_mag": 0.005, "band": "I"}
    with pytest.raises(CatalogError, match="format"):
        parse_photometry("<!DOCTYPE html>")
    with pytest.raises(CatalogError, match="values"):
        parse_photometry("5260 13.4 -0.001")


def test_gcvs_amplitude_flags_and_different_band_are_not_treated_as_minima():
    header = "GCVS\tRAJ2000\tDEJ2000\tVarType\tmagMax\tMin1\tflt\tEpoch\tPeriod\tSpType\tl_Min1\tn_Min1\n"
    record = "Test And\t00 22 23.15\t+26 59 45.8\tM\t7.7\t4.0\tV\t50854\t281\tM4e\t(\t\n"
    star = normalize_gcvs(header + record)[0]
    assert star["magnitude_min"] is None
    assert star["magnitude_min_catalog"] == 4
    assert star["epoch_max_jd"] == 2450854
    assert star["mean_v_mag"] is None
    record = record.replace("\t(\t\n", "\t\tIc\n")
    assert normalize_gcvs(header + record)[0]["magnitude_min"] is None


def test_missing_ogle_identifier_and_truncated_gcvs_query_fail_explicitly():
    with pytest.raises(CatalogError, match="Missing OGLE"):
        normalize_ogle("OGLE-BLG-LPV-096697 14.276 19.143 91.97 1.986", "", "BLG")
    with pytest.raises(CatalogError, match="truncated"):
        normalize_gcvs("#INFO\tQUERY_STATUS\tOVERFLOW\n")
    with pytest.raises(CatalogError, match="Unknown catalog"):
        load_lightcurve("../../untrusted-file")
    with pytest.raises(CatalogError, match="No time-series"):
        load_lightcurve("Mira")


def test_download_is_validated_and_cached_under_a_url_hash(tmp_path, monkeypatch):
    monkeypatch.setenv("THOTH_CACHE_DIR", str(tmp_path))
    star_id = "OGLE-SMC-LPV-00015"
    raw = "2000 14.5 0.01\n2001 14.6 0.02\n"
    with patch("thoth.catalog._download_text", return_value=raw) as download:
        result = load_lightcurve(star_id)
    assert download.call_count == 1
    assert result["data_source"] == "download"
    expected = hashlib.sha256(get_star(star_id)["lightcurve_url"].encode()).hexdigest() + ".dat"
    assert [file.name for file in tmp_path.iterdir()] == [expected]
    with patch("thoth.catalog._download_text", side_effect=AssertionError("Cache miss")):
        assert load_lightcurve(star_id)["data_source"] == "cache"


def test_invalid_download_never_becomes_cached_photometry(tmp_path, monkeypatch):
    monkeypatch.setenv("THOTH_CACHE_DIR", str(tmp_path))
    with patch("thoth.catalog._download_text", return_value="<html>temporarily unavailable</html>"):
        with pytest.raises(CatalogError):
            load_lightcurve("OGLE-SMC-LPV-00015")
    assert not list(tmp_path.iterdir())
