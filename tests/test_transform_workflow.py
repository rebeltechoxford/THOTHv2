"""Calibration and execution invariants for the real transform worker farm."""
import csv
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys

import numpy as np
import pytest

from thoth.transforms import (_base_transforms, _ensemble_task, _json_finite,
                               _prepare, _task_seed, run_transform_lab)


def synthetic_curve(size=120):
    rng = np.random.default_rng(815)
    times = np.sort(rng.uniform(0, 2800, size)) + 2450000
    error = rng.uniform(0.015, 0.03, size)
    magnitude = 12 + 0.8 * np.sin(2 * np.pi * (times - 2450000) / 211)
    magnitude += rng.normal(0, error)
    return {"observations": [{"time_jd": float(t), "magnitude": float(m),
                               "error_mag": float(e), "band": "I"}
                              for t, m, e in zip(times, magnitude, error)],
            "source_url": "synthetic://test-transform-calibration", "time_system": "synthetic JD"}


def prepare(curve=None, **overrides):
    settings = {"frequency_samples": 64, "drift_samples": 5, "time_samples": 8,
                "drift_cycles": 1.0, "window_cycles": 3.0, "surrogates": 6,
                "workers": 1, "observations_limit": 120, "harmonics": 1, "seed": 1729}
    settings.update(overrides)
    return _prepare(curve or synthetic_curve(), 180, 250, **settings)


def science_fields(task):
    return {key: value for key, value in task.items()
            if key not in {"pid", "hostname", "elapsed_seconds", "native_seconds", "mpi_rank"}}


def small_report(curve=None, **overrides):
    settings = {"frequency_samples": 64, "drift_samples": 5, "time_samples": 8,
                "surrogates": 6, "workers": 1, "observations_limit": 120,
                "harmonics": 1, "seed": 1729}
    settings.update(overrides)
    return run_transform_lab(curve or synthetic_curve(), 180, 250, **settings)


def test_null_tail_has_plus_one_correction_and_every_injection_uses_actual_times():
    report = small_report()
    ensemble = report["ensemble"]
    assert ensemble["surrogates"] == ensemble["injections"] == 6
    assert ensemble["task_count"] == 12
    assert ensemble["empirical_p_value"] == pytest.approx((ensemble["exceedances"] + 1) / 7)
    assert ensemble["p_value_floor"] == pytest.approx(1 / 7)
    assert ensemble["exceedances"] == sum(power >= ensemble["observed_max_power"]
                                          for power in ensemble["null_max_powers"])
    assert ensemble["recovery_fraction"] == 1
    assert sum(group["trials"] for group in ensemble["injection_groups"]) == 6
    assert [group["trials"] for group in ensemble["injection_groups"]] == [2, 2, 2]
    assert all(group["recovered"] == 2 for group in ensemble["injection_groups"])
    assert all(task["native_threads_used"] == 1 for task in ensemble["injection_trials"])
    assert any("not calibrated" in caveat for caveat in ensemble["caveats"])
    assert any("stationary search only" in caveat for caveat in ensemble["caveats"])
    assert report["provenance"]["input_observations"] == 120
    assert len(report["provenance"]["input_sha256"]) == 64
    assert report["computation"]["structure_function_pair_evaluations"] == 120 * 119 // 2
    assert ensemble["candidate_frequency_evaluations"] == 12 * 64
    assert ensemble["observation_frequency_harmonic_evaluations"] == 12 * 120 * 64
    assert report["computation"]["native_seconds"] == pytest.approx(
        report["computation"]["base_native_seconds"] + ensemble["native_seconds"])
    json.dumps(report, allow_nan=False)


def test_seeded_tasks_are_identical_in_serial_and_real_spawned_workers():
    serial = small_report(surrogates=3)
    parallel = small_report(surrogates=3, workers=2)
    assert parallel["ensemble"]["execution"] == "Spawned local process workers"
    assert serial["ensemble"]["null_max_powers"] == parallel["ensemble"]["null_max_powers"]
    for key in ("null_trials", "injection_trials"):
        assert [science_fields(task) for task in serial["ensemble"][key]] == [
            science_fields(task) for task in parallel["ensemble"][key]]
    assert all(worker["worker_pid"] != os.getpid() for worker in parallel["ensemble"]["workers"])
    assert sum(worker["tasks_completed"] for worker in parallel["ensemble"]["workers"]) == 6


def test_null_draws_follow_reported_heteroscedastic_errors_and_injection_amplitude():
    context, _ = prepare()
    _base_transforms(context, None)
    first = _ensemble_task(0, context)
    repeated = _ensemble_task(0, context)
    assert science_fields(first) == science_fields(repeated)
    expected_rng = np.random.Generator(np.random.PCG64(_task_seed(1729, 0)))
    expected = expected_rng.normal(0, context["errors"])
    import hashlib
    assert first["synthetic_magnitudes_sha256"] == hashlib.sha256(expected.astype("<f8").tobytes()).hexdigest()
    assert first["kind"] == "null"
    injected = _ensemble_task(context["settings"]["surrogates"], context)
    assert injected["kind"] == "injection"
    assert injected["amplitude_fraction"] == 0.25
    assert injected["amplitude_mag"] == pytest.approx(0.25 * context["injection_base_amplitude_mag"])
    assert len({_task_seed(1729, index) for index in range(1000)}) == 1000


def test_drift_parameter_means_endpoint_phase_cycles_and_selection_preserves_baseline():
    curve = synthetic_curve(size=200)
    context, provenance = prepare(curve, observations_limit=60, drift_cycles=1.5)
    span = context["times"][-1] - context["times"][0]
    derivative = context["settings"]["max_frequency_derivative"]
    assert 0.5 * derivative * (span / 2) ** 2 == pytest.approx(1.5)
    assert context["times"][0] == curve["observations"][0]["time_jd"]
    assert context["times"][-1] == curve["observations"][-1]["time_jd"]
    assert provenance["input_observations"] == 200
    assert provenance["used_observations"] == 60
    assert "Evenly spaced" in provenance["subsampling"]


def test_invalid_cells_remain_missing_in_strict_json():
    result = _json_finite({"powers": [[0.3, math.nan], [np.inf, np.float64(0.7)]]})
    assert result == {"powers": [[0.3, None], [None, 0.7]]}
    json.dumps(result, allow_nan=False)


@pytest.mark.parametrize("settings", [
    {"workers": 0}, {"workers": 9}, {"workers": True}, {"surrogates": 0},
    {"surrogates": 65}, {"frequency_samples": 15}, {"drift_samples": 4},
    {"drift_cycles": float("nan")}, {"window_cycles": 0}, {"seed": -1},
    {"time_samples": 129}, {"harmonics": 4}, {"observations_limit": 29},
])
def test_resource_settings_are_rejected_before_native_work(settings):
    with pytest.raises(ValueError):
        prepare(**settings)


def test_mixed_passbands_and_bad_measurements_are_not_silently_combined():
    curve = synthetic_curve()
    curve["observations"][0]["band"] = "V"
    with pytest.raises(ValueError, match="passband"):
        prepare(curve)
    context, provenance = prepare(curve, band="I")
    assert len(context["times"]) == 119
    assert provenance["band"] == "I"
    curve["observations"][1]["error_mag"] = 0
    with pytest.raises(ValueError, match="positive"):
        prepare(curve, band="I")


def test_progress_is_real_work_and_finishes_after_all_tasks():
    events = []
    report = small_report(surrogates=2, progress=events.append)
    assert [event["percent"] for event in events] == sorted(event["percent"] for event in events)
    completed = [event for event in events if event["stage"] == "ensemble" and event.get("completed", 0)]
    assert [event["completed"] for event in completed] == [1, 2, 3, 4]
    assert all(event["worker_pid"] == os.getpid() for event in completed)
    assert events[-1]["stage"] == "complete"
    assert report["ensemble"]["task_count"] == 4


def test_large_mpi_trial_budget_is_distinct_from_local_preview_budget():
    context, _ = prepare(mpi=True, surrogates=50000, workers=80)
    assert context["settings"]["workers"] == 80
    assert context["settings"]["surrogates"] == 50000
    assert context["settings"]["estimated_observation_evaluations"] > 100_000_000
    with pytest.raises(ValueError):
        prepare(mpi=True, surrogates=50001)


@pytest.mark.skipif(os.environ.get("THOTH_TEST_MPI") != "1",
                    reason="Set THOTH_TEST_MPI=1 with MPI installed for real two-rank transform integration")
def test_real_two_rank_mpi_matches_serial_scientific_draws(tmp_path):
    pytest.importorskip("mpi4py")
    executable = os.environ.get("THOTH_MPIEXEC") or shutil.which("mpiexec")
    if not executable:
        candidate = Path(sys.prefix) / "Library" / "bin" / "mpiexec.exe"
        executable = str(candidate) if candidate.exists() else None
    if not executable:
        pytest.skip("No MPI runtime available")
    curve = synthetic_curve(size=60)
    input_path = tmp_path / "input.csv"
    with input_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=("time_jd", "magnitude", "error_mag", "band"))
        writer.writeheader()
        writer.writerows(curve["observations"])
    output_path = tmp_path / "mpi-report.json"
    command = [executable, "-n", "2", sys.executable, "-m", "thoth.transforms", "--mpi",
        "--input", str(input_path), "--min-period", "180", "--max-period", "250",
        "--frequency-samples", "64", "--drift-samples", "5", "--time-samples", "8",
        "--surrogates", "4", "--observations-limit", "60", "--harmonics", "1",
        "--output", str(output_path)]
    subprocess.run(command, check=True, capture_output=True, text=True, timeout=90)
    mpi = json.loads(output_path.read_text(encoding="utf-8"))
    serial = small_report(curve, surrogates=4, observations_limit=60)
    assert mpi["ensemble"]["mpi_size"] == 2
    assert {worker["mpi_rank"] for worker in mpi["ensemble"]["workers"]} == {0, 1}
    assert mpi["ensemble"]["null_max_powers"] == serial["ensemble"]["null_max_powers"]
    for key in ("null_trials", "injection_trials"):
        assert [science_fields(task) for task in mpi["ensemble"][key]] == [
            science_fields(task) for task in serial["ensemble"][key]]
