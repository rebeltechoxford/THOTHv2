"""Independent reference calculations for irregular-cadence C++ transforms."""
import numpy as np
import pytest

from thoth import _native


def chirp_data():
    rng = np.random.default_rng(9401)
    times = np.sort(rng.uniform(0, 8000, 360)) + 2450000
    dt = times - (times.min() + (times.max() - times.min()) / 2)
    frequency, derivative = 1 / 160, 2e-7
    angle = 2 * np.pi * (frequency * dt + 0.5 * derivative * dt ** 2)
    errors = rng.uniform(0.03, 0.07, len(times))
    magnitudes = 12 + np.sin(angle) + 0.35 * np.cos(2 * angle)
    magnitudes += rng.normal(0, errors)
    return times, magnitudes, errors


def weighted_power(times, magnitudes, errors, frequency, derivative=0, center=None, window=None):
    if center is None:
        center = times.min() + (times.max() - times.min()) / 2
    dt = times - center
    angle = 2 * np.pi * (frequency * dt + 0.5 * derivative * dt ** 2)
    harmonics = 2 if window is None else 1
    columns = [np.ones(len(times))]
    for harmonic in range(1, harmonics + 1):
        columns.extend([np.sin(harmonic * angle), np.cos(harmonic * angle)])
    design = np.column_stack(columns)
    weights = (errors.min() / errors) ** 2
    if window is not None:
        weights *= np.exp(-0.5 * (dt * frequency / window) ** 2)
    root = np.sqrt(weights)
    coefficients = np.linalg.lstsq(design * root[:, None], magnitudes * root, rcond=None)[0]
    baseline = np.sum(weights * (magnitudes - np.average(magnitudes, weights=weights)) ** 2)
    chi2 = np.sum(weights * (magnitudes - design @ coefficients) ** 2)
    return 1 - chi2 / baseline, weights.sum() ** 2 / np.sum(weights ** 2)


def test_chirp_scan_recovers_frequency_derivative_and_matches_numpy_lstsq():
    times, magnitudes, errors = chirp_data()
    result = _native.chirp_periodogram(times, magnitudes, errors, 120, 240, 81, 21, 4e-7, 2, 2)
    assert result["best_period_days"] == pytest.approx(160)
    assert result["best_frequency_derivative"] == pytest.approx(2e-7)
    powers = np.array(result["powers"])
    for row, column in [(0, 0), (10, 40), (15, 40), (20, 80)]:
        expected, _ = weighted_power(times, magnitudes, errors, result["frequencies"][column],
                                    result["frequency_derivatives"][row])
        assert powers[row, column] == pytest.approx(expected, abs=2e-12)
    fixed = _native.chirp_periodogram(times, magnitudes, errors, 120, 240, 81, 1, 0, 2, 1)
    assert powers.max() > np.max(fixed["powers"]) + 0.15
    assert result["observation_cell_evaluations"] == len(times) * 81 * 21


def test_chirp_masks_nonpositive_instantaneous_frequency_and_preserves_threads():
    times, magnitudes, errors = chirp_data()
    one = _native.chirp_periodogram(times, magnitudes, errors, 120, 240, 32, 9, 5e-6, 1, 1)
    many = _native.chirp_periodogram(times, magnitudes, errors, 120, 240, 32, 9, 5e-6, 1, 4)
    np.testing.assert_array_equal(one["powers"], many["powers"])
    powers = np.array(one["powers"])
    assert np.isnan(powers[0]).all()
    assert np.isfinite(powers[4]).all()
    assert one["evaluated_cells"] < one["requested_cells"]


def test_localized_sinusoid_matches_numpy_reference_and_follows_period_change():
    rng = np.random.default_rng(75)
    times = np.sort(rng.uniform(0, 2000, 1800))
    cycles = np.where(times < 1000, times / 150, 1000 / 150 + (times - 1000) / 90)
    errors = rng.uniform(0.03, 0.08, len(times))
    magnitudes = 9 + np.sin(2 * np.pi * cycles) + rng.normal(0, 0.02, len(times))
    result = _native.localized_periodogram(times, magnitudes, errors, 70, 180, 100, 9, 0.4, 3)
    powers = np.array(result["powers"])
    frequencies = np.array(result["frequencies"])
    assert 1 / frequencies[np.nanargmax(powers[1])] == pytest.approx(150, abs=2)
    assert 1 / frequencies[np.nanargmax(powers[7])] == pytest.approx(90, abs=2)
    for row, column in [(0, 20), (3, 50), (8, 80)]:
        power, effective = weighted_power(times, magnitudes, errors, frequencies[column],
                                         center=result["time_centers_jd"][row], window=0.4)
        assert powers[row, column] == pytest.approx(power, abs=3e-12)
        assert result["effective_observations"][row][column] == pytest.approx(effective, rel=1e-13)
    serial = _native.localized_periodogram(times, magnitudes, errors, 70, 180, 100, 9, 0.4, 1)
    np.testing.assert_array_equal(result["powers"], serial["powers"])
    assert "WWZ" not in result["method"]
    assert result["observation_cell_evaluations"] == len(times) * 100 * 9


def test_localized_transform_marks_low_effective_support():
    times = np.array([0, 0.1, 0.3, 0.4, 300, 1000, 5000.0])
    result = _native.localized_periodogram(times, np.sin(times), np.ones(7), 0.5, 1, 16, 3, 0.25, 1)
    assert np.isnan(result["powers"]).all()
    assert np.max(result["effective_observations"]) < 5


def test_phase_dispersion_recovers_nonsinusoidal_period_and_matches_direct_weighted_bins():
    rng = np.random.default_rng(209)
    times = np.sort(rng.uniform(0, 1500, 600))
    errors = rng.uniform(0.03, 0.08, len(times))
    phase = (times / 125) % 1
    magnitudes = 11 + 2 * phase + rng.normal(0, errors)
    result = _native.phase_dispersion(times, magnitudes, errors, 100, 145, 400, 12, 3)
    assert result["best_period_days"] == pytest.approx(125, abs=0.5)
    index = 120
    centered = times - (times.min() + (times.max() - times.min()) / 2)
    bins = np.floor((centered * result["frequencies"][index] % 1) * 12).astype(int)
    weights = 1 / errors ** 2
    within = sum(np.sum(weights[bins == bin] * (magnitudes[bins == bin] -
                 np.average(magnitudes[bins == bin], weights=weights[bins == bin])) ** 2)
                 for bin in range(12))
    global_residual = np.sum(weights * (magnitudes - np.average(magnitudes, weights=weights)) ** 2)
    assert result["theta"][index] == pytest.approx(within / global_residual, abs=1e-13)
    serial = _native.phase_dispersion(times, magnitudes, errors, 100, 145, 400, 12, 1)
    np.testing.assert_array_equal(result["theta"], serial["theta"])
    assert result["observation_frequency_evaluations"] == len(times) * 400


def test_phase_dispersion_does_not_treat_singleton_bins_as_period_evidence():
    times = np.array([0, 0.31, 1.15, 2.73, 4.43, 6.21, 9.59, 13.37])
    result = _native.phase_dispersion(times, np.sin(times), np.ones(8), 2, 4, 16, 128, 1)
    assert np.isnan(result["theta"]).all()
    assert np.isnan(result["best_period_days"])


def test_structure_function_matches_all_unordered_pairs_and_keeps_negative_noise_correction():
    times = np.array([0, 1, 4, 7, 7, 11.0])
    magnitudes = np.array([10, 10.1, 10.5, 10.2, 10.3, 10.7])
    errors = np.ones(len(times)) * 2
    result = _native.structure_function(times, magnitudes, errors, 4, 12, 3)
    expected = [[] for _ in range(4)]
    for i in range(len(times)):
        for j in range(i + 1, len(times)):
            lag = abs(times[j] - times[i])
            if 0 < lag <= 12:
                expected[min(3, int(lag / 12 * 4))].append((magnitudes[j] - magnitudes[i]) ** 2)
    assert result["pair_counts"] == [len(group) for group in expected]
    np.testing.assert_allclose(result["mean_squared_difference"], [np.mean(group) for group in expected], atol=1e-15)
    np.testing.assert_allclose(result["noise_corrected_difference"], [np.mean(group) - 8 for group in expected], atol=1e-14)
    assert all(value < 0 for value in result["noise_corrected_difference"])
    assert result["pair_evaluations"] == 15
    serial = _native.structure_function(times, magnitudes, errors, 4, 12, 1)
    np.testing.assert_array_equal(serial["noise_corrected_difference"], result["noise_corrected_difference"])


def test_structure_function_includes_final_lag_boundary_and_accepts_constant_data():
    result = _native.structure_function([0, 2, 8], [10, 10, 10], [0.1, 0.1, 0.1], 4, 8, 1)
    assert sum(result["pair_counts"]) == 3
    assert result["pair_counts"][-1] == 2
    assert result["mean_squared_difference"][-1] == 0
    assert result["noise_corrected_difference"][-1] == pytest.approx(-0.02)


@pytest.mark.parametrize("name,kwargs", [
    ("chirp_periodogram", {"drift_samples": 0}),
    ("chirp_periodogram", {"max_frequency_derivative": float("inf")}),
    ("chirp_periodogram", {"harmonics": 4}),
    ("localized_periodogram", {"window_cycles": 0.1}),
    ("localized_periodogram", {"time_samples": 1}),
    ("phase_dispersion", {"bins": 2}),
    ("phase_dispersion", {"samples": 10000}),
])
def test_transform_rejects_invalid_configuration(name, kwargs):
    times, magnitudes, errors = chirp_data()
    with pytest.raises(ValueError):
        getattr(_native, name)(times, magnitudes, errors, 120, 240, **kwargs)


@pytest.mark.parametrize("name", ["chirp_periodogram", "localized_periodogram", "phase_dispersion", "structure_function"])
def test_transforms_validate_dimensions_errors_finite_values_and_threads(name):
    times, magnitudes, errors = chirp_data()
    args = () if name == "structure_function" else (120, 240)
    function = getattr(_native, name)
    with pytest.raises(ValueError, match="equal|Equal"):
        function(times, magnitudes[:-1], errors, *args)
    with pytest.raises(ValueError, match="one-dimensional"):
        function(times.reshape(1, -1), magnitudes, errors, *args)
    with pytest.raises(ValueError, match="positive errors"):
        function(times, magnitudes, np.zeros(len(times)), *args)
    with pytest.raises(ValueError, match="finite"):
        function(times, np.full(len(times), np.inf), errors, *args)
    with pytest.raises(ValueError, match="threads"):
        function(times, magnitudes, errors, *args, threads=257)


def test_native_budget_rejects_huge_chirp_and_pair_work_before_allocating_grids():
    times = np.arange(12000.0)
    with pytest.raises(ValueError, match="work limit"):
        _native.chirp_periodogram(times, np.sin(times), np.ones(len(times)), 2, 4, 8192, 257, 1e-7, 2, 1)
    with pytest.raises(ValueError, match="pair limit"):
        _native.structure_function(times, np.sin(times), np.ones(len(times)), 40, 0, 1)


def test_native_numeric_scaling_handles_large_magnitude_offsets_without_overflow():
    times, magnitudes, errors = chirp_data()
    base = _native.chirp_periodogram(times, magnitudes, errors, 120, 240, 16, 3, 4e-7, 1, 1)
    scaled = _native.chirp_periodogram(times, magnitudes * 1e180, errors * 1e180, 120, 240, 16, 3, 4e-7, 1, 1)
    np.testing.assert_allclose(base["powers"], scaled["powers"], atol=2e-14)
    with pytest.raises(ValueError, match="Squared"):
        _native.structure_function(times, magnitudes * 1e180, errors, 40, 0, 1)
