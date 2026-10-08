"""Evidence, missing-data, geometry, and conditional reconstruction invariants."""
import json
import math

import numpy as np
import pytest

from thoth.catalog import EXAMPLE_STAR_ID, get_star, load_catalog, load_lightcurve
from thoth.space import (_counterfactual_predictions, _fit_cached, build_star_model, build_transform_surface,
                         prepare_space_catalog)


def star(identifier="test", ra=0.0, dec=0.0, **extra):
    return {"id": identifier, "name": identifier, "ra_deg": ra, "dec_deg": dec,
            "period_days": 211.0, "catalog": "Test catalog", "region": "Test region",
            "source_url": "synthetic://geometry-tests", **extra}


def curve(size=120):
    rng = np.random.default_rng(42)
    times = np.sort(rng.uniform(0, 2400, size)) + 2450000
    magnitudes = 12 + 0.8 * np.sin(2 * np.pi * (times - 2450000) / 211)
    return {"observations": [{"time_jd": float(t), "magnitude": float(m), "error_mag": 0.03, "band": "I"}
                              for t, m in zip(times, magnitudes)],
            "source_url": "synthetic://measured-model-fixture", "time_system": "synthetic JD"}


def test_every_row_keeps_identity_and_unknown_coordinates_are_null():
    rows = [star("known"), star("missing", None, None), star("invalid", 10, 91),
            star("other", 90, 0, catalog="Other catalog", period_days=None)]
    result = prepare_space_catalog(rows, longitude_bins=8, latitude_bins=4)
    assert [row["id"] for row in result["stars"]] == [row["id"] for row in rows]
    assert result["positions"][0] == pytest.approx([1, 0, 0])
    assert result["positions"][1:3] == [None, None]
    assert result["positions"][3] == pytest.approx([0, 0, -1], abs=1e-14)
    assert result["counts"]["catalog_entries"] == 4
    assert result["counts"]["mapped_entries"] == 2
    assert result["counts"]["missing_coordinates"] == 2
    assert result["counts"]["period_known"] == 3
    assert sum(group["count"] for group in result["groups"]) == 4
    assert sum(cell["count"] for cell in result["density_cells"]) == 2
    assert result["geometry"]["distance_unit"] is None
    assert any("not identified gravitationally bound" in caveat for caveat in result["caveats"])
    json.dumps(result, allow_nan=False)


def test_empty_filter_result_keeps_an_explicit_empty_geometry():
    result = prepare_space_catalog([], longitude_bins=8, latitude_bins=4)
    assert result["stars"] == result["positions"] == result["galactic_positions"] == []
    assert result["groups"] == []
    assert result["counts"]["catalog_entries"] == result["counts"]["mapped_entries"] == 0
    assert all(cell["count"] == 0 for cell in result["density_cells"])
    json.dumps(result, allow_nan=False)


def test_antipodal_group_has_no_invented_centroid():
    result = prepare_space_catalog([star("first", 0, 0), star("opposite", 180, 0)])
    assert result["groups"][0]["centroid"] is None
    assert result["groups"][0]["mapped_count"] == 2


def test_group_spherical_centroid_and_density_use_actual_observed_directions():
    result = prepare_space_catalog([star("first", 0, 0), star("second", 90, 0)])
    assert result["groups"][0]["centroid"] == pytest.approx([math.sqrt(0.5), 0, -math.sqrt(0.5)])
    assert sum(cell["solid_angle_sr"] for cell in result["density_cells"]) == pytest.approx(4 * math.pi)
    for cell in result["density_cells"]:
        assert cell["density_per_sr"] == pytest.approx(cell["count"] / cell["solid_angle_sr"])


def test_full_bundled_catalog_preserves_all_entries_and_source_hash():
    rows = load_catalog()
    result = prepare_space_catalog(rows, longitude_bins=24, latitude_bins=12)
    assert result["counts"]["catalog_entries"] == 75916
    assert len(result["positions"]) == len(result["galactic_positions"]) == len(rows)
    assert sum(group["count"] for group in result["groups"]) == len(rows)
    assert len(result["provenance"]["catalog_snapshot_sha256"]) == 64
    assert len(result["provenance"]["selected_entries_sha256"]) == 64
    assert result["computation"]["coordinate_evaluations"] >= len(rows)


def test_catalog_only_star_has_geometry_but_no_invented_photometry():
    result = build_star_model(star(), phase=0.125, resolution=8)
    assert result["photometry_status"] == "unavailable"
    assert result["phase_model"] == []
    assert result["fit"] is None
    assert result["relative_flux_at_phase"] is None
    assert result["geometry"]["physical_radius"] is None
    assert result["mesh"]["vertex_count"] > 0
    assert len(result["mesh"]["indices"]) == 3 * result["mesh"]["triangle_count"]
    json.dumps(result, allow_nan=False)


def test_measured_fit_reuses_native_search_and_brightness_matches_magnitude():
    _fit_cached.cache_clear()
    observations = curve()
    first = build_star_model(star(), observations, phase=0.0, resolution=8)
    second = build_star_model(star(), observations, phase=0.25, resolution=12)
    assert _fit_cached.cache_info().misses == 1
    assert _fit_cached.cache_info().hits == 1
    assert first["fit"] == second["fit"]
    assert first["provenance"]["photometry"]["fit_reused"] is False
    assert second["provenance"]["photometry"]["fit_reused"] is True
    assert abs(first["fit"]["period_days"] - 211) < 1
    assert first["photometry_status"] == "available"
    assert first["provenance"]["photometry"]["source_url"] == observations["source_url"]
    for sample in first["phase_model"]:
        expected = 10 ** (-0.4 * (sample["magnitude"] - first["fit"]["mean_model_magnitude"]))
        assert sample["relative_flux"] == pytest.approx(expected)
    assert second["relative_flux_at_phase"] == pytest.approx(second["phase_model"][75]["relative_flux"])
    assert first["geometry"]["physical_radius"] is None
    json.dumps(second, allow_nan=False)


def test_different_data_consistent_radius_temperature_families_reconstruct_same_photometry():
    observations = curve()
    fixed_radius = build_star_model(star(), observations, phase=0.25, resolution=8, radius_fraction=0)
    fixed_temperature = build_star_model(star(), observations, phase=0.25, resolution=8, radius_fraction=1)
    assert fixed_radius["relative_flux_at_phase"] == fixed_temperature["relative_flux_at_phase"]
    assert fixed_radius["selected_model"]["radius_relative"] == pytest.approx(1)
    assert fixed_temperature["selected_model"]["temperature_k"] == pytest.approx(3000)
    assert fixed_radius["selected_model"]["temperature_k"] != pytest.approx(3000)
    assert fixed_temperature["selected_model"]["radius_relative"] != pytest.approx(1)
    for model in (fixed_radius, fixed_temperature):
        family = model["radiative_family"]
        assert len(family["phases"]) == len(family["radii_relative"]) == len(family["relative_fluxes"]) == 301
        assert family["reconstructed_fluxes"] == pytest.approx(family["relative_fluxes"], rel=1e-12)
        assert max(abs(residual) for residual in family["residuals"]) < 1e-10
        assert model["selected_model"]["reconstructed_flux"] == pytest.approx(model["relative_flux_at_phase"])
        radius = model["selected_model"]["radius_relative"]
        assert model["mesh"]["minimum_radius"] == pytest.approx(radius)
        assert model["mesh"]["maximum_radius"] == pytest.approx(radius)
        assert model["geometry"]["physical_radius"] is None
        predictions = family["counterfactual_predictions"]
        assert [item["label"] for item in predictions] == ["V", "I", "K"]
        assert predictions[1]["relative_fluxes"] == pytest.approx(family["relative_fluxes"], rel=1e-12)
        assert all(item["kind"] == "unmeasured monochromatic proxy prediction" for item in predictions)
        json.dumps(model, allow_nan=False)
    radius_k = fixed_radius["radiative_family"]["counterfactual_predictions"][2]["relative_fluxes"]
    temperature_k = fixed_temperature["radiative_family"]["counterfactual_predictions"][2]["relative_fluxes"]
    assert np.max(np.abs(np.array(radius_k) - np.array(temperature_k))) > 0.1


def test_counterfactual_band_predictions_match_independent_planck_ratios():
    result = build_star_model(star(), curve(), resolution=8, radius_fraction=0.35)
    family = result["radiative_family"]
    hc_over_k_um = (6.62607015e-34 * 299792458.0 / 1.380649e-23) * 1e6
    radii = np.array(family["radii_relative"])
    temperatures = np.array(family["temperatures_k"])
    for prediction in family["counterfactual_predictions"]:
        scale = hc_over_k_um / prediction["wavelength_um"]
        expected = radii**2 * np.expm1(scale / 3000) / np.expm1(scale / temperatures)
        assert prediction["relative_fluxes"] == pytest.approx(expected, rel=1e-12)
        assert prediction["delta_magnitudes"] == pytest.approx(-2.5 * np.log10(expected), rel=1e-12, abs=1e-12)


def test_counterfactual_flux_underflow_remains_missing_while_magnitude_is_finite():
    from thoth import _native
    family = dict(_native.radiative_phase_family([1e-12, 1.0], 1000.0, 500.0, 0.0))
    predictions = _counterfactual_predictions(family)
    assert all(prediction["relative_fluxes"][0] is None for prediction in predictions)
    assert all(prediction["relative_fluxes"][1] == pytest.approx(1) for prediction in predictions)
    assert all(math.isfinite(prediction["delta_magnitudes"][0]) for prediction in predictions)
    json.dumps(predictions, allow_nan=False)


def test_unrecognized_band_preserves_measured_fit_without_inventing_wavelength():
    observations = curve()
    for row in observations["observations"]:
        row["band"] = "custom-instrument"
    unsupported = build_star_model(star(), observations, resolution=8)
    assert unsupported["photometry_status"] == "available"
    assert unsupported["fit"] is not None
    assert unsupported["radiative_family"] is None
    assert "representative wavelength" in unsupported["radiative_message"]
    supplied = build_star_model(star(), observations, resolution=8, wavelength_um=1.2)
    assert supplied["radiative_family"]["wavelength_um"] == 1.2
    assert supplied["radiative_family"]["wavelength_source"] == "user assumption"


@pytest.mark.parametrize("options", [{"radius_fraction": -0.1}, {"radius_fraction": 1.1},
                                    {"reference_temperature_k": 100}, {"wavelength_um": 0.01}])
def test_reconstruction_controls_reject_invalid_assumptions(options):
    with pytest.raises(ValueError):
        build_star_model(star(), curve(), resolution=8, **options)


def test_real_measured_star_preserves_input_hash_and_deterministic_baseline_subset():
    source = load_lightcurve(EXAMPLE_STAR_ID)
    result = build_star_model(get_star(EXAMPLE_STAR_ID), source, resolution=8)
    provenance = result["provenance"]["photometry"]
    assert provenance["input_observations"] == len(source["observations"])
    assert provenance["used_observations"] == 3000
    assert len(provenance["input_sha256"]) == 64
    expected_span = source["observations"][-1]["time_jd"] - source["observations"][0]["time_jd"]
    assert provenance["observation_span_days"] == expected_span
    assert result["fit"]["n_observations"] == 3000
    assert result["photometry_status"] == "available"
    json.dumps(result, allow_nan=False)


def test_fewer_than_needed_observations_remain_unidentifiable():
    result = build_star_model(star(), curve(size=5), resolution=8)
    assert result["photometry_status"] == "unidentifiable"
    assert result["fit"] is None
    assert result["phase_model"] == []
    assert result["radiative_family"] is None
    assert "Insufficient" in result["photometry_message"]


def test_mixed_band_photometry_cannot_drive_one_brightness_surface():
    observations = curve()
    observations["observations"][0]["band"] = "V"
    with pytest.raises(ValueError, match="one photometric band"):
        build_star_model(star(), observations)


@pytest.mark.parametrize("options", [{"resolution": 129}, {"phase": float("nan")},
                                    {"displacement": 0.6}, {"contrast": -0.1}])
def test_mesh_controls_reject_invalid_resources(options):
    with pytest.raises(ValueError):
        build_star_model(star(), **options)


@pytest.mark.parametrize("options", [{"longitude_bins": 361}, {"latitude_bins": 1}, {"threads": -1}])
def test_catalog_controls_reject_invalid_resources(options):
    with pytest.raises(ValueError):
        prepare_space_catalog([star()], **options)


def test_catalog_rejects_duplicate_entry_identity():
    with pytest.raises(ValueError, match="distinct"):
        prepare_space_catalog([star(), star()])


def test_computed_transform_surface_preserves_missing_cells_and_raw_axes():
    report = {"chirp": {"frequencies": [0.01, 0.02, 0.03],
                        "frequency_derivatives": [-1e-8, 0, 1e-8],
                        "powers": [[0.1, 0.2, 0.3], [0.2, None, 0.4], [0.3, 0.4, 0.5]]},
              "provenance": {"source_url": "synthetic://computed-test-map"}}
    result = build_transform_surface(report)
    assert result["axes"]["x"]["values"] == report["chirp"]["frequencies"]
    assert result["powers"][1][1] is None
    assert result["mesh"]["missing_vertices"] == 1
    assert result["mesh"]["triangle_count"] == 0
    assert result["provenance"] == report["provenance"]
    json.dumps(result, allow_nan=False)


def test_computed_transform_surface_keeps_finite_statistic_heights():
    report = {"transforms": {"localized": {"frequencies": [0.01, 0.02],
                                            "time_centers_jd": [2450000, 2450500],
                                            "powers": [[0.1, 0.3], [0.5, 0.9]]}},
              "provenance": {"time_system": "HJD"}}
    result = build_transform_surface(report, "localized")
    assert np.array(result["mesh"]["positions"]).reshape(-1, 3)[:, 1] == pytest.approx([0.1, 0.3, 0.5, 0.9])
    assert result["mesh"]["triangle_count"] == 2
    assert result["axes"]["z"]["unit"] == "HJD"


@pytest.mark.parametrize("report,kind", [({}, "chirp"), ({}, "unknown"),
    ({"chirp": {"frequencies": [0.1, 0.2], "frequency_derivatives": [0, 1], "powers": [[None, None], [None, None]]}}, "chirp"),
    ({"chirp": {"frequencies": [0.1, 0.2], "frequency_derivatives": [0, 1], "powers": [[0.1], [0.2]]}}, "chirp")])
def test_transform_surface_rejects_absent_or_invalid_grids(report, kind):
    with pytest.raises(ValueError):
        build_transform_surface(report, kind)
