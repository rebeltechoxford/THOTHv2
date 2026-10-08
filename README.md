# THOTHv2 · Three-dimensional Mira Research Observatory

Jesse Sullivan's 2017 C/Python experiment grew up: C++ computes astronomical fits, distance posteriors and three-dimensional model geometry, Python acquires evidence and coordinates the experiments, and a compiled TypeScript/Three.js interface lets you study them from your phone. MPI carries the same native research work onto a Beowulf cluster.

**A working three-dimensional research lab and parallel-computing demo**, with 75,916 real Mira catalog entries, measured OGLE light curves, photometry-constrained radius/temperature model families, Gaia-candidate distance uncertainty, native weighted Fourier fitting, evolving-period and time-frequency maps, phase dispersion, pairwise variability, and reproducible noise and signal-injection ensembles. The compute lab measures the same real workload in serial and across worker processes.

## Start the observatory

Requires Node.js 22.12+, Python 3.10+ and a C++17 compiler. On Windows install Visual Studio C++ Build Tools and a Windows SDK; on Linux install `g++` and Python development headers. macOS uses Xcode Command Line Tools and defaults to a serial native build.

```powershell
./scripts/start-lab.ps1
```

The launcher builds TypeScript and C++, then serves on **http://localhost:8765** and your private LAN address for your phone. After the first build use `./scripts/start-lab.ps1 -SkipBuild`. [Internal run guide](docs/INTERNAL_RUN.md) covers phone access, development, and optional final Docker packaging. Docker is not required for development or this workstation. `THOTH_OPENMP=0` disables OpenMP when a compiler lacks its runtime.

On Linux/macOS: run `npm ci && npm run build` inside `frontend/`, then create a virtual environment, activate it with `source .venv/bin/activate`, install with `python -m pip install -e '.[dev]'`, and run `thoth serve --host 0.0.0.0`. Bind to `127.0.0.1` for access only on the server.

The complete source snapshot, two measured light curves and acquired Gaia example receipts are bundled for offline use. Other OGLE curves and Gaia position candidates are fetched when requested and cached locally. Stars without usable photometry keep their catalog details and an explicit availability message; their measured brightness and radiative models remain missing. No simulated observations replace missing data. The compiled frontend works without a CDN.

## What you can study

- Search all five bundled source lists, filter period/catalog/region, sort records and export CSV.
- Inspect J2000 sky coordinates, published periods, I/V magnitudes, I amplitudes, spectral types where supplied, and source provenance.
- Explore the **3D Observatory**: every catalog entry retains its identity in the angular atlas, with equatorial/Galactic direction views, a solid-angle-corrected density layer and survey-region group summaries. Unknown coordinates remain missing; the unit sphere does not invent physical distances.
- Reconstruct **conditional three-dimensional star models** from measured brightness. C++ fits the light curve and solves radius/temperature families that reproduce its relative flux. Change the assumed radius/temperature split, compare different 3D envelopes that fit the same data, and inspect unmeasured V/K proxy predictions that could distinguish those models with additional observations.
- Acquire **Gaia DR3 evidence** with a saved query receipt, inspect candidate associations and astrometric quality flags, and compute a Bayesian distance posterior from parallax and its uncertainty. The spatial layer displays conditional candidate distances and radial intervals; it does not assign invented depths to the full catalog.
- Rotate actual frequency/drift and time/frequency computations as **3D surfaces** with missing cells preserved as holes. Inspect real worker identities and task telemetry in a logical three-dimensional compute-cluster view.
- Plot actual observed magnitude versus HJD, fit periods in C++, inspect the frequency search, and phase-fold the data against a fitted Fourier curve.
- Run **Discovery Lab** on measured photometry: compare one-, two- and three-harmonic hypotheses against later observations, inspect residuals and separated peaks, compute the actual cadence window, and compare early/late fits. Conditional observation suggestions rank where competing fitted periods disagree.
- Import your own single-band CSV with explicit JD/HJD/BJD times. Measurements and completed research reports persist in the local workspace, with source hashes and an auditable compute budget.
- Explore **Transform Foundry**: search a two-dimensional frequency/drift grid, inspect Gaussian localized time-frequency power and its effective observation support, compare a weighted phase-dispersion search, and compute all selected observation pairs in a noise-corrected structure function. Tap the maps to inspect alternative hypotheses.
- Run independent Gaussian-noise trials and injected-signal recovery tests at the actual observing times. Their native frequency searches execute across real Python workers or MPI ranks; reports expose conditional noise assumptions, finite Monte Carlo resolution, recovery failures, task counts, worker identities and measured time.
- Explore **Pulsation Sandbox**: change forcing, damping, nonlinearity and resolution, animate normalized displacement and phase trajectories, and inspect native RK4 step refinement and energy-balance diagnostics. This is an illustrative nonlinear oscillator, not calibrated stellar physics.
- Run the **Compute Lab**: deterministic bootstrap tasks on real observations, a measured serial baseline, multiprocess execution, worker telemetry, speedup and efficiency.
- Explore Amdahl's and Gustafson's theoretical scaling separately from measured performance, then run MPI jobs on actual cluster nodes.

## Scientific scope

The snapshot contains complete OGLE **Mira** lists for the Galactic bulge (40,356), Galactic disk (25,625), LMC (1,663), SMC (352), and GCVS exact `M` entries (7,920). These are **catalog entries, not 75,916 distinct cross-matched stars or a census of every known Mira**. Different surveys overlap, have selection effects and update at different times. [Sources and reproducible refresh](docs/SOURCES.md) explain the inclusion rules and provenance.

The fitter solves a floating-mean, weighted Fourier model at each frequency. It estimates periodic structure in a light curve; it does not solve stellar interiors, full radiative transfer, nonlinear stellar pulsation, or stellar evolution. Mira cycles can drift and show irregular shapes. Fitted periods depend on band, time coverage, sampling, frequency resolution, aliases and model order. Power is relative chi-square improvement, not a significance probability. Photometric uncertainties alone do not capture cycle-to-cycle variability.

The three-dimensional star envelope is constrained by fitted relative flux under an explicit monochromatic blackbody assumption. A single band cannot uniquely determine radius and temperature: the reference temperature and radius/temperature split select a conditional family, while absolute radius remains unknown. The V/I/K curves are model predictions, not new observations or calibrated colors. Gaia cone matches remain unconfirmed associations; their distance intervals depend on the stated prior and parallax likelihood. The full atlas is angular, and survey regions are not newly discovered gravitationally bound clusters. [3D evidence and reconstruction methods](docs/SPACE.md) explain these distinctions and the numerical validation.

## Reproducible numerical work

```console
thoth analyze --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --samples 1500 --output outputs/mira-fit.json
thoth analyze --input observations.csv --band I --min-period 100 --max-period 800 --output outputs/custom-fit.json
thoth research --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --samples 800 --output outputs/evidence.json
thoth research --input observations.csv --band I --time-system BJD --min-period 100 --max-period 800 --output outputs/custom-evidence.json
thoth simulate --damping 0.05 --drive 0.15 --nonlinearity 0.2 --steps-per-cycle 200 --output outputs/oscillator.json
python -m thoth.transforms --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --surrogates 32 --workers 4 --output outputs/transforms.json
thoth catalog-info
thoth refresh-catalog --output outputs/new-snapshot
```

Custom CSV headers are `time_jd,magnitude,error_mag,band`. Times must share a consistent time standard and magnitudes must be in the same selected band. Invalid or non-finite values are rejected. All selected observations enter the C++ fit, even when the browser reduces the number of plotted points.

## Beowulf and supercomputing

This is a first-class part of THOTHv2. The coordinator partitions independent science tasks among workers; each worker invokes the native kernel. Local processes demonstrate scheduling and overhead on one machine. MPI uses distributed ranks, records their real hostnames, and gathers results to rank zero. OpenMP can parallelize the frequency trials inside one C++ fit. Avoid giving every MPI rank every CPU.

```console
python -m pip install -e ".[cluster]"
mpiexec -n 4 python -m thoth.cluster --mpi --star OGLE-BLG-LPV-096697 --workers 1 --tasks 24 --output outputs/cluster.json
mpiexec -n 4 thoth batch --mpi --ids examples/cluster-stars.txt --output outputs/catalog-fits.jsonl
mpiexec -n 4 python -m thoth.transforms --mpi --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --surrogates 64 --output outputs/mpi-transforms.json
```

An MPI runtime (Open MPI, MPICH, or Microsoft MPI) is required separately. [Cluster guide](docs/CLUSTER.md) covers strong/weak scaling, Amdahl/Gustafson models, data distribution, scheduling and a Slurm example. Measured speedup may be below one when tasks are small or process startup dominates. The local demo makes no claim to have run on a physical multi-host cluster.

The [transform methods and scale guide](docs/TRANSFORMS.md) documents the new kernels and an 80-rank Slurm ensemble. Work grows with observations × frequency trials × drift/localization cells, repeated over independent experiments; the structure function additionally grows with observation pairs. These algorithms were available in 2017. A large survey ensemble can justify a cluster, but no historical million-dollar cost or required machine count is asserted. Operation counts are measured algorithmic work units, not hardware FLOPs. The phone interface projects ideal repeated-work scaling from completed task timings and labels that projection separately from measured execution.

See [measured transform runs](docs/BENCHMARKS.md) for reproducible local and MPI workloads, timings, and what the counters mean.

## Verify

```console
python -m pytest
python -m build
```

Tests cover native period recovery with irregular observations, weighted fitting, independent SVD coefficient validation, catalog parsing and counts, real offline photometry, API errors and exports, and worker consistency. CI builds on Linux and Windows and exercises MPI on Linux.

Research tests also check chronological model selection, candidate predictions, sampling windows against a direct calculation, analytic harmonic-oscillator behavior, fourth-order convergence and forced/damped energy accounting. TypeScript must pass strict checking before the production build; optional Docker CI builds and exercises the actual packaged runtime.

Transform tests compare native changing-frequency fits with independent NumPy least squares, check time localization and direct pairwise calculations, and verify deterministic ensemble outputs across worker counts. The API persists finite evidence reports and shares the same exclusive compute slot with the other labs.

Three-dimensional tests validate all-entry retention, Galactic coordinate rotation, spherical bin areas, indexed surface geometry, conditional distance normalization, and flux closure for distinct radius/temperature families. Independent Planck-ratio checks verify unmeasured band predictions; missing archive data, ambiguous identities and missing grid cells remain explicit. Optional Docker smoke checks exercise the packaged 3D APIs and bundled evidence without depending on live archives.

## Investigating unknowns

THOTH can identify competing explanations, show where models fail, and rank conditional measurements that could help distinguish them. It cannot guarantee resolution of every unknown, infer unobserved stellar properties from a sparse light curve, or claim discoveries without external validation. [Research methods](docs/RESEARCH.md) explain every computed diagnostic and its limits. [Vision and roadmap](docs/VISION.md) separate today's working lab from future physical inference and distributed research.

## Origins

The original `jesselsullivan/THOTH` Git history and 2017 demo live on in this repository. Original demo sources are preserved under `legacy/`. The new repository is developed under `rebeltechoxford/THOTHv2`; transferring it back to `jesselsullivan` preserves its history. Source data retain their upstream attribution and scientific references; see [SOURCES.md](docs/SOURCES.md).
