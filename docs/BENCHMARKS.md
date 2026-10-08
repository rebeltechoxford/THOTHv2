# Measured transform runs

On 2026-10-08, THOTH 2.2.0 executed these measured OGLE experiments on an Intel
Core i7-9700K workstation (8 cores), Windows, Python 3.12, MSVC C++17, and Intel
MPI. Both selected 3,000 rows deterministically across the baseline of
OGLE-BLG-LPV-096697, searched 60–140 days, and used three harmonics with one
native thread per task. Every worker and MPI rank ran on the same host.

| Run | Frequency × drift grid | Local time cells | Null + injection trials | Actual workers | Pipeline elapsed |
| --- | --- | --- | --- | --- | --- |
| Local process ensemble | 384 × 81 | 64 | 64 + 64 | 4 processes | 9.85 s |
| MPI ensemble | 384 × 41 | 32 | 256 + 256 | 4 ranks | 11.79 s |

The first run visited 169,344,000 observation/grid combinations, performed
442,368,000 observation/frequency/harmonic work units in the ensemble, and
checked 4,498,500 unordered pairs. The MPI run visited 86,400,000 map
combinations, performed 1,769,472,000 ensemble work units, and checked the
same 4,498,500 pairs. These are algorithmic work counters, **not hardware FLOPs**.
Grid counters include attempted rank-deficient fits and exclude chirp cells
rejected for nonpositive instantaneous frequency.

Aggregate native service time was 14.20 s and 31.76 s respectively. This sums
durations from concurrently running workers; it is not elapsed wall time or
measured CPU time. The local ensemble's elapsed portion was 2.67 s, including
process orchestration. The MPI ensemble's elapsed portion was 7.26 s,
including the context broadcast and result gather. MPI launch and interpreter
startup precede its measurement and are excluded. Pipeline elapsed additionally
includes the serial diagnostic maps and report preparation.

These are single runs with different workloads, not a controlled speedup
comparison. Use the existing Compute Lab for its identical serial/parallel
baseline, or repeat a fixed transform configuration under a controlled allocation.
The phone's repetition/rank calculator projects ideal ensemble time from the
sum of measured task durations, assuming equally fast ranks and perfect load
balance. It omits map preparation, startup, communication, contention and I/O.

## Reproduce

```console
python -m thoth.transforms --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --frequency-samples 384 --drift-samples 81 --time-samples 64 --observations-limit 3000 --surrogates 64 --harmonics 3 --workers 4 --output outputs/transform-heavy.json
mpiexec -n 4 python -m thoth.transforms --mpi --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --frequency-samples 384 --drift-samples 41 --time-samples 32 --observations-limit 3000 --surrogates 256 --harmonics 3 --output outputs/transform-mpi-heavy.json
```

Each report preserves the input hash, grid settings, rank/PID/hostname,
seeded draw summaries and timing scope. Timings vary with machine and load.
The [80-rank Slurm example](../examples/transform_survey.slurm) is a runnable
allocation example, not evidence of an 80-rank or multi-host execution here.
No 2017 hardware requirement or monetary cost is inferred from these runs.
