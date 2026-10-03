"""Local explorer, reproducible fits, and independent-star cluster jobs."""
from __future__ import annotations

import argparse
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .science import analyze_lightcurve, read_observations_csv


def fit_star(star_id: str, options: dict) -> dict:
    from .catalog import get_star, load_lightcurve
    record = get_star(star_id)
    if record is None:
        raise ValueError(f"Unknown star {star_id!r}")
    period = record.get("period_days") or 300
    kwargs = dict(options)
    kwargs["min_period"] = max(10, period * 0.65) if kwargs.get("min_period") is None else kwargs["min_period"]
    kwargs["max_period"] = period * 1.5 if kwargs.get("max_period") is None else kwargs["max_period"]
    return {"star_id": record["id"], "catalog_period_days": record.get("period_days"),
            **analyze_lightcurve(load_lightcurve(record["id"]), **kwargs)}


def _batch_one(pair: tuple[str, dict]) -> dict:
    star_id, options = pair
    try:
        result = fit_star(star_id, options)
        # Compact scientific summary; curves and full frequency grids belong in individual fit exports.
        keys = ["period_days", "catalog_period_days", "coefficients", "reference_epoch_jd", "chi2",
                "reduced_chi2", "mean_magnitude", "amplitude_mag", "n_observations", "band",
                "time_system", "source_url", "warnings", "frequency_step_per_day", "harmonics"]
        return {"star_id": result["star_id"], "status": "ok", **{k: result.get(k) for k in keys}}
    except (ValueError, RuntimeError, OSError) as error:
        return {"star_id": star_id, "status": "error", "error": str(error)}


def write_json(path: Path | None, value, *, lines=False):
    content = "\n".join(json.dumps(row, allow_nan=False) for row in value) + "\n" if lines else json.dumps(value, indent=2, allow_nan=False) + "\n"
    if path is None:
        print(content, end="")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + f".{os.getpid()}.tmp")
    try:
        temporary.write_text(content, encoding="utf-8")
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="THOTHv2 Mira Observatory")
    sub = parser.add_subparsers(dest="command", required=True)
    serve = sub.add_parser("serve", help="Open the Python observatory server")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8765)
    analyze = sub.add_parser("analyze", help="Fit real photometry with the native C++ kernel")
    source = analyze.add_mutually_exclusive_group(required=True)
    source.add_argument("--star", help="Catalog id or GCVS name")
    source.add_argument("--input", type=Path, help="CSV: time_jd,magnitude,error_mag[,band]")
    analyze.add_argument("--output", type=Path)
    analyze.add_argument("--band")
    batch = sub.add_parser("batch", help="Distribute independent star fits across threads or MPI ranks")
    batch.add_argument("--ids", type=Path, required=True, help="One catalog id per line")
    batch.add_argument("--output", type=Path, required=True, help="JSON Lines output; only rank 0 writes")
    batch.add_argument("--workers", type=int, default=1, choices=range(1, 33))
    batch.add_argument("--mpi", action="store_true", help="Requires mpi4py and an MPI installation")
    for command in (analyze, batch):
        command.add_argument("--min-period", type=float)
        command.add_argument("--max-period", type=float)
        command.add_argument("--samples", type=int, default=1500)
        command.add_argument("--harmonics", type=int, choices=(1, 2, 3), default=2)
    analyze.add_argument("--threads", type=int, default=1)
    sub.add_parser("catalog-info", help="Print source coverage and snapshot provenance")
    refresh = sub.add_parser("refresh-catalog", help="Fetch a new complete source snapshot")
    refresh.add_argument("--output", type=Path, required=True, help="Output directory (does not replace installed data)")
    args = parser.parse_args(argv)
    try:
        if args.command == "serve":
            import uvicorn
            uvicorn.run("thoth.server:app", host=args.host, port=args.port)
        elif args.command == "catalog-info":
            from .catalog import catalog_manifest
            write_json(None, catalog_manifest())
        elif args.command == "refresh-catalog":
            from .catalog import refresh_catalog
            refresh_catalog(args.output)
        elif args.command == "analyze":
            options = {"samples": args.samples, "harmonics": args.harmonics, "threads": args.threads}
            if args.min_period is not None:
                options["min_period"] = args.min_period
            if args.max_period is not None:
                options["max_period"] = args.max_period
            if args.band:
                options["band"] = args.band
            result = fit_star(args.star, options) if args.star else analyze_lightcurve(read_observations_csv(args.input), **options)
            write_json(args.output, result)
        elif args.command == "batch":
            comm, rank, size = None, 0, 1
            if args.mpi:
                try:
                    from mpi4py import MPI
                except ImportError as error:
                    raise RuntimeError("MPI mode requires pip install '.[cluster]' and an MPI runtime.") from error
                comm, rank, size = MPI.COMM_WORLD, MPI.COMM_WORLD.Get_rank(), MPI.COMM_WORLD.Get_size()
            # Rank zero owns input and output I/O. Broadcast failures before peers
            # enter collectives, so a missing file or unwritable output cannot hang them.
            control = None
            if rank == 0:
                try:
                    ids = [s.strip() for s in args.ids.read_text(encoding="utf-8").splitlines() if s.strip() and not s.lstrip().startswith("#")]
                    if not ids:
                        raise ValueError("The ids file has no stars.")
                    control = {"ids": ids}
                except (OSError, ValueError) as error:
                    control = {"error": str(error)}
            control = comm.bcast(control, root=0) if comm else control
            if "error" in control:
                raise RuntimeError(control["error"])
            ids = control["ids"]
            options = {"min_period": args.min_period, "max_period": args.max_period,
                       "samples": args.samples, "harmonics": args.harmonics, "threads": 1}
            indexed = list(enumerate(ids))[rank::size]
            with ThreadPoolExecutor(max_workers=args.workers) as pool:
                local = list(zip([i for i, _ in indexed], pool.map(_batch_one, [(star_id, options) for _, star_id in indexed])))
            partitions = comm.gather(local, root=0) if comm else [local]
            completion = None
            if rank == 0:
                results = [row for _, row in sorted((pair for part in partitions for pair in part), key=lambda p: p[0])]
                try:
                    write_json(args.output, results, lines=True)
                    completion = {"failed": any(row["status"] == "error" for row in results)}
                    print(f"Wrote {len(results)} results to {args.output}; {sum(row['status'] == 'error' for row in results)} errors.", file=sys.stderr)
                except (OSError, ValueError) as error:
                    completion = {"failed": True, "error": str(error)}
            completion = comm.bcast(completion, root=0) if comm else completion
            if "error" in completion:
                raise RuntimeError(completion["error"])
            return 1 if completion["failed"] else 0
        return 0
    except (ValueError, RuntimeError, OSError) as error:
        print(f"THOTH: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
