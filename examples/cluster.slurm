#!/usr/bin/env bash
# Example only: adapt partition/account, environment, and MPI plugin to your site.
#SBATCH --job-name=thoth-mira
#SBATCH --nodes=2
#SBATCH --ntasks=4
#SBATCH --cpus-per-task=2
#SBATCH --time=00:15:00
#SBATCH --output=thoth-mira-%j.log

set -euo pipefail
# Load the site's MPI/compiler modules before activating the matching Python env.
source .venv/bin/activate
export OMP_NUM_THREADS="${SLURM_CPUS_PER_TASK}"
# PMIx applies only when supported by both this Slurm installation and MPI build.
srun --mpi=pmix --cpu-bind=cores python -m thoth.cluster --mpi \
  --star OGLE-BLG-LPV-096697 --threads-per-rank "${SLURM_CPUS_PER_TASK}" \
  --tasks 96 --samples 1200 --observations-limit 3000 \
  --output "reports/cluster-${SLURM_JOB_ID}.json"
