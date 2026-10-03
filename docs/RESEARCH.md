# THOTHv2 research laboratory

THOTHv2 investigates measurements rather than treating a catalogue period as an
answer. The research laboratory computes competing periodic models in C++, uses
Python to assemble inspectable evidence, and exposes that evidence through an
interactive TypeScript interface. A measured residual or ambiguous period is a
research result, not a failure to display a pretty star.

It cannot resolve **everything unknown**. Photometry alone cannot uniquely
recover a star's interior, composition, mass, evolutionary state, convection, or
future cycle changes. This version helps formulate and test questions, identify
where explanations fail, and propose observations that could distinguish them.

## What the native engine actually computes

For observations `(t_i, m_i, sigma_i)` in one photometric band, each searched
frequency solves a weighted least-squares problem for

```text
m(t) = c0 + sum[k=1..H](a_k*sin(2*pi*k*f*(t-t0)) + b_k*cos(2*pi*k*f*(t-t0)))
chi2 = sum[i]((m_i - m(t_i))/sigma_i)^2
```

`H = 1, 2, 3` model orders are searched separately using approximately the earliest
80% of observations. The split uses the strict timestamp boundary nearest 80%
that leaves at least 12 training and 6 holdout observations. All measurements at
the same timestamp remain together; datasets with no eligible boundary are
rejected. The actual training/holdout fractions are reported. The later holdout
then evaluates predictions at observation times the fit did not use. The minimum
weighted holdout RMSE selects harmonic order.
The result retains every model's score and the full chronological residuals.

The holdout is a **model-selection set** because it chooses harmonic order. It
is not an untouched final validation set. New observations or a further nested
validation design are needed before claiming validated forecasting performance.

At fixed frequency there are `2*H+1` Fourier coefficients. The displayed
information criteria add one parameter for the chosen frequency:

```text
k = 2*H + 2
AIC = chi2 + 2*k
BIC = chi2 + k*log(N_training)
weighted_RMSE = sqrt(sum[(residual/sigma)^2] / sum[1/sigma^2])
```

These AIC/BIC forms assume known Gaussian measurement errors and omit the common
Gaussian likelihood normalization. They are comparative diagnostics, with
limitations: the frequency search is data dependent, multiple trials are not
fully penalized, stellar residuals can be correlated, and reported photometric
errors may not include intrinsic variability. They do not imply probabilities
for a model being true.

The selected order is also searched on the full dataset. Competing local maxima
must be separated by at least `1 / observation_baseline` in frequency and retain
at least 35% of the strongest peak's power. Up to five hypotheses are retained.
This is a transparent heuristic for browsing aliases, not a complete posterior
distribution. The same native solver fits each candidate at its exact grid
frequency. Candidate holdout scores are diagnostic because full-data selection
has already seen the holdout.

The cadence kernel computes the unweighted spectral window directly from the
measured times:

```text
W(f) = |sum[i](exp(2*pi*sqrt(-1)*f*(t_i-t0))) / N|^2
```

It is normalized to `W(0)=1`. Its frequencies represent **sampling offsets**;
they should not be read as fitted stellar periods. Cadence structure can create
alternative peaks, but visually similar peaks are not proof of an alias.

Independent fits to the earlier and later halves reveal whether the preferred
period is stable under that partition. A difference may reflect noise, sampling,
grid resolution, or changing cycles; this workflow does not claim a statistically
significant period derivative.

## Observations that could distinguish hypotheses

The observation planner extrapolates each candidate's full-data periodic fit at
600 trial times and ranks the range of predicted magnitudes. Large disagreement
means a measurement could be informative **if those fitted hypotheses remain
appropriate**. Recommendations are separated in time to avoid presenting many
nearly identical instants.

Offsets are measured from the **last observation in the dataset**, which may be
historical. Returned `time_jd` retains the input's stated JD/HJD/BJD convention;
it is not converted to UTC, a present-day calendar, or a telescope schedule.
Visibility, weather, instrument uncertainty, parameter uncertainty, and cycle
evolution are not included. When only one separated strong candidate remains,
the multi-hypothesis planner returns no recommendations.

## A numerical physics sandbox

The native RK4 sandbox integrates an explicitly dimensionless Duffing oscillator:

```text
tau = 2*pi*t/period_days
x'' + 2*zeta*x' + x + beta*x^3 = F*cos(tau)
x(0)=0.1; x'(0)=0
E = v^2/2 + x^2/2 + beta*x^4/4
dE/dtau = F*cos(tau)*v - 2*zeta*v^2
```

Its radial-displacement analogy helps explore forcing, damping, nonlinear
response, phase trajectories, and numerical integration. **It is not a calibrated
Mira pulsation model.** The controls do not infer radius, mass, luminosity,
temperature, opacity, convection, or stellar structure. Displacement, velocity,
energy, and work are normalized quantities, not physical stellar measurements.
`period_days` maps the natural timescale to display days; drive frequency equals
the natural frequency. A nonlinear response need not repeat at that period.

Every simulation performs two actual C++ integrations: a requested step and a
half-sized step. The refined solution is displayed. Both accumulated drive work
and dissipated energy are integrated alongside displacement and velocity. The
API reports the maximum/RMS displacement disagreement and the maximum error in
`E-E0 = drive_work - dissipated_energy`. These measure numerical consistency,
not astrophysical uncertainty.

Tests compare the linear unforced undamped limit to the independent analytic
solution `x(tau)=0.1*cos(tau)`, verify refinement reduces numerical error, check
monotonic damping losses, and inspect driven work/energy balance. Fixed-frequency
Fourier coefficients are checked against NumPy's independent SVD least-squares
solver; the sampling window is checked against direct complex exponentials.

## Reproducibility, resource bounds, and distributed computing

Evidence bundles include source, band, time convention, a SHA-256 of the validated
single-band observations before subsampling, chronological split, requested/used
thread counts, frequency grid size, native timing, and actual scan work counts.
Uploaded data also retain their original CSV SHA-256 separately from this
canonical measurement hash, together with dataset ID, name, and input origin.
The UI exports the computed evidence. Timing is measured locally; it is not a
benchmark against a supercomputer.

The web research budget allows at most 3,000 observations, 3,000 frequencies per
scan, and 48 million aggregate observation-frequency-harmonic evaluations. The
wrapper rejects combinations exceeding that aggregate limit before fitting.
If an observation limit is smaller than the dataset, deterministic evenly spaced
observation indices preserve the full baseline and the result states that subset.
Changing a subset can change inference.

Research model scans release Python's GIL and use native OpenMP where enabled.
THOTH's separate Beowulf laboratory dispatches actual bootstrap fits through
process workers or MPI ranks, reports worker identities and measurements, and
explores measured scaling alongside Amdahl/Gustafson theory. A single container
or host with several ranks demonstrates distributed algorithms; physical
multi-node hardware must be verified independently. See [CLUSTER.md](CLUSTER.md).

## Python contracts

```python
from thoth.research import investigate_lightcurve, simulate_pulsation

evidence = investigate_lightcurve(
    curve, min_period=100, max_period=1000, samples=800,
    threads=1, observations_limit=3000, band=None,
    progress=lambda event: print(event),
)
# event: {stage, percent, detail}
# evidence: selected_model, models, residuals, full_fit, periodogram,
#           spectral_window, candidates, stability, observation_plan,
#           provenance, computation, caveats, split/planning metadata

simulation = simulate_pulsation(
    period_days=300, damping=0.05, drive=0.15, nonlinearity=0.2,
    cycles=6, steps_per_cycle=200,
)
# simulation: times_days, displacement, velocity, energy, drive_work,
#             dissipated_energy, convergence, parameters, computation,
#             equation, energy_definition, initial_conditions, caveats
```

## Method references and next research steps

The weighted floating-mean Fourier family and normalization are described in the
[Astropy Lomb–Scargle documentation](https://docs.astropy.org/en/stable/timeseries/lombscargle.html).
For limitations from sampling, peak interpretation, and frequency searches see
[VanderPlas, *Understanding the Lomb–Scargle Periodogram*](https://arxiv.org/abs/1703.09824).
THOTH implements its own C++ normal-equation solver rather than calling Astropy.

Future physical modelling needs calibrated structure, radiation transport,
opacity, and convection; connecting that to multi-band photometry, spectroscopy,
distances, and uncertainty propagation is a research programme. Trend/change-point
models, correlated-noise likelihoods, nested validation, posterior predictive
checks, and real telescope visibility constraints are also valuable extensions.
The existing evidence bundle is meant to make those additions testable.
