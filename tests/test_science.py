import csv
import math

import pytest

from thoth.catalog import EXAMPLE_STAR_ID, load_lightcurve
from thoth.science import analyze_lightcurve, native_status, read_observations_csv


def test_native_is_available_for_real_measured_lightcurve():
    status = native_status()
    assert status["native_available"] is True
    assert "C++17" in status["native_backend"]["engine"]
    curve = load_lightcurve(EXAMPLE_STAR_ID)
    result = analyze_lightcurve(curve, min_period=90, max_period=94, samples=50, harmonics=2, threads=1)
    assert result["n_observations"] == len(curve["observations"])
    assert 90 <= result["period_days"] <= 94
    assert result["reference_epoch_jd"] > 2450000
    assert result["observation_span_days"] > 3000
    assert result["cycles_observed"] > 30
    assert result["frequency_step_per_day"] == pytest.approx((1 / 90 - 1 / 94) / 49)
    assert len(result["phase_model"]) == 301
    assert result["phase_model"][0]["magnitude"] == pytest.approx(result["phase_model"][-1]["magnitude"])
    assert all(math.isfinite(row["magnitude"]) for row in result["phase_model"])


def test_csv_passbands_require_a_single_band_for_analysis(tmp_path):
    observations = load_lightcurve(EXAMPLE_STAR_ID)["observations"][:100]
    path = tmp_path / "measured.csv"
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["time_jd", "magnitude", "error_mag", "band"])
        writer.writeheader()
        writer.writerows(observations)
        # A second passband makes this explicitly a mixed-band input. Numerical
        # tests still select and analyze only the original measured I samples.
        writer.writerow({**observations[0], "band": "V"})
    curve = read_observations_csv(path)
    assert curve["time_system"] == "User-supplied JD (verify your time standard)"
    assert len(curve["observations"]) == 101
    with pytest.raises(ValueError, match="single band"):
        analyze_lightcurve(curve, samples=50)
    with pytest.raises(ValueError, match="No observations"):
        analyze_lightcurve(curve, samples=50, band="K")
    result = analyze_lightcurve(curve, min_period=90, max_period=94, samples=50, harmonics=1, band="I")
    assert result["band"] == "I"
    assert result["n_observations"] == 100
    assert any("Fewer than two" in warning for warning in result["warnings"])


@pytest.mark.parametrize("row", ["2450001,nan,0.1", "2450001,14,inf", "nan,14,0.1",
                                 "2450001,14,0", "2450001,14,-0.1", "2450001,invalid,0.1"])
def test_invalid_csv_numeric_values_are_reported_with_line_number(tmp_path, row):
    path = tmp_path / "invalid.csv"
    path.write_text("time_jd,magnitude,error_mag\n" + row + "\n", encoding="utf-8")
    with pytest.raises(ValueError, match="CSV line 2"):
        read_observations_csv(path)


def test_csv_rejects_implicit_column_units(tmp_path):
    path = tmp_path / "ambiguous.csv"
    path.write_text("HJD-2450000,mag,err\n5260,13.4,0.01\n", encoding="utf-8")
    with pytest.raises(ValueError, match="time_jd, magnitude, error_mag"):
        read_observations_csv(path)
