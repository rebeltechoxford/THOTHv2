"""Independent numeric checks and research interpretation invariants."""
import json

import numpy as np
import pytest

from thoth import _native
from thoth.catalog import EXAMPLE_STAR_ID, load_lightcurve
from thoth.research import _metrics, investigate_lightcurve, simulate_pulsation


def synthetic_curve(third_harmonic=False, size=240):
    rng = np.random.default_rng(42)
    times = np.sort(rng.uniform(0, 4200, size)) + 2450000
    angle = 2 * np.pi * (times - 2450000) / 317.5
    errors = rng.uniform(0.02, 0.04, size)
    magnitudes = 10 + 1.2 * np.sin(angle) + 0.45 * np.cos(2 * angle)
    if third_harmonic:
        magnitudes += 0.35 * np.sin(3 * angle)
    magnitudes += rng.normal(0, errors)
    return {"observations": [{"time_jd": t, "magnitude": m, "error_mag": e, "band": "I"}
                             for t, m, e in zip(times, magnitudes, errors)],
            "source_url": "synthetic://known-test-signal", "time_system": "synthetic JD", "band": "I"}


def test_metrics_preserve_representable_large_rms_without_squaring_overflow():
    result = _metrics([{"magnitude": 1e180, "error_mag": 1e180},
                       {"magnitude": -1e180, "error_mag": 1e180}], [0, 0])
    assert result["rmse_mag"] == pytest.approx(1e180)
    assert result["weighted_rmse_mag"] == pytest.approx(1e180)
    assert result["chi2"] == pytest.approx(2)
    json.dumps(result, allow_nan=False)


@pytest.mark.parametrize("observations,predictions", [
    ([{"magnitude": 1e308, "error_mag": 1}], [-1e308]),
    ([{"magnitude": 1e180, "error_mag": 1}], [0]),
    ([{"magnitude": 1e308, "error_mag": 1e-308}], [0]),
])
def test_metrics_reject_nonrepresentable_residual_or_chi_square(observations, predictions):
    with pytest.raises(ValueError, match="finite numeric scale"):
        _metrics(observations, predictions)


def test_fixed_native_frequency_agrees_with_independent_weighted_numpy_solver():
    curve = synthetic_curve()
    times, magnitudes, errors = (np.array([o[key] for o in curve["observations"]])
                                 for key in ("time_jd", "magnitude", "error_mag"))
    fit = _native.fit_frequency(times, magnitudes, errors, 1 / 317.5, 2)
    angle = 2 * np.pi * (times - fit["reference_epoch_jd"]) / 317.5
    design = np.column_stack([np.ones(len(times)), np.sin(angle), np.cos(angle),
                              np.sin(2 * angle), np.cos(2 * angle)])
    expected = np.linalg.lstsq(design / errors[:, None], magnitudes / errors, rcond=None)[0]
    np.testing.assert_allclose(fit["coefficients"], expected, atol=1e-10)
    assert fit["chi2"] == pytest.approx(np.sum(((magnitudes - design @ expected) / errors) ** 2), rel=1e-10)


def test_sampling_window_matches_direct_complex_sum_and_is_time_translation_invariant():
    times = np.array([0.1, 5, 33, 50, 117, 160])
    frequencies = np.array([0, 0.003, 0.015, 0.027])
    result = _native.spectral_window(times, frequencies, 1)
    expected = np.abs(np.exp(2j * np.pi * times[:, None] * frequencies).mean(axis=0)) ** 2
    np.testing.assert_allclose(result["powers"], expected, atol=1e-13)
    shifted = _native.spectral_window(times + 2450000, frequencies, 1)
    np.testing.assert_allclose(result["powers"], shifted["powers"], atol=1e-11)
    assert result["powers"][0] == pytest.approx(1)
    assert all(0 <= value <= 1 for value in result["powers"])


def test_holdout_detects_missing_harmonics_and_keeps_predictions_chronological():
    curve = synthetic_curve(third_harmonic=True)
    events = []
    result = investigate_lightcurve(curve, 300, 335, samples=1000, progress=events.append)
    models = result["models"]
    assert result["selected_model"]["harmonics"] == 3
    assert models[0]["holdout_weighted_rmse_mag"] > 6 * models[2]["holdout_weighted_rmse_mag"]
    assert models[1]["holdout_weighted_rmse_mag"] > 3 * models[2]["holdout_weighted_rmse_mag"]
    assert abs(result["selected_model"]["period_days"] - 317.5) < 0.1
    assert result["training_observations"] == 192
    assert result["holdout_observations"] == 48
    training_times = [r["time_jd"] for r in result["residuals"] if r["partition"] == "training"]
    heldout_times = [r["time_jd"] for r in result["residuals"] if r["partition"] == "holdout"]
    assert max(training_times) <= min(heldout_times)
    for model in models:
        k = 2 * model["harmonics"] + 2
        assert model["effective_parameters"] == k
        assert model["aic"] == pytest.approx(model["training_chi2"] + 2 * k)
        assert model["bic"] == pytest.approx(model["training_chi2"] + k * np.log(192))
    assert [event["percent"] for event in events] == sorted(event["percent"] for event in events)
    assert events[-1]["stage"] == "complete"
    assert result["computation"]["frequency_scans"] == 6
    assert result["computation"]["observation_frequency_harmonic_evaluations"] > 1_000_000
    assert len(result["stability"]) == 2
    assert all(row["status"] == "computed" for row in result["stability"])
    assert any("not established" in event["detail"] for event in events)
    json.dumps(result, allow_nan=False)


def test_real_photometry_evidence_has_measured_provenance_and_computed_residuals():
    curve = load_lightcurve(EXAMPLE_STAR_ID)
    result = investigate_lightcurve(curve, 90, 94, samples=80)
    assert result["provenance"]["source_url"] == curve["source_url"]
    assert result["provenance"]["used_observations"] == min(3000, len(curve["observations"]))
    assert result["provenance"]["input_observations"] == len(curve["observations"])
    assert len(result["provenance"]["input_sha256"]) == 64
    assert result["provenance"]["observation_span_days"] > 3000
    assert 90 <= result["full_fit"]["period_days"] <= 94
    model = result["selected_model"]
    expected = _native.evaluate([r["time_jd"] for r in result["residuals"]], model["period_days"],
                                model["coefficients"], model["reference_epoch_jd"])
    for row, predicted in zip(result["residuals"], expected):
        assert row["predicted_magnitude"] == pytest.approx(predicted)
        assert row["residual_mag"] == pytest.approx(row["observed_magnitude"] - predicted)
    assert result["planning_anchor_jd"] == max(o["time_jd"] for o in curve["observations"])
    assert any("historical" in caveat for caveat in result["caveats"])
    json.dumps(result, allow_nan=False)


def test_candidate_observation_plan_uses_actual_prediction_disagreement():
    # Deliberately sparse, season-like cadence creates separated viable peaks.
    curve = synthetic_curve(size=60)
    result = investigate_lightcurve(curve, 60, 1200, samples=700)
    assert len(result["candidates"]) >= 2
    assert result["observation_plan"]
    for plan in result["observation_plan"]:
        assert plan["days_after_last_observation"] > 0
        assert plan["time_jd"] == pytest.approx(result["planning_anchor_jd"] + plan["days_after_last_observation"])
        predictions = []
        for candidate in result["candidates"]:
            predictions.append(_native.evaluate([plan["time_jd"]], candidate["period_days"],
                                                candidate["coefficients"], candidate["reference_epoch_jd"])[0])
        assert plan["prediction_spread_mag"] == pytest.approx(max(predictions) - min(predictions))
        assert [p["magnitude"] for p in plan["predictions"]] == pytest.approx(predictions)
    assert any("not an independent" in caveat for caveat in result["caveats"])


def test_subsampling_is_deterministic_preserves_baseline_and_reports_original_hash():
    curve = synthetic_curve()
    full = investigate_lightcurve(curve, 300, 335, samples=30)
    subset = investigate_lightcurve(curve, 300, 335, samples=30, observations_limit=60)
    assert subset["provenance"]["input_sha256"] == full["provenance"]["input_sha256"]
    assert subset["provenance"]["used_observations"] == 60
    assert subset["provenance"]["input_observations"] == 240
    assert subset["provenance"]["observation_span_days"] == full["provenance"]["observation_span_days"]
    assert "indices" in subset["provenance"]["subsampling"]


def test_duplicate_epoch_groups_do_not_leak_across_chronological_holdout():
    curve = synthetic_curve(size=241)
    # 482 rows gives floor(0.8*N)=385, halfway through a duplicate epoch.
    # Both independent same-epoch measurements must remain together.
    curve["observations"] = [dict(row) for row in curve["observations"] for _ in range(2)]
    result = investigate_lightcurve(curve, 300, 335, samples=100)
    training = {row["time_jd"] for row in result["residuals"] if row["partition"] == "training"}
    holdout = {row["time_jd"] for row in result["residuals"] if row["partition"] == "holdout"}
    assert training.isdisjoint(holdout)
    assert max(training) < min(holdout)
    assert result["training_observations"] == 386
    assert result["holdout_observations"] == 96
    assert result["holdout_fraction"] == pytest.approx(96 / 482)
    assert result["training_fraction"] == pytest.approx(386 / 482)
    assert any("timestamp-group boundary" in caveat for caveat in result["caveats"])


def test_rejects_when_timestamp_groups_cannot_leave_enough_later_holdout_rows():
    curve = synthetic_curve(size=30)
    for i, row in enumerate(curve["observations"]):
        row["time_jd"] = 2450000.0 if i < 25 else 2450300.0
    with pytest.raises(ValueError, match="timestamp-group boundary"):
        investigate_lightcurve(curve, 100, 1000, samples=30)


def test_uploaded_csv_provenance_keeps_original_and_canonical_measurement_hashes_separate():
    curve = synthetic_curve()
    curve.update({"sha256": "f" * 64, "dataset_id": "private-input-1", "name": "My I-band campaign",
                  "data_source": "user_upload"})
    result = investigate_lightcurve(curve, 300, 335, samples=30)
    provenance = result["provenance"]
    assert provenance["source_sha256"] == "f" * 64
    assert provenance["input_sha256"] != provenance["source_sha256"]
    assert provenance["dataset_id"] == curve["dataset_id"]
    assert provenance["dataset_name"] == curve["name"]
    assert provenance["data_source"] == "user_upload"


def test_linear_undamped_unforced_oscillator_matches_analytic_solution_and_converges():
    coarse = simulate_pulsation(period_days=317.5, damping=0, drive=0, nonlinearity=0, cycles=4, steps_per_cycle=64)
    refined = simulate_pulsation(period_days=317.5, damping=0, drive=0, nonlinearity=0, cycles=4, steps_per_cycle=128)
    expected = 0.1 * np.cos(2 * np.pi * np.array(refined["times_days"]) / 317.5)
    assert np.max(np.abs(np.array(refined["displacement"]) - expected)) < 1e-8
    assert refined["convergence"]["max_displacement_difference"] < coarse["convergence"]["max_displacement_difference"] / 12
    assert refined["convergence"]["energy_balance_error"] < coarse["convergence"]["energy_balance_error"] / 20
    assert max(refined["energy"]) - min(refined["energy"]) < 1e-10
    assert refined["times_days"][-1] == 4 * 317.5
    assert refined["computation"]["derivative_evaluations"] == 4 * 128 * 12


def test_damping_and_driving_obey_computed_work_energy_balance():
    damped = simulate_pulsation(damping=0.1, drive=0, nonlinearity=0.3, cycles=6)
    assert damped["energy"][-1] < damped["energy"][0] / 100
    assert all(b <= a + 1e-12 for a, b in zip(damped["energy"], damped["energy"][1:]))
    driven = simulate_pulsation(damping=0.05, drive=0.15, nonlinearity=0.2, cycles=6)
    balance = (np.array(driven["energy"]) - driven["energy"][0] -
               np.array(driven["drive_work"]) + np.array(driven["dissipated_energy"]))
    assert np.max(np.abs(balance)) == pytest.approx(driven["convergence"]["energy_balance_error"])
    assert np.max(np.abs(balance)) < 1e-7
    assert driven["native_seconds"] > 0
    assert "illustrative" in driven["model_kind"]
    assert any("not a calibrated" in caveat for caveat in driven["caveats"])
    json.dumps(driven, allow_nan=False)


@pytest.mark.parametrize("kwargs,match", [
    ({"samples": 3001}, "samples"), ({"threads": -1}, "threads"),
    ({"observations_limit": 20}, "observations_limit"), ({"min_period": 0}, "period"),
    ({"max_period": float("inf")}, "period"),
])
def test_research_rejects_invalid_resources(kwargs, match):
    options = {"min_period": 100, "max_period": 1000, **kwargs}
    with pytest.raises(ValueError, match=match):
        investigate_lightcurve(synthetic_curve(), **options)


def test_research_rejects_insufficient_mixed_band_and_budget_overflow():
    curve = synthetic_curve(size=24)
    with pytest.raises(ValueError, match="30"):
        investigate_lightcurve(curve, 100, 1000)
    curve = synthetic_curve()
    curve["observations"].append({**curve["observations"][0], "band": "V"})
    with pytest.raises(ValueError, match="single band"):
        investigate_lightcurve(curve, 100, 1000)
    result = investigate_lightcurve(curve, 300, 335, samples=50, band="I")
    assert result["provenance"]["band"] == "I"
    with pytest.raises(ValueError, match="48 million"):
        investigate_lightcurve(synthetic_curve(size=3000), 100, 1000, samples=3000)


@pytest.mark.parametrize("kwargs", [{"damping": -1}, {"drive": 3}, {"nonlinearity": -1},
                                    {"period_days": float("nan")}, {"cycles": 0},
                                    {"steps_per_cycle": 32}, {"cycles": 1.5}])
def test_oscillator_rejects_invalid_controls(kwargs):
    with pytest.raises(ValueError):
        simulate_pulsation(**kwargs)
