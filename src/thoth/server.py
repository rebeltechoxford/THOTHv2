"""Local Python observatory API. The numerical work is performed in C++."""
from __future__ import annotations

import csv
import io
import json
import mimetypes
import statistics
import threading
import time
import uuid
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field, model_validator

from . import __version__
from .catalog import CatalogError, catalog_manifest, get_star, load_catalog, load_lightcurve
from .science import analyze_lightcurve, native_status
from .datasets import import_dataset, list_datasets, read_record, write_record

app = FastAPI(title="THOTHv2 Mira Observatory", version=__version__)
app.add_middleware(GZipMiddleware, minimum_size=2048)
WEB = Path(__file__).parent / "web"
# Windows registry mappings can label .js as text/plain, which browsers reject
# for ES modules. Pin standard web asset types within this process only.
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
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


@app.get("/api/health")
def health():
    state = native_status()
    if not state["native_available"]:
        raise HTTPException(503, "Native science engine is unavailable.")
    return {"ready": True, "version": __version__, **state}


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
    if not _compute_slot.acquire(blocking=False):
        raise HTTPException(409, "A compute experiment is already running. Wait for its measured results.")
    try:
        curve = load_lightcurve(record["id"])
        result = analyze_lightcurve(curve, **request.model_dump(exclude={"star_id"}))
    except CatalogError as error:
        raise HTTPException(424, str(error)) from error
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error
    finally:
        _compute_slot.release()
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
app.mount("/assets", StaticFiles(directory=WEB / "assets", check_dir=False), name="assets")

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


class DatasetRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    csv_text: str = Field(min_length=20, max_length=8_000_000)
    time_system: str = Field(pattern=r"^(JD|HJD|BJD)$")
    band: str = Field(min_length=1, max_length=24)

    @model_validator(mode="after")
    def clean_labels(self):
        self.name, self.band = self.name.strip(), self.band.strip()
        if not self.name or not self.band:
            raise ValueError("Supply a dataset name and selected photometric band.")
        return self


@app.post("/api/datasets", status_code=201)
def upload_dataset(request: DatasetRequest):
    try:
        record = import_dataset(**request.model_dump())
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except OSError as error:
        raise HTTPException(503, "The local workspace cannot save observations.") from error
    return {key: value for key, value in record.items() if key != "observations"}


@app.get("/api/datasets")
def imported_datasets():
    return list_datasets()


@app.get("/api/datasets/{dataset_id}")
def dataset(dataset_id: str):
    record = read_record("datasets", dataset_id)
    if record is None:
        raise HTTPException(404, "Dataset not found in this local workspace.")
    return record


_research_jobs: dict[str, dict] = {}
_research_jobs_lock = threading.Lock()


class ResearchRequest(BaseModel):
    star_id: str | None = Field(None, max_length=150)
    dataset_id: str | None = Field(None, pattern=r"^[0-9a-f]{32}$")
    min_period: float = Field(50, ge=0.5, le=100_000, allow_inf_nan=False)
    max_period: float = Field(1000, ge=0.5, le=100_000, allow_inf_nan=False)
    samples: int = Field(800, ge=50, le=3000)
    threads: int = Field(1, ge=1, le=32)
    observations_limit: int = Field(3000, ge=30, le=3000)

    @model_validator(mode="after")
    def validate_experiment(self):
        if bool(self.star_id) == bool(self.dataset_id):
            raise ValueError("Choose exactly one catalog star or imported dataset.")
        if self.min_period >= self.max_period:
            raise ValueError("Minimum period must be less than maximum period.")
        return self


def execute_research_job(job_id: str, settings: dict):
    started = time.perf_counter()

    def progress(event):
        with _research_jobs_lock:
            job = _research_jobs[job_id]
            job.update(state="running", progress=event)
            job["events"].append({**event, "elapsed_seconds": time.perf_counter() - started})
            job["events"] = job["events"][-80:]

    try:
        from .research import investigate_lightcurve
        progress({"stage": "loading", "percent": 2, "detail": "Loading observations and provenance"})
        curve = (read_record("datasets", settings["dataset_id"]) if settings.get("dataset_id")
                 else load_lightcurve(settings["star_id"]))
        if curve is None:
            raise ValueError("The selected dataset no longer exists.")
        result = investigate_lightcurve(curve, **{key: value for key, value in settings.items()
                                                 if key not in {"star_id", "dataset_id"}}, progress=progress)
        result["request"] = settings
        result["job_id"] = job_id
        # Confirm the API can serialize the evidence before publishing success.
        json.dumps(result, allow_nan=False)
        progress({"stage": "complete", "percent": 100, "detail": "Evidence report ready"})
        with _research_jobs_lock:
            _research_jobs[job_id].update(state="complete", result=result)
            snapshot = dict(_research_jobs[job_id])
        try:
            write_record("reports", job_id, snapshot)
        except (OSError, ValueError):
            with _research_jobs_lock:
                _research_jobs[job_id]["persistence_warning"] = "Report is available for this session; saving to the workspace failed."
    except Exception as error:
        with _research_jobs_lock:
            _research_jobs[job_id].update(state="failed", result=None, error=str(error))
    finally:
        _compute_slot.release()


@app.post("/api/research/jobs", status_code=202)
def start_research_job(request: ResearchRequest):
    if request.star_id is not None and get_star(request.star_id) is None:
        raise HTTPException(404, "Star not found.")
    if request.dataset_id is not None and read_record("datasets", request.dataset_id) is None:
        raise HTTPException(404, "Dataset not found in this local workspace.")
    if not native_status()["native_available"]:
        raise HTTPException(503, "Build the native engine before running a research job.")
    if not _compute_slot.acquire(blocking=False):
        raise HTTPException(409, "A compute experiment is already running. Wait for its measured results.")
    job_id = uuid.uuid4().hex
    with _research_jobs_lock:
        while len(_research_jobs) >= 12:
            _research_jobs.pop(next(iter(_research_jobs)))
        _research_jobs[job_id] = {"job_id": job_id, "state": "queued", "progress": {"stage": "preparing", "percent": 0},
                                  "events": [], "result": None, "error": None}
    try:
        threading.Thread(target=execute_research_job, args=(job_id, request.model_dump()), daemon=True).start()
    except Exception as error:
        with _research_jobs_lock:
            _research_jobs[job_id].update(state="failed", error="Could not start the research worker.")
        _compute_slot.release()
        raise HTTPException(503, "Could not start the research worker.") from error
    return {"job_id": job_id, "state": "queued"}


@app.get("/api/research/jobs/{job_id}")
def research_job(job_id: str):
    import copy
    with _research_jobs_lock:
        if job_id in _research_jobs:
            return copy.deepcopy(_research_jobs[job_id])
    saved = read_record("reports", job_id)
    if saved is None:
        raise HTTPException(404, "Research job not found.")
    return saved


class SimulationRequest(BaseModel):
    period_days: float = Field(300, ge=0.5, le=100_000, allow_inf_nan=False)
    damping: float = Field(0.05, ge=0, le=2, allow_inf_nan=False)
    drive: float = Field(0.15, ge=0, le=2, allow_inf_nan=False)
    nonlinearity: float = Field(0.2, ge=0, le=4, allow_inf_nan=False)
    cycles: int = Field(6, ge=1, le=40)
    steps_per_cycle: int = Field(200, ge=64, le=1000)


@app.post("/api/simulation")
def simulation(request: SimulationRequest):
    if not _compute_slot.acquire(blocking=False):
        raise HTTPException(409, "A compute experiment is already running. Wait for its measured results.")
    try:
        from .research import simulate_pulsation
        return simulate_pulsation(**request.model_dump())
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error
    finally:
        _compute_slot.release()


_transform_jobs: dict[str, dict] = {}
_transform_jobs_lock = threading.Lock()


class TransformRequest(BaseModel):
    """Bound the interactive workload; the MPI command supports larger surveys."""
    star_id: str | None = Field(None, max_length=150)
    dataset_id: str | None = Field(None, pattern=r"^[0-9a-f]{32}$")
    min_period: float = Field(60, ge=0.5, le=100_000, allow_inf_nan=False)
    max_period: float = Field(140, ge=0.5, le=100_000, allow_inf_nan=False)
    frequency_samples: int = Field(128, ge=32, le=384)
    drift_samples: int = Field(31, ge=3, le=81)
    time_samples: int = Field(24, ge=8, le=64)
    drift_cycles: float = Field(2, ge=0, le=8, allow_inf_nan=False)
    window_cycles: float = Field(3, ge=0.5, le=8, allow_inf_nan=False)
    surrogates: int = Field(12, ge=1, le=64)
    workers: int = Field(2, ge=1, le=8)
    observations_limit: int = Field(1200, ge=30, le=3000)
    harmonics: int = Field(2, ge=1, le=3)
    seed: int = Field(1729, ge=0, le=2**32 - 1)

    @model_validator(mode="after")
    def validate_experiment(self):
        if bool(self.star_id) == bool(self.dataset_id):
            raise ValueError("Choose exactly one catalog star or imported dataset.")
        if self.min_period >= self.max_period:
            raise ValueError("Minimum period must be less than maximum period.")
        if self.drift_samples % 2 != 1:
            raise ValueError("The drift grid must have an odd number of rows to include zero drift.")
        return self


def execute_transform_job(job_id: str, settings: dict):
    started = time.perf_counter()

    def progress(event):
        with _transform_jobs_lock:
            job = _transform_jobs[job_id]
            job.update(state="running", progress=event)
            job["events"].append({**event, "elapsed_seconds": time.perf_counter() - started})
            job["events"] = job["events"][-120:]

    try:
        from .transforms import run_transform_lab
        progress({"stage": "loading", "percent": 1, "detail": "Loading measured photometry and source provenance"})
        curve = (read_record("datasets", settings["dataset_id"]) if settings.get("dataset_id")
                 else load_lightcurve(settings["star_id"]))
        if curve is None:
            raise ValueError("The selected dataset no longer exists.")
        result = run_transform_lab(curve, **{key: value for key, value in settings.items()
                                            if key not in {"star_id", "dataset_id"}}, progress=progress)
        result.update(request=settings, job_id=job_id)
        json.dumps(result, allow_nan=False)
        progress({"stage": "complete", "percent": 100, "detail": "Native transforms and ensemble evidence ready"})
        with _transform_jobs_lock:
            _transform_jobs[job_id].update(state="complete", result=result)
            snapshot = dict(_transform_jobs[job_id])
        try:
            write_record("reports", job_id, snapshot)
        except (OSError, ValueError):
            with _transform_jobs_lock:
                _transform_jobs[job_id]["persistence_warning"] = "Report is available for this session; saving to the workspace failed."
    except Exception as error:
        with _transform_jobs_lock:
            _transform_jobs[job_id].update(state="failed", result=None, error=str(error))
    finally:
        _compute_slot.release()


@app.post("/api/transforms/jobs", status_code=202)
def start_transform_job(request: TransformRequest):
    if request.star_id is not None and get_star(request.star_id) is None:
        raise HTTPException(404, "Star not found.")
    if request.dataset_id is not None and read_record("datasets", request.dataset_id) is None:
        raise HTTPException(404, "Dataset not found in this local workspace.")
    if not native_status()["native_available"]:
        raise HTTPException(503, "Build the native engine before running transforms.")
    if not _compute_slot.acquire(blocking=False):
        raise HTTPException(409, "A compute experiment is already running. Wait for its measured results.")
    job_id = uuid.uuid4().hex
    with _transform_jobs_lock:
        while len(_transform_jobs) >= 12:
            _transform_jobs.pop(next(iter(_transform_jobs)))
        _transform_jobs[job_id] = {"job_id": job_id, "kind": "transforms", "state": "queued",
                                   "progress": {"stage": "preparing", "percent": 0, "detail": "Waiting for native kernels"},
                                   "events": [], "result": None, "error": None}
    try:
        threading.Thread(target=execute_transform_job, args=(job_id, request.model_dump()), daemon=True).start()
    except Exception as error:
        with _transform_jobs_lock:
            _transform_jobs[job_id].update(state="failed", error="Could not start the transform worker.")
        _compute_slot.release()
        raise HTTPException(503, "Could not start the transform worker.") from error
    return {"job_id": job_id, "state": "queued"}


@app.get("/api/transforms/jobs/{job_id}")
def transform_job(job_id: str):
    import copy
    with _transform_jobs_lock:
        if job_id in _transform_jobs:
            return copy.deepcopy(_transform_jobs[job_id])
    saved = read_record("reports", job_id)
    if saved is None or saved.get("kind") != "transforms":
        raise HTTPException(404, "Transform job not found.")
    return saved


@lru_cache(maxsize=6)
def space_snapshot(catalog: str = "", region: str = ""):
    from .space import prepare_space_catalog
    records = filter_stars(catalog=catalog, region=region)
    return prepare_space_catalog(records, threads=1)


@app.get("/api/space")
def space_catalog(catalog: str = "", region: str = ""):
    try:
        return space_snapshot(catalog, region)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error


class StarModelRequest(BaseModel):
    star_id: str = Field(max_length=150)
    phase: float = Field(0, ge=0, le=1, allow_inf_nan=False)
    resolution: int = Field(48, ge=12, le=96)
    displacement: float = Field(0, ge=-0.5, le=0.5, allow_inf_nan=False)
    contrast: float = Field(0, ge=0, le=0.25, allow_inf_nan=False)
    radius_fraction: float = Field(0.5, ge=0, le=1, allow_inf_nan=False)
    reference_temperature_k: float = Field(3000, ge=1500, le=10000, allow_inf_nan=False)
    wavelength_um: float | None = Field(None, ge=0.2, le=20, allow_inf_nan=False)


@app.post("/api/space/star")
def space_star_model(request: StarModelRequest):
    record = get_star(request.star_id)
    if record is None:
        raise HTTPException(404, "Star not found.")
    if not _compute_slot.acquire(blocking=False):
        raise HTTPException(409, "A compute experiment is already running. Wait for its measured results.")
    try:
        from .space import build_star_model
        from .astrometry import cached_evidence
        curve = None
        acquisition_error = None
        if record.get("lightcurve_url"):
            try:
                curve = load_lightcurve(record["id"])
            except (CatalogError, OSError) as error:
                acquisition_error = str(error)
        result = build_star_model(record, curve, **request.model_dump(exclude={"star_id"}))
        result["distance_evidence"] = cached_evidence(record["id"])
        if acquisition_error:
            result["photometry_acquisition_error"] = acquisition_error
        json.dumps(result, allow_nan=False)
        return result
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error
    finally:
        _compute_slot.release()


@app.get("/api/space/evidence/{star_id}")
def space_evidence(star_id: str, radius_arcsec: float = Query(3, ge=1, le=30, allow_inf_nan=False), refresh: bool = False):
    record = get_star(star_id)
    if record is None:
        raise HTTPException(404, "Star not found.")
    try:
        from .astrometry import acquire_evidence
        return acquire_evidence(record, radius_arcsec, refresh=refresh)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except (RuntimeError, OSError) as error:
        raise HTTPException(424, str(error)) from error


class DistanceRequest(BaseModel):
    parallax_mas: float = Field(ge=-1000000, le=1000000, allow_inf_nan=False)
    parallax_error_mas: float = Field(ge=0.000001, le=1000, allow_inf_nan=False)
    prior_length_pc: float = Field(1350, ge=1, le=10000, allow_inf_nan=False)
    samples: int = Field(1024, ge=128, le=8192)
    max_distance_pc: float = Field(20000, ge=10, le=100000, allow_inf_nan=False)


@app.post("/api/space/distance")
def space_distance(request: DistanceRequest):
    from .research import _native_engine
    try:
        return _native_engine().distance_posterior(**request.model_dump())
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error


@app.get("/api/space/astrometry")
def space_astrometry(prior_length_pc: float = Query(1350, ge=1, le=10000, allow_inf_nan=False)):
    try:
        from .astrometry import spatial_candidates
        return spatial_candidates(prior_length_pc)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except (RuntimeError, OSError) as error:
        raise HTTPException(503, str(error)) from error


@app.get("/api/space/surfaces/{job_id}")
def space_transform_surface(job_id: str, kind: str = Query("chirp", pattern="^(chirp|localized)$")):
    job = transform_job(job_id)
    if job["state"] != "complete" or job.get("result") is None:
        raise HTTPException(409, "Complete a transform experiment before reconstructing its surface.")
    from .space import build_transform_surface
    try:
        return build_transform_surface(job["result"], kind)
    except ValueError as error:
        raise HTTPException(422, str(error)) from error
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from error
