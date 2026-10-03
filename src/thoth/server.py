"""Local Python observatory API. The numerical work is performed in C++."""
from __future__ import annotations

import csv
import io
import statistics
import threading
import time
import uuid
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, model_validator

from . import __version__
from .catalog import CatalogError, catalog_manifest, get_star, load_catalog, load_lightcurve
from .science import analyze_lightcurve, native_status

app = FastAPI(title="THOTHv2 Mira Observatory", version=__version__)
WEB = Path(__file__).parent / "web"
EXAMPLE_STAR_ID = "OGLE-BLG-LPV-096697"
COVERAGE = "Catalog entries from complete OGLE Mira lists and GCVS exact M classifications. Catalogs may overlap; this is not a deduplicated census of every known Mira."


@lru_cache(maxsize=1)
def stars_snapshot() -> tuple[dict, ...]:
    return tuple(load_catalog())


@lru_cache(maxsize=1)
def summary() -> dict:
    stars = stars_snapshot()
    periods = [s["period_days"] for s in stars if s.get("period_days") is not None]
    catalogs = sorted({s["catalog"] for s in stars})
    regions = sorted({s["region"] for s in stars})
    return {"total_stars": len(stars), "with_period": len(periods),
            "median_period_days": statistics.median(periods) if periods else None,
            "catalogs": [{"name": name, "count": sum(s["catalog"] == name for s in stars)} for name in catalogs],
            "regions": regions, "coverage_note": COVERAGE}


def filter_stars(search: str = "", catalog: str = "", region: str = "",
                 min_period: float | None = None, max_period: float | None = None) -> list[dict]:
    if min_period is not None and max_period is not None and min_period > max_period:
        raise HTTPException(422, "Minimum period must not exceed maximum period.")
    term = search.strip().casefold()
    if term == "mira":
        term = "omi cet"
    results = []
    for star in stars_snapshot():
        if term and term not in (star["id"] + " " + star["name"] + " " + " ".join(star.get("aliases", []))).casefold():
            continue
        if catalog and star["catalog"] != catalog:
            continue
        if region and star["region"] != region:
            continue
        period = star.get("period_days")
        if min_period is not None and (period is None or period < min_period):
            continue
        if max_period is not None and (period is None or period > max_period):
            continue
        results.append(star)
    return results


@app.get("/api/status")
def status():
    return {"version": __version__, **native_status(), "example_star_id": EXAMPLE_STAR_ID}


@app.get("/api/catalog")
def catalog(search: str = Query("", max_length=200), catalog: str = "", region: str = "",
            min_period: float | None = Query(None, ge=0, le=100_000, allow_inf_nan=False),
            max_period: float | None = Query(None, ge=0, le=100_000, allow_inf_nan=False),
            sort: str = "name", direction: str = "asc",
            page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=500)):
    if sort not in {"name", "id", "period_days", "ra_deg", "dec_deg", "catalog", "amplitude_i_mag", "mean_i_mag"}:
        raise HTTPException(422, "Unsupported sort field.")
    if direction not in {"asc", "desc"}:
        raise HTTPException(422, "Direction must be asc or desc.")
    items = filter_stars(search, catalog, region, min_period, max_period)
    known = [s for s in items if s.get(sort) is not None]
    missing = [s for s in items if s.get(sort) is None]
    known.sort(key=lambda s: s[sort].casefold() if isinstance(s[sort], str) else s[sort], reverse=direction == "desc")
    items = known + missing
    start = (page - 1) * page_size
    return {"items": items[start:start + page_size], "total": len(items), "page": page,
            "page_size": page_size, "summary": summary(), "manifest": catalog_manifest()}


@app.get("/api/sky")
def sky(catalog: str = "", region: str = ""):
    keys = ("id", "name", "ra_deg", "dec_deg", "period_days", "catalog", "region")
    return [{key: s.get(key) for key in keys} for s in filter_stars(catalog=catalog, region=region)
            if s.get("ra_deg") is not None and s.get("dec_deg") is not None]


@app.get("/api/stars/{star_id}/lightcurve")
def lightcurve(star_id: str):
    if get_star(star_id) is None:
        raise HTTPException(404, "Star not found.")
    try:
        return load_lightcurve(star_id)
    except CatalogError as error:
        raise HTTPException(424, str(error)) from error


@app.get("/api/stars/{star_id}")
def star(star_id: str):
    record = get_star(star_id)
    if record is None:
        raise HTTPException(404, "Star not found.")
    return record


class AnalysisRequest(BaseModel):
    star_id: str = Field(max_length=150)
    min_period: float = Field(50, gt=0, le=100_000, allow_inf_nan=False)
    max_period: float = Field(1000, gt=0, le=100_000, allow_inf_nan=False)
    samples: int = Field(1500, ge=50, le=20_000)
    harmonics: int = Field(2, ge=1, le=3)
    threads: int = Field(1, ge=0, le=32)

    @model_validator(mode="after")
    def period_range(self):
        if self.min_period >= self.max_period:
            raise ValueError("Minimum period must be less than maximum period.")
        return self


@app.post("/api/analyze")
def analyze(request: AnalysisRequest):
    record = get_star(request.star_id)
    if record is None:
        raise HTTPException(404, "Star not found.")
    try:
        curve = load_lightcurve(record["id"])
        result = analyze_lightcurve(curve, **request.model_dump(exclude={"star_id"}))
    except CatalogError as error:
        raise HTTPException(424, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error
    result.update({"star_id": record["id"], "catalog_period_days": record.get("period_days")})
    return result


@app.get("/api/export/catalog")
def export_catalog(search: str = "", catalog: str = "", region: str = "",
                   min_period: float | None = Query(None, ge=0, le=100_000, allow_inf_nan=False),
                   max_period: float | None = Query(None, ge=0, le=100_000, allow_inf_nan=False)):
    fields = ["id", "name", "catalog", "region", "classification", "ra_deg", "dec_deg",
              "period_days", "mean_i_mag", "mean_v_mag", "amplitude_i_mag", "spectral_type", "source_url"]
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for item in filter_stars(search, catalog, region, min_period, max_period):
        writer.writerow(item)
    return Response(buffer.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": 'attachment; filename="thoth-mira-catalog.csv"'})


@app.get("/")
def index():
    return FileResponse(WEB / "index.html")


app.mount("/static", StaticFiles(directory=WEB, check_dir=False), name="static")

# One experiment at a time keeps an interactive demo from oversubscribing the host.
_jobs: dict[str, dict] = {}
_jobs_lock = threading.Lock()
_compute_slot = threading.Lock()


class ClusterRequest(BaseModel):
    star_id: str = Field(EXAMPLE_STAR_ID, max_length=150)
    workers: int = Field(4, ge=1, le=8)
    tasks: int = Field(12, ge=2, le=48)
    samples: int = Field(400, ge=50, le=1200)
    observations_limit: int = Field(1200, ge=50, le=3000)


def execute_cluster_job(job_id: str, settings: dict):
    def progress(event):
        with _jobs_lock:
            job = _jobs[job_id]
            job["state"] = "running"
            job["progress"] = event
            job["events"].append({**event, "elapsed_seconds": time.perf_counter() - started})
            job["events"] = job["events"][-120:]

    started = time.perf_counter()
    try:
        from .cluster import run_cluster_experiment
        result = run_cluster_experiment(**settings, progress=progress)
        result.update({"workers": settings["workers"], "tasks": settings["tasks"]})
        with _jobs_lock:
            _jobs[job_id].update(state="complete", result=result)
    except Exception as error:
        with _jobs_lock:
            _jobs[job_id].update(state="failed", error=str(error))
    finally:
        _compute_slot.release()


@app.post("/api/cluster/jobs", status_code=202)
def start_cluster_job(request: ClusterRequest):
    if get_star(request.star_id) is None:
        raise HTTPException(404, "Star not found.")
    if not native_status()["native_available"]:
        raise HTTPException(503, "Build the native engine before running a compute job.")
    if not _compute_slot.acquire(blocking=False):
        raise HTTPException(409, "A compute experiment is already running. Wait for its measured results.")
    job_id = uuid.uuid4().hex
    with _jobs_lock:
        # Bound process-local telemetry history.
        while len(_jobs) >= 12:
            _jobs.pop(next(iter(_jobs)))
        _jobs[job_id] = {"job_id": job_id, "state": "queued", "progress": {"stage": "preparing", "completed": 0, "total": request.tasks},
                         "events": [], "result": None, "error": None}
    try:
        threading.Thread(target=execute_cluster_job, args=(job_id, request.model_dump()), daemon=True).start()
    except Exception as error:
        with _jobs_lock:
            _jobs[job_id].update(state="failed", error="Could not start the compute worker.")
        _compute_slot.release()
        raise HTTPException(503, "Could not start the compute worker.") from error
    return {"job_id": job_id, "state": "queued"}


@app.get("/api/cluster/jobs/{job_id}")
def cluster_job(job_id: str):
    import copy
    with _jobs_lock:
        if job_id not in _jobs:
            raise HTTPException(404, "Compute job not found (history is process-local).")
        return copy.deepcopy(_jobs[job_id])
