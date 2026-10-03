# THOTHv2 · Mira Observatory

Jesse Sullivan's 2017 C/Python experiment grew up: C++ now does the numerical astronomy, Python coordinates the work and displays the findings, and MPI carries the same work onto a Beowulf cluster.

**A working research explorer and parallel-computing demo**, with 75,916 real Mira catalog entries, measured OGLE light curves, native weighted Fourier period fitting, an interactive sky map, and a compute lab that compares the same real workload in serial and across local worker processes.

## Start the observatory

Requires Python 3.10+ and a C++17 compiler. On Windows install Visual Studio C++ Build Tools and a Windows SDK; on Linux install `g++` and Python development headers. macOS uses Xcode Command Line Tools and defaults to a serial native build.

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
thoth serve
```

Linux/macOS activation: `source .venv/bin/activate`. Open **http://127.0.0.1:8765**. Windows users whose compiler is not automatically discovered can use `scripts/start.ps1`; it loads the installed compiler environment, builds, and starts the explorer. `THOTH_OPENMP=0` disables OpenMP when a compiler lacks its runtime.

The complete catalog and two real light curves are bundled for offline use. Other OGLE curves are fetched on selection and cached locally. Stars without a supported photometry archive show their catalog details and an explicit availability message. No simulated observations replace missing data. All frontend charts work without a CDN.

## What you can study

- Search all five bundled source lists, filter period/catalog/region, sort records and export CSV.
- Inspect J2000 sky coordinates, published periods, I/V magnitudes, I amplitudes, spectral types where supplied, and source provenance.
- Plot actual observed magnitude versus HJD, fit periods in C++, inspect the frequency search, and phase-fold the data against a fitted Fourier curve.
- Run the **Compute Lab**: deterministic bootstrap tasks on real observations, a measured serial baseline, multiprocess execution, worker telemetry, speedup and efficiency.
- Explore Amdahl's and Gustafson's theoretical scaling separately from measured performance, then run MPI jobs on actual cluster nodes.

## Scientific scope

The snapshot contains complete OGLE **Mira** lists for the Galactic bulge (40,356), Galactic disk (25,625), LMC (1,663), SMC (352), and GCVS exact `M` entries (7,920). These are **catalog entries, not 75,916 distinct cross-matched stars or a census of every known Mira**. Different surveys overlap, have selection effects and update at different times. [Sources and reproducible refresh](docs/SOURCES.md) explain the inclusion rules and provenance.

The fitter solves a floating-mean, weighted Fourier model at each frequency. It estimates periodic structure in a light curve; it does not solve stellar interiors, radiative transfer, nonlinear pulsation, or stellar evolution. Mira cycles can drift and show irregular shapes. Fitted periods depend on band, time coverage, sampling, frequency resolution, aliases and model order. Power is relative chi-square improvement, not a significance probability. Photometric uncertainties alone do not capture cycle-to-cycle variability. Missing distance, temperature, radius and luminosity remain missing.

## Reproducible numerical work

```console
thoth analyze --star OGLE-BLG-LPV-096697 --min-period 60 --max-period 140 --samples 1500 --output outputs/mira-fit.json
thoth analyze --input observations.csv --band I --min-period 100 --max-period 800 --output outputs/custom-fit.json
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
```

An MPI runtime (Open MPI, MPICH, or Microsoft MPI) is required separately. [Cluster guide](docs/CLUSTER.md) covers strong/weak scaling, Amdahl/Gustafson models, data distribution, scheduling and a Slurm example. Measured speedup may be below one when tasks are small or process startup dominates. The local demo makes no claim to have run on a physical multi-host cluster.

## Verify

```console
python -m pytest
python -m build
```

Tests cover native period recovery with irregular observations, weighted fitting, independent SVD coefficient validation, catalog parsing and counts, real offline photometry, API errors and exports, and worker consistency. CI builds on Linux and Windows and exercises MPI on Linux.

## Origins

The original `jesselsullivan/THOTH` Git history and 2017 demo live on in this repository. Original demo sources are preserved under `legacy/`. The new repository is developed under `rebeltechoxford/THOTHv2`; transferring it back to `jesselsullivan` preserves its history. Source data retain their upstream attribution and scientific references; see [SOURCES.md](docs/SOURCES.md).
