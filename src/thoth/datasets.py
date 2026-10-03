"""Persistent local observations with explicit time standards and immutable provenance."""
from __future__ import annotations

import hashlib
import json
import math
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .catalog import _cache_directory
from .science import read_observations_text


def workspace_directory() -> Path:
    return Path(os.environ["THOTH_WORKSPACE_DIR"]).expanduser() if os.environ.get("THOTH_WORKSPACE_DIR") else _cache_directory() / "workspace"


def write_record(kind: str, identifier: str, record: dict) -> None:
    if kind not in {"datasets", "reports"} or not re.fullmatch(r"[0-9a-f]{32}", identifier):
        raise ValueError("Invalid workspace record identifier.")
    directory = workspace_directory() / kind
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / f"{identifier}.json"
    temporary = directory / f".{identifier}.{uuid.uuid4().hex}.tmp"
    try:
        temporary.write_text(json.dumps(record, allow_nan=False, ensure_ascii=False), encoding="utf-8")
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)


def read_record(kind: str, identifier: str) -> dict | None:
    if kind not in {"datasets", "reports"} or not re.fullmatch(r"[0-9a-f]{32}", identifier):
        return None
    path = workspace_directory() / kind / f"{identifier}.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None


def list_datasets(limit: int = 100) -> dict:
    directory = workspace_directory() / "datasets"
    if not directory.exists():
        return {"items": [], "total": 0}
    paths = sorted(directory.glob("*.json"), key=lambda path: path.stat().st_mtime, reverse=True)
    items = []
    for path in paths[:limit]:
        record = read_record("datasets", path.stem)
        if record is not None:
            items.append({key: value for key, value in record.items() if key != "observations"})
    return {"items": items, "total": len(paths)}


def import_dataset(name: str, csv_text: str, time_system: str, band: str) -> dict:
    """Store one chosen photometric band. Times are full JD, HJD or BJD days."""
    curve = read_observations_text(csv_text, default_band=band)
    all_observations = curve["observations"]
    observations = [row for row in all_observations if row["band"] == band]
    if len(observations) < 30:
        raise ValueError("Research imports require at least 30 observations in the selected band.")
    if any(not 1_000_000 <= row["time_jd"] <= 4_000_000 for row in observations):
        raise ValueError("Use full Julian dates in time_jd (1,000,000 to 4,000,000). Restore any survey-specific offset before importing.")
    if len({row["time_jd"] for row in observations}) < 12:
        raise ValueError("At least 12 distinct observation times are required.")
    # Stable sorting preserves contemporaneous duplicate measurements.
    observations.sort(key=lambda row: row["time_jd"])
    if not math.isfinite(observations[-1]["time_jd"] - observations[0]["time_jd"]):
        raise ValueError("Invalid observation time span.")
    identifier = uuid.uuid4().hex
    record = {"dataset_id": identifier, "star_id": f"dataset:{identifier}", "name": name.strip(),
              "observations": observations, "observations_count": len(observations),
              "imported_rows": len(all_observations), "excluded_other_bands": len(all_observations) - len(observations),
              "band": band, "time_system": time_system, "data_source": "user_upload",
              "source_url": f"local-dataset:{identifier}", "sha256": hashlib.sha256(csv_text.encode("utf-8")).hexdigest(),
              "created_at": datetime.now(timezone.utc).isoformat(),
              "caveats": ["The observer supplies the time standard and photometric calibration; THOTH does not convert JD, HJD or BJD.",
                          "An imported light curve has no automatically verified Mira classification or stellar identity."]}
    write_record("datasets", identifier, record)
    return record
