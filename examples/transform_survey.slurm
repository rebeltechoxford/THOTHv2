#!/bin/bash
#SBATCH --job-name=thoth-transforms
#SBATCH --nodes=10
#SBATCH --ntasks=80
#SBATCH --ntasks-per-node=8
#SBATCH --cpus-per-task=1
#SBATCH --time=02:00:00
#SBATCH --output=thoth-transforms-%j.log

# Adapt partitions, Python environment, runtime and task/node layout to your site.
# This allocates 80 MPI ranks across ten nodes, not 80 physical clusters.
set -euo pipefail
export OMP_NUM_THREADS=1
export OPENBLAS_NUM_THREADS=1
export MKL_NUM_THREADS=1

srun --mpi=pmix python -m thoth.transforms --mpi \
  --star OGLE-BLG-LPV-096697 \
  --min-period 60 --max-period 140 \
  --frequency-samples 800 --drift-samples 61 --time-samples 96 \
  --observations-limit 3000 --harmonics 3 \
  --surrogates 50000 --seed 1729 \
  --output reports/transform-survey-${SLURM_JOB_ID}.json
