# Transform Foundry

THOTH computes four complementary transforms from actual single-band observations, then runs a reproducible worker farm of noise-null and signal-injection experiments. C++ performs numerical fits and all-pairs accumulation; Python validates the input, schedules real processes or MPI ranks, and returns evidence for the TypeScript interface. Empty or unidentifiable map cells remain missing.

The web presets are bounded previews. `python -m thoth.transforms --mpi` supports up to 256 actual ranks and 50,000 draws of each kind. The supplied [80-rank Slurm example](../examples/transform_survey.slurm) allocates ten nodes with eight ranks per node. A laptop run reports its actual worker processes and hostnames; it does not claim to have used physical cluster nodes.

## Frequency and phase drift

For epoch $t_0$ at the midpoint of the observed baseline, the chirp phase in cycles is

$$\phi(t)=f(t-t_0)+\tfrac12\dot f(t-t_0)^2.$$

At each frequency/drift cell C++ solves a weighted harmonic model,

$$m(t)=c+\sum_{h=1}^{H}[a_h\sin(2\pi h\phi(t))+b_h\cos(2\pi h\phi(t))],$$

using the photometric uncertainties. The displayed power is the weighted chi-square improvement relative to a constant model. Cells with nonpositive instantaneous frequency anywhere on the baseline are omitted. The `drift_cycles` control is the maximum absolute quadratic phase displacement at either endpoint, not a period derivative: with baseline $T$, the grid limit is $|\dot f|=8\,\mathrm{drift\_cycles}/T^2$. The corresponding instantaneous period is $1/[f+\dot f(t-t_0)]$ when that frequency is positive.

A larger best power than the stationary fit is expected when more parameters are searched. It does not establish secular stellar evolution, account for an additional-search penalty, or eliminate sampling aliases. Grid resolution, baseline length and model complexity must be checked. [VanderPlas's primary review](https://arxiv.org/abs/1703.09824) explains uneven sampling, frequency grids, aliases and the dependence of false-alarm interpretation on the null model.

## Localized time/frequency power

Each time/frequency cell fits an independent weighted sinusoid with a Gaussian localization window. Its window width follows the candidate period and `window_cycles`; distant observations receive less weight. The map and effective observation count distinguish a changing signal from areas with little supporting data.

This is a Gaussian-localized weighted least-squares diagnostic. It is **not** the weighted wavelet Z-transform statistic. [Foster's original irregular-sampling wavelet paper](https://doi.org/10.1086/118137) motivates localized fitting and describes problems caused by uneven sampling. A map ridge is a hypothesis to investigate rather than a calibrated physical mode identification.

## Phase dispersion and structure function

Phase dispersion assigns measurements to 12 phase bins at each trial frequency and compares weighted within-bin variance to the global weighted variance. Lower ratios indicate a repeated waveform without requiring that waveform to be sinusoidal. THOTH uses a PDM-style weighted ratio, not the exact degrees-of-freedom normalization in [Stellingwerf's original PDM paper](https://articles.adsabs.harvard.edu/pdf/1978ApJ...224..953S). Sparse or unsupported bins can change the preferred period.

The structure function visits every unordered pair of selected observations and accumulates $(m_i-m_j)^2$ in time-lag bins. The noise-corrected curve subtracts the bin mean of $\sigma_i^2+\sigma_j^2$. Negative estimates are retained because truncating them would bias the result. Empty bins remain missing. Pairs sharing observations are correlated, so pair counts do not represent independent sample counts or uncertainty bars.

## Conditional Monte Carlo calibration

Each null task draws independent Gaussian noise with the **actual selected reported uncertainty at each measured timestamp**, then repeats the same stationary weighted harmonic frequency search. It records the maximum power, including the effect of searching the entire fixed frequency grid. With $B$ null draws and $k$ maxima at least as large as the observed maximum, the conservative finite-simulation estimate is

$$\widehat p=(k+1)/(B+1).$$

Its smallest reportable value is $1/(B+1)$. Twelve draws cannot support a claim of extremely rare significance. This calculation is conditional on white independent Gaussian errors, the fixed grid and harmonic order. It is **not calibrated for correlated Mira cycle variability**, underestimated errors, data-dependent period limits, or the additional drift/localization searches. It is neither a probability that a star is variable nor a discovery claim.

An equal number of injection tasks add a synthetic sinusoid at the best stationary period, with random phase and peak-to-peak amplitudes 0.25, 0.5 and 1 times the observed fitted peak-to-peak amplitude. The noisy draws use the measured cadence and uncertainties. A recovery is a frequency error at most $1/T$; other outcomes include aliases, low signal or ambiguity. This tests conditional algorithm sensitivity. It does not estimate survey completeness, reproduce asymmetric Mira light curves, or prove that all unknown stellar properties can be recovered.

Task seeds are SHA256-derived from the base seed and task identity and feed NumPy PCG64. Scheduling, process count and MPI rank do not change a draw. The report includes the input SHA256, per-draw hashes in a capped sample, actual process IDs and hostnames, full null-power distribution, injection group counts and elapsed durations. Per-task details are capped at 128 per kind, while all tasks contribute to the summaries. Outstanding process futures are bounded by twice the worker count. MPI ranks return aggregate records rather than complete synthetic curves.

## Run locally or on a cluster

```powershell
.venv-phone/Scripts/python.exe -m thoth.transforms --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --frequency-samples 128 --drift-samples 31 --time-samples 24 --surrogates 12 --workers 4 --progress --output reports/transforms.json
```

```bash
export OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1
mpiexec -n 80 python -m thoth.transforms --mpi \
  --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 \
  --frequency-samples 800 --drift-samples 61 --time-samples 96 \
  --observations-limit 3000 --harmonics 3 --surrogates 50000 \
  --output reports/large-transform-run.json
```

For user measurements replace `--star` with `--input observations.csv`, select `--band I` if needed, and state `--time-system JD`, `HJD` or `BJD`. The program does not convert time standards or verify calibration. Observation rows are sorted; above the explicit limit, deterministic evenly spaced row indices preserve both endpoints. This can omit short cadence and rare events, so compare resolutions and use the complete measurements for subsequent research.

MPI rank zero loads the data and computes the transform maps. Independent Monte Carlo tasks are distributed by task index across all ranks. Rank zero writes one atomic JSON report. Input, task, final-report and file-output failures are communicated collectively. Each task uses one native thread to avoid process/OpenMP oversubscription. The MPI ensemble timer includes context broadcast, fitting and result gather; it excludes launcher startup and serial map preparation. The local timer includes process startup and shutdown. Aggregate native seconds sum base-map durations and worker native-call durations; overlapping worker time can exceed pipeline wall time. No serial baseline is measured by this workflow, so it does not display a measured parallel speedup. When `--output` is given, stdout is kept free of the large report and a short completion record is printed to stderr.

## Work and historical cost

The report exposes observation/candidate visits, harmonic-work proxies, actual pair evaluations and measured times. These are not hardware FLOP counts. Approximate dominant work is $NFDH$ for frequency/drift fits, $NFT$ for the localized map, $N^2/2$ for pair diagnostics, and $2BNFH$ for null/injection searches. Here $N$ is selected observations, $F$ frequency trials, $D$ drift trials, $T$ time centers, $H$ harmonic order and $B$ draws per kind. Dataset size and the number of stars multiply these costs in a survey.

These methods existed before 2017; individual light-curve transforms were feasible on ordinary computers then. An 80-rank workload becomes useful for dense searches, many Monte Carlo draws and surveys, but there is no evidence here for a million-dollar historical cost or a requirement for 80 physical clusters. Reproducible measured performance is the meaningful comparison. Physical atmosphere, pulsation, radiation transport, dust and stellar evolution calculations remain separate scientific modeling work described in [VISION.md](VISION.md).
