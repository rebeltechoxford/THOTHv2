"""Real process execution and deterministic-work checks; timings may be slower."""
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys

import pytest

from thoth.cluster import (amdahl_speedup, benchmark_observations,
                           gustafson_speedup, run_cluster_experiment, _period_limits, _settings)


def measured_rows():
    # A deliberately synthetic test fixture; production runs use OGLE photometry.
    return [{"time_jd": 2450000 + index * 23.2,
             "magnitude": 10 + math.sin(2 * math.pi * index * 23.2 / 300)
                          + 0.3 * math.cos(4 * math.pi * index * 23.2 / 300),
             "error_mag": 0.05, "band": "I"}
            for index in range(60)]


def test_spawned_processes_execute_same_seeded_tasks_as_serial():
    events = []
    report = benchmark_observations(measured_rows(), workers=2, tasks=4, samples=80,
                                    observations_limit=40, min_period=200, max_period=500,
                                    progress=events.append)
    assert report["same_task_results"]
    assert report["serial_seconds"] > 0
    assert report["parallel_seconds"] > 0
    assert report["speedup"] == pytest.approx(report["serial_seconds"] / report["parallel_seconds"])
    assert report["efficiency"] == pytest.approx(report["speedup"] / 2)
    assert report["observations_available"] == 60
    assert report["observations_used"] == 40
    assert len(report["task_timings"]["parallel"]) == 4
    serial_pids = {task["worker_pid"] for task in report["task_timings"]["serial"]}
    assert not serial_pids.intersection(report["worker_pids"])
    assert all(task["native_threads_used"] == 1 for task in report["task_timings"]["parallel"])
    assert sum(node["tasks_completed"] for node in report["node_results"]) == 4
    assert [task["seed"] for task in report["task_timings"]["parallel"]] == [1729, 1730, 1731, 1732]
    assert events[-1] == {"state": "completed", "stage": "complete", "completed": 4, "total": 4}
    assert sum(event["stage"] == "parallel" and "worker_pid" in event for event in events) == 4
    json.dumps(report, allow_nan=False)


def test_bundled_real_curve_runs_without_network_and_keeps_provenance():
    report = run_cluster_experiment(workers=1, tasks=2, samples=32, observations_limit=30)
    assert report["data_source"] == "bundled"
    assert "astrouw.edu.pl" in report["source_url"]
    assert report["time_system"] == "HJD"
    assert report["same_task_results"]
    assert len(report["period_distribution"]["periods_days"]) == 2
    assert report["distinct_hostnames_observed"] == 1


@pytest.mark.parametrize("settings", [
    {"workers": 0}, {"workers": 9}, {"workers": True}, {"tasks": 49},
    {"samples": 15}, {"samples": 1201}, {"observations_limit": 3001},
    {"observations_limit": 6}, {"min_period": 0}, {"max_period": 10},
])
def test_resource_limits_are_rejected_before_starting_processes(settings):
    with pytest.raises(ValueError):
        benchmark_observations(measured_rows(), **settings)


def test_invalid_measurements_and_mixed_bands_are_rejected():
    rows = measured_rows()
    rows[0]["error_mag"] = 0
    with pytest.raises(ValueError, match="positive"):
        benchmark_observations(rows)
    rows = measured_rows()
    rows[0]["band"] = "V"
    with pytest.raises(ValueError, match="passband"):
        benchmark_observations(rows)


def test_scaling_models_have_correct_limits_and_are_explicitly_models():
    assert amdahl_speedup(0, 8) == 1
    assert amdahl_speedup(1, 8) == 8
    assert amdahl_speedup(0.95, 8) == pytest.approx(1 / (0.05 + 0.95 / 8))
    assert gustafson_speedup(0, 8) == 8
    assert gustafson_speedup(1, 8) == 1
    assert gustafson_speedup(0.05, 8) == pytest.approx(7.65)
    for function in (amdahl_speedup, gustafson_speedup):
        with pytest.raises(ValueError):
            function(float("nan"), 4)
        with pytest.raises(ValueError):
            function(0.5, 0)


def test_mpi_workload_caps_allow_cluster_scale_separately_from_local_caps():
    settings = _settings(128, 4096, 1200, 3000, 50, 1000, 2, mpi=True)
    assert settings["workers"] == 128
    assert settings["tasks"] == 4096
    with pytest.raises(ValueError):
        _settings(129, 4096, 1200, 3000, 50, 1000, 2, mpi=True)
    with pytest.raises(ValueError):
        _settings(128, 4097, 1200, 3000, 50, 1000, 2, mpi=True)


def test_catalog_informed_range_includes_long_period_lmc_mira():
    low, high, basis = _period_limits("OGLE-LMC-LPV-04312", None, None)
    assert low < basis["catalog_period_days"] < high
    assert high > 1000
    assert _period_limits("OGLE-LMC-LPV-04312", 200, 2000)[:2] == (200, 2000)


@pytest.mark.skipif(os.environ.get("THOTH_TEST_MPI") != "1",
                    reason="Set THOTH_TEST_MPI=1 with an MPI runtime to run the two-rank integration test")
def test_optional_real_two_rank_mpi_execution(tmp_path):
    pytest.importorskip("mpi4py")
    executable = os.environ.get("THOTH_MPIEXEC") or shutil.which("mpiexec")
    if not executable:
        candidate = Path(sys.prefix) / "Library" / "bin" / "mpiexec.exe"
        executable = str(candidate) if candidate.exists() else None
    if not executable:
        pytest.skip("No mpiexec runtime found")
    output = tmp_path / "mpi-report.json"
    subprocess.run([executable, "-n", "2", sys.executable, "-m", "thoth.cluster", "--mpi",
                    "--tasks", "4", "--samples", "32", "--observations-limit", "30",
                    "--output", str(output)], check=True, capture_output=True, text=True, timeout=60)
    report = json.loads(output.read_text(encoding="utf-8"))
    assert report["mpi_size"] == 2
    assert report["same_task_results"]
    assert {node["mpi_rank"] for node in report["node_results"]} == {0, 1}
    assert len(report["task_timings"]["parallel"]) == 4
