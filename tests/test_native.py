"""Numerical checks against known signals, invariants, and invalid inputs."""
import numpy as np
import pytest

from thoth import _native


def observations(seed=7, size=300):
    rng = np.random.default_rng(seed)
    times = np.sort(rng.uniform(0, 4000, size)) + 2450000.0
    phase = 2 * np.pi * (times - 2450000.0) / 317.5
    errors = rng.uniform(0.03, 0.09, size)
    magnitudes = (9.3 + 1.3 * np.sin(phase) + 0.45 * np.cos(2 * phase)
                  + rng.normal(0, errors))
    return times, magnitudes, errors


def test_recovers_irregular_two_harmonic_signal_and_residual_chi_square():
    times, magnitudes, errors = observations()
    result = _native.periodogram(times, magnitudes, errors, 200, 600, 5000, 2, 1)
    assert abs(result["period_days"] - 317.5) < 0.3
    assert max(result["powers"]) > 0.99
    assert len(result["coefficients"]) == 5
    assert len(result["frequencies"]) == 5000
    assert result["valid_frequencies"] == 5000
    assert np.allclose(np.diff(result["frequencies"]),
                       (1 / 200 - 1 / 600) / 4999)
    assert result["frequencies"][0] == pytest.approx(1 / 600)
    assert result["frequencies"][-1] == pytest.approx(1 / 200)
    model = np.array(_native.evaluate(times, result["period_days"],
                                     result["coefficients"], result["reference_epoch_jd"]))
    fitted_phase = 2 * np.pi * (times - result["reference_epoch_jd"]) / result["period_days"]
    design = np.column_stack([np.ones_like(times), np.sin(fitted_phase),
                              np.cos(fitted_phase), np.sin(2 * fitted_phase),
                              np.cos(2 * fitted_phase)])
    # NumPy's SVD-based least squares is an independent check of the native solver.
    expected_coefficients = np.linalg.lstsq(design / errors[:, None],
                                          magnitudes / errors, rcond=None)[0]
    np.testing.assert_allclose(result["coefficients"], expected_coefficients, atol=1e-10)
    expected_chi2 = np.sum(((magnitudes - model) / errors) ** 2)
    assert result["chi2"] == pytest.approx(expected_chi2, rel=1e-10)
    assert result["reduced_chi2"] == pytest.approx(expected_chi2 / (len(times) - 5))
    assert 0.5 < result["reduced_chi2"] < 1.7
    weighted_mean = np.average(magnitudes, weights=1 / errors**2)
    chi2_constant = np.sum(((magnitudes - weighted_mean) / errors) ** 2)
    assert max(result["powers"]) == pytest.approx(1 - expected_chi2 / chi2_constant)
    assert result["mean_magnitude"] == pytest.approx(weighted_mean)
    dense_phase = np.linspace(0, 1, 20001)
    dense_model = _native.evaluate(result["reference_epoch_jd"] +
                                  dense_phase * result["period_days"],
                                  result["period_days"], result["coefficients"],
                                  result["reference_epoch_jd"])
    assert result["amplitude_mag"] == pytest.approx(np.ptp(dense_model), abs=1e-5)
    assert result["model_times"][0] == times.min()
    assert result["model_times"][-1] == times.max()


def test_time_translation_and_common_error_scale_preserve_fit():
    times, magnitudes, errors = observations(size=120)
    original = _native.periodogram(times, magnitudes, errors, 200, 600, 1500, 2, 1)
    shifted = _native.periodogram(times + 12345, magnitudes, errors * 3,
                                 200, 600, 1500, 2, 1)
    assert shifted["period_days"] == original["period_days"]
    assert shifted["reference_epoch_jd"] == pytest.approx(original["reference_epoch_jd"] + 12345)
    np.testing.assert_allclose(shifted["powers"], original["powers"], atol=1e-12)
    np.testing.assert_allclose(shifted["coefficients"], original["coefficients"], atol=1e-10)
    assert shifted["chi2"] == pytest.approx(original["chi2"] / 9)


def test_heteroscedastic_weights_downweight_an_outlier():
    times = np.linspace(0, 2100, 120)
    magnitudes = 10 + np.sin(2 * np.pi * times / 300)
    magnitudes[40] += 15
    errors = np.full(120, 0.05)
    errors[40] = 100
    result = _native.periodogram(times, magnitudes, errors, 250, 350, 3000, 1, 1)
    assert abs(result["period_days"] - 300) < 0.1
    assert result["amplitude_mag"] == pytest.approx(2, abs=0.005)
    assert result["chi2"] < 1


def test_three_harmonics_recovers_exact_signal_at_grid_boundary():
    rng = np.random.default_rng(4)
    times = np.sort(rng.uniform(-2000, 2000, 150)) + 2450000.0
    phase = 2 * np.pi * (times - 2450000.0) / 300
    magnitudes = 10 + np.sin(phase) + 0.4 * np.cos(2 * phase) + 0.2 * np.sin(3 * phase)
    result = _native.periodogram(times, magnitudes, np.full(150, 0.05),
                                 300, 500, 1000, 3, 1)
    assert result["period_days"] == pytest.approx(300)
    assert len(result["coefficients"]) == 7
    assert max(result["powers"]) == pytest.approx(1)
    assert result["chi2"] < 1e-18


def test_rank_deficient_trial_is_marked_nan_and_excluded():
    times = np.arange(50, dtype=float)
    magnitudes = 10 + np.sin(2 * np.pi * times / 10)
    result = _native.periodogram(times, magnitudes, np.ones(50), 1, 100, 100, 1, 1)
    assert np.isnan(result["powers"][-1])
    assert result["valid_frequencies"] < 100
    # Daily sampling makes f=0.1 and f=0.9 indistinguishable at these times.
    # The solver must preserve that ambiguity instead of preferring a known truth.
    assert result["powers"][9] == pytest.approx(np.nanmax(result["powers"]), abs=1e-12)
    assert result["chi2"] < 1e-20


@pytest.mark.parametrize("changes, message", [
    ({"harmonics": 0}, "harmonics"),
    ({"harmonics": 4}, "harmonics"),
    ({"min_period": 0}, "Periods"),
    ({"max_period": 99}, "Periods"),
    ({"min_period": float("nan")}, "Periods"),
    ({"samples": 1}, "samples"),
    ({"samples": 250001}, "samples"),
    ({"threads": -1}, "threads"),
])
def test_rejects_invalid_scan_settings(changes, message):
    with pytest.raises(ValueError, match=message):
        _native.periodogram(*observations(size=30), **changes)


def test_rejects_invalid_observations_and_work_limit():
    times, magnitudes, errors = observations(size=20)
    with pytest.raises(ValueError, match="equal lengths"):
        _native.periodogram(times[:-1], magnitudes, errors)
    with pytest.raises(ValueError, match="observations are required"):
        _native.periodogram(times[:6], magnitudes[:6], errors[:6])
    with pytest.raises(ValueError, match="one-dimensional"):
        _native.periodogram(times.reshape(4, 5), magnitudes, errors)
    bad_magnitudes = magnitudes.copy()
    bad_magnitudes[0] = np.inf
    with pytest.raises(ValueError, match="finite"):
        _native.periodogram(times, bad_magnitudes, errors)
    errors[0] = 0
    with pytest.raises(ValueError, match="positive"):
        _native.periodogram(times, magnitudes, errors)
    with pytest.raises(ValueError, match="variance"):
        _native.periodogram(times, np.full(20, 10.0), np.ones(20))
    with pytest.raises(ValueError, match="variance"):
        _native.periodogram(times, np.full(20, 10.1), np.linspace(0.03, 0.7, 20))
    with pytest.raises(ValueError, match="baseline"):
        _native.periodogram(np.full(20, times[0]), magnitudes, np.ones(20))
    with pytest.raises(ValueError, match="full-rank"):
        _native.periodogram(np.tile([0.0, 100.0], 10), magnitudes, np.ones(20))
    with pytest.raises(ValueError, match="work limit"):
        _native.periodogram(*observations(size=1000), samples=250000, harmonics=3)


def test_evaluate_validates_and_accepts_python_lists():
    assert _native.evaluate([0, 0.25, 0.5], 1, [10, 2, 0], 0) == pytest.approx([10, 12, 10])
    with pytest.raises(ValueError, match="sine/cosine"):
        _native.evaluate([0], 1, [10, 2], 0)
    with pytest.raises(ValueError, match="positive"):
        _native.evaluate([0], 0, [10, 2, 0], 0)
    with pytest.raises(ValueError, match="finite"):
        _native.evaluate([np.nan], 1, [10, 2, 0], 0)
