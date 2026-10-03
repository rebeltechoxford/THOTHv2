"""Reproducible Mira catalog ingestion and real OGLE light-curve access.

The bundled catalog is a union of *catalog entries*, not a cross-matched list
of unique stars. Source identifiers, nulls and bandpasses are preserved.
"""

from __future__ import annotations

import argparse
import copy
import csv
from datetime import datetime, timezone
from functools import lru_cache
import gzip
import hashlib
from importlib.resources import files
import json
import math
import os
from pathlib import Path
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class CatalogError(RuntimeError):
    """An archive or catalog operation failed; no substitute data were used."""


OGLE_SOURCES = {
    "BLG": {
        "base": "https://www.astrouw.edu.pl/ogle/ogle4/OCVS/blg/lpv/",
        "catalog": "OGLE BLG",
        "region": "Galactic bulge",
        "coordinates": (27, 38, 39, 50),
        "photometry": "phot_ogle4/I/",
        "minimum_rows": 39000,
        "reference": "Iwanek et al. 2022, ApJS 260, 46; 2022ApJS..260...46I",
    },
    "GD": {
        "base": "https://www.astrouw.edu.pl/ogle/ogle4/OCVS/gd/lpv/",
        "catalog": "OGLE GD",
        "region": "Galactic disk",
        "coordinates": (26, 37, 38, 49),
        "photometry": "phot_ogle4/I/",
        "minimum_rows": 24000,
        "reference": "Iwanek et al. 2022, ApJS 260, 46; 2022ApJS..260...46I",
    },
    "LMC": {
        "base": "https://ftp.astrouw.edu.pl/ogle/ogle3/OIII-CVS/lmc/lpv/",
        "catalog": "OGLE LMC",
        "region": "Large Magellanic Cloud",
        "coordinates": (50, 61, 62, 73),
        "photometry": "phot/I/",
        "minimum_rows": 1600,
        "reference": "Soszynski et al. 2009, Acta Astron. 59, 239; 2009AcA....59..239S",
    },
    "SMC": {
        "base": "https://ftp.astrouw.edu.pl/ogle/ogle3/OIII-CVS/smc/lpv/",
        "catalog": "OGLE SMC",
        "region": "Small Magellanic Cloud",
        "coordinates": (46, 57, 58, 69),
        "photometry": "phot/I/",
        "minimum_rows": 350,
        "reference": "Soszynski et al. 2011, Acta Astron. 61, 217; 2011AcA....61..217S",
    },
}
GCVS_COLUMNS = (
    "GCVS", "RAJ2000", "DEJ2000", "VarType", "magMax", "Min1", "flt",
    "Epoch", "Period", "SpType", "l_magMax", "u_magMax", "l_Min1",
    "u_Min1", "n_Min1", "l_Period", "u_Period", "u_Epoch", "Exists",
)
GCVS_QUERY_URL = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv?" + urlencode({
    "-source": "B/gcvs/gcvs_cat", "VarType": "M", "-out.max": "unlimited",
    "-out": ",".join(GCVS_COLUMNS),
})
GCVS_SOURCE_URL = "https://cdsarc.cds.unistra.fr/viz-bin/cat/B/gcvs"
EXAMPLE_STAR_ID = "OGLE-BLG-LPV-096697"
BUNDLED_EXAMPLES = (EXAMPLE_STAR_ID, "OGLE-LMC-LPV-04312")
MAX_DOWNLOAD_BYTES = 32 * 1024 * 1024


def _number(value: str | None) -> float | None:
    if value is None or value.strip() in {"", "-", "--"}:
        return None
    try:
        number = float(value)
    except ValueError as exc:
        raise CatalogError(f"Invalid catalog number: {value!r}") from exc
    if not math.isfinite(number):
        raise CatalogError(f"Non-finite catalog number: {value!r}")
    return number


def _coordinates(ra: str, dec: str) -> tuple[float | None, float | None]:
    """Convert sexagesimal equatorial J2000 coordinates to degrees."""
    if not ra.strip() or not dec.strip():
        return None, None
    try:
        rh, rm, rs = map(float, ra.replace(":", " ").split())
        sign = -1 if dec.strip().startswith("-") else 1
        dd, dm, ds = map(float, dec.strip().lstrip("+-").replace(":", " ").split())
    except ValueError as exc:
        raise CatalogError(f"Invalid J2000 coordinates: {ra!r}, {dec!r}") from exc
    if not (0 <= rh < 24 and 0 <= rm < 60 and 0 <= rs < 60):
        raise CatalogError(f"Right ascension outside range: {ra!r}")
    if not (0 <= dd <= 90 and 0 <= dm < 60 and 0 <= ds < 60):
        raise CatalogError(f"Declination outside range: {dec!r}")
    return 15 * (rh + rm / 60 + rs / 3600), sign * (dd + dm / 60 + ds / 3600)


def normalize_ogle(parameters: str, identifiers: str, region: str) -> list[dict]:
    """Join complete OGLE Miras.dat and ident.dat using published layouts."""
    spec = OGLE_SOURCES[region]
    positions = {}
    for line in identifiers.splitlines():
        if line.strip() and not line.startswith("#"):
            positions[line.split()[0]] = line
    records = []
    for line in parameters.splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        columns = line.split()
        if len(columns) < 5 or not columns[0].startswith(f"OGLE-{region}-LPV-"):
            raise CatalogError(f"Unexpected {region} Mira catalog format")
        star_id = columns[0]
        ident = positions.get(star_id)
        if ident is None:
            raise CatalogError(f"Missing OGLE identifier row for {star_id}")
        start_ra, end_ra, start_dec, end_dec = spec["coordinates"]
        ra, dec = _coordinates(ident[start_ra:end_ra], ident[start_dec:end_dec])
        record = {
            "id": star_id, "name": star_id, "ra_deg": ra, "dec_deg": dec,
            "period_days": _number(columns[3]),
            "mean_i_mag": _number(columns[1]), "mean_v_mag": _number(columns[2]),
            "amplitude_i_mag": _number(columns[4]), "spectral_type": None,
            "catalog": spec["catalog"], "source_url": spec["base"],
            "lightcurve_url": spec["base"] + spec["photometry"] + star_id + ".dat",
            "classification": "Mira", "classification_raw": "Mira",
            "region": spec["region"], "coordinate_system": "J2000",
        }
        if region in {"LMC", "SMC"}:
            chemistry = ident[47:48] if region == "LMC" else ident[43:44]
            record["chemistry"] = {"O": "oxygen-rich", "C": "carbon-rich"}.get(chemistry)
            record["aliases"] = [ident[105:110].strip()] if region == "LMC" else [ident[101:106].strip()]
            record["aliases"] = [alias for alias in record["aliases"] if alias and alias != "-"]
        else:
            offset = 102 if region == "BLG" else 101
            record["aliases"] = [ident[offset:].strip()] if ident[offset:].strip() else []
        records.append(record)
    if len({row["id"] for row in records}) != len(records):
        raise CatalogError(f"Duplicate IDs inside {region} catalog")
    return records


def normalize_gcvs(tsv: str) -> list[dict]:
    """Parse an unlimited exact-M VizieR query without interpreting amplitudes as minima."""
    if "#INFO\tQUERY_STATUS\tOVERFLOW" in tsv or "QUERY_STATUS=OVERFLOW" in tsv:
        raise CatalogError("VizieR reported a truncated query")
    lines = [line for line in tsv.splitlines() if line and not line.startswith("#")]
    if not lines or not lines[0].startswith("GCVS\t"):
        raise CatalogError("Unexpected GCVS response; expected VizieR TSV")
    reader = csv.DictReader(lines, delimiter="\t")
    records = []
    for raw in reader:
        row = {key: (value or "").strip() for key, value in raw.items() if key is not None}
        if row.get("VarType") != "M":  # also skips TSV units and separator rows
            continue
        name = row["GCVS"]
        ra, dec = _coordinates(row.get("RAJ2000", ""), row.get("DEJ2000", ""))
        epoch = _number(row.get("Epoch"))
        band = row.get("flt") or None
        # Min1 can contain an amplitude or a different-band measurement. Its
        # raw value/flags are retained separately; only safe minima are exposed.
        safe_minimum = not row.get("l_Min1") and row.get("n_Min1") in {"", band}
        records.append({
            "id": "GCVS:" + name, "name": name, "ra_deg": ra, "dec_deg": dec,
            "period_days": _number(row.get("Period")), "mean_i_mag": None,
            "mean_v_mag": None, "amplitude_i_mag": None,
            "spectral_type": row.get("SpType") or None, "catalog": "GCVS",
            "source_url": GCVS_SOURCE_URL, "lightcurve_url": None,
            "classification": "Mira", "classification_raw": "M",
            "region": "GCVS all-sky", "coordinate_system": "J2000",
            "aliases": ["Mira", "omicron Ceti"] if name == "omi Cet" else [],
            "magnitude_max": _number(row.get("magMax")),
            "magnitude_min": _number(row.get("Min1")) if safe_minimum else None,
            "magnitude_min_catalog": _number(row.get("Min1")), "magnitude_band": band,
            "epoch_max_jd": epoch + 2400000 if epoch is not None else None,
            "catalog_flags": {key: row.get(key, "") for key in (
                "l_magMax", "u_magMax", "l_Min1", "u_Min1", "n_Min1",
                "l_Period", "u_Period", "u_Epoch", "Exists",
            )},
        })
    if len({row["id"] for row in records}) != len(records):
        raise CatalogError("Duplicate names in GCVS result")
    return records


def _download_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": "THOTHv2 astronomy research/2.0"})
    try:
        with urlopen(request, timeout=40) as response:
            data = response.read(MAX_DOWNLOAD_BYTES + 1)
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        raise CatalogError(f"Could not retrieve archive data from {url}: {exc}") from exc
    if len(data) > MAX_DOWNLOAD_BYTES:
        raise CatalogError(f"Archive response exceeded {MAX_DOWNLOAD_BYTES} bytes: {url}")
    try:
        return data.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise CatalogError(f"Archive response is not UTF-8 text: {url}") from exc


def parse_photometry(text: str, band: str = "I") -> list[dict]:
    """Read real OGLE HJD-2450000, magnitude, sigma columns into full HJD."""
    observations = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        if not line.strip() or line.startswith("#"):
            continue
        columns = line.split()
        if len(columns) != 3:
            raise CatalogError(f"Unexpected OGLE photometry format on line {line_number}")
        try:
            time, magnitude, error = map(float, columns)
        except ValueError as exc:
            raise CatalogError(f"Invalid photometry on line {line_number}") from exc
        if not all(math.isfinite(value) for value in (time, magnitude, error)) or error <= 0:
            raise CatalogError(f"Invalid photometry values on line {line_number}")
        observations.append({"time_jd": time + 2450000, "magnitude": magnitude,
                             "error_mag": error, "band": band})
    if not observations:
        raise CatalogError("Archive returned no observations")
    return sorted(observations, key=lambda row: row["time_jd"])


@lru_cache(maxsize=1)
def _catalog() -> tuple[dict, ...]:
    payload = files("thoth").joinpath("data", "catalog.jsonl.gz").read_bytes()
    return tuple(json.loads(line) for line in gzip.decompress(payload).decode("utf-8").splitlines())


def load_catalog() -> list[dict]:
    """Return the complete bundled catalog, safe for the caller to modify."""
    return copy.deepcopy(list(_catalog()))


def catalog_manifest() -> dict:
    """Return source URLs, retrieval dates, checksums and coverage caveats."""
    return json.loads(files("thoth").joinpath("data", "manifest.json").read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def _star_index() -> dict[str, dict]:
    index = {}
    for row in _catalog():
        index[row["id"].casefold()] = row
        # First occurrence wins when a cross-catalog alias is ambiguous.
        for value in [row["name"], *row.get("aliases", [])]:
            index.setdefault(value.casefold(), row)
    return index


def get_star(star_id: str) -> dict | None:
    """Find a catalog entry by its exact identifier, display name or alias."""
    row = _star_index().get(star_id.strip().casefold())
    return copy.deepcopy(row) if row is not None else None


def _cache_directory() -> Path:
    if os.environ.get("THOTH_CACHE_DIR"):
        return Path(os.environ["THOTH_CACHE_DIR"]).expanduser()
    if os.name == "nt" and os.environ.get("LOCALAPPDATA"):
        return Path(os.environ["LOCALAPPDATA"]) / "THOTH" / "cache"
    return Path.home() / ".cache" / "thoth"


def _atomic_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_name = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
            temp_name = handle.name
            handle.write(data)
        os.replace(temp_name, path)
    finally:
        if temp_name and Path(temp_name).exists():
            Path(temp_name).unlink()


def load_lightcurve(star_id: str) -> dict:
    """Load a complete real I-band curve, preferring bundled and cached data.

    The network is contacted only for an OGLE star without bundled/cached
    observations. GCVS contains summary measurements, not time-series data.
    """
    row = get_star(star_id)
    if row is None:
        raise CatalogError(f"Unknown catalog identifier: {star_id}")
    url = row.get("lightcurve_url")
    if not url:
        raise CatalogError(f"No time-series archive is linked for {row['name']}; import measured photometry to analyze it")
    bundled = catalog_manifest().get("bundled_lightcurves", {}).get(row["id"])
    if bundled:
        text = files("thoth").joinpath("data", "lightcurves", bundled["file"]).read_text(encoding="utf-8")
        location = "bundled"
    else:
        # Cache keys are hashes of trusted source URLs, never user-supplied IDs.
        cache_path = _cache_directory() / (hashlib.sha256(url.encode()).hexdigest() + ".dat")
        if cache_path.exists():
            text = cache_path.read_text(encoding="utf-8")
            location = "cache"
        else:
            text = _download_text(url)
            parse_photometry(text)  # validate before saving a cache entry
            try:
                _atomic_bytes(cache_path, text.encode("utf-8"))
            except OSError as exc:
                raise CatalogError(f"Could not cache downloaded photometry: {exc}") from exc
            location = "download"
    observations = parse_photometry(text)
    return {"star_id": row["id"], "observations": observations, "source_url": url,
            "time_system": "HJD", "band": "I", "data_source": location}


def refresh_catalog(data_dir: str | Path | None = None) -> dict:
    """Retrieve complete upstream tables and regenerate an auditable snapshot.

    Pass a writable directory when installed in a read-only environment. All
    downloads and validation complete before the existing snapshot is replaced.
    """
    target = Path(data_dir) if data_dir is not None else Path(__file__).parent / "data"
    records = []
    sources = []
    retrieved_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    for region, spec in OGLE_SOURCES.items():
        parameter_url, ident_url = spec["base"] + "Miras.dat", spec["base"] + "ident.dat"
        parameters, identifiers = _download_text(parameter_url), _download_text(ident_url)
        normalized = normalize_ogle(parameters, identifiers, region)
        if len(normalized) < spec["minimum_rows"]:
            raise CatalogError(f"Refusing an unexpectedly small {region} catalog ({len(normalized)} rows)")
        records.extend(normalized)
        sources.append({"catalog": spec["catalog"], "region": spec["region"],
                        "url": spec["base"], "parameter_url": parameter_url,
                        "identifier_url": ident_url, "retrieved_utc": retrieved_at,
                        "upstream_mira_rows": len(normalized),
                        "upstream_identifier_rows": len(identifiers.splitlines()),
                        "parameters_sha256": hashlib.sha256(parameters.encode()).hexdigest(),
                        "identifiers_sha256": hashlib.sha256(identifiers.encode()).hexdigest(),
                        "reference": spec["reference"]})
    gcvs_tsv = _download_text(GCVS_QUERY_URL)
    gcvs = normalize_gcvs(gcvs_tsv)
    if len(gcvs) < 7500:
        raise CatalogError(f"Refusing an unexpectedly small GCVS catalog ({len(gcvs)} rows)")
    records.extend(gcvs)
    sources.append({"catalog": "GCVS", "url": GCVS_SOURCE_URL,
                    "query_url": GCVS_QUERY_URL, "selection": "VarType exactly M",
                    "retrieved_utc": retrieved_at, "upstream_mira_rows": len(gcvs),
                    "response_sha256": hashlib.sha256(gcvs_tsv.encode()).hexdigest(),
                    "reference": "Samus et al. 2017, Astronomy Reports 61, 80; 2017ARep...61...80S",
                    "upstream_table_label": "GCVS 5.1, version Oct, 2020 (VizieR table label; service has subsequent updates)"})
    if len({row["id"] for row in records}) != len(records):
        raise CatalogError("Catalog identifiers are not unique")
    by_id = {row["id"]: row for row in records}
    examples, example_texts = {}, {}
    for star_id in BUNDLED_EXAMPLES:
        url = by_id[star_id]["lightcurve_url"]
        text = _download_text(url)
        observations = parse_photometry(text)
        filename = star_id + ".dat"
        example_texts[filename] = text
        examples[star_id] = {"file": filename, "source_url": url,
                             "retrieved_utc": retrieved_at,
                             "observations": len(observations), "band": "I",
                             "time_system": "HJD", "raw_time_offset_days": 2450000,
                             "sha256": hashlib.sha256(text.encode()).hexdigest()}
    payload = "\n".join(json.dumps(row, separators=(",", ":"), ensure_ascii=False, allow_nan=False) for row in records) + "\n"
    compressed = gzip.compress(payload.encode("utf-8"), mtime=0)
    manifest = {
        "schema_version": 1, "retrieved_utc": retrieved_at,
        "catalog_entries": len(records), "counts_by_catalog": {source["catalog"]: source["upstream_mira_rows"] for source in sources},
        "snapshot_sha256": hashlib.sha256(compressed).hexdigest(),
        "coordinate_system": "J2000", "sources": sources,
        "bundled_lightcurves": examples,
        "coverage": "Complete Mira tables from the four listed OGLE releases plus the unlimited exact-M GCVS query. This is not every known Mira in all surveys.",
        "identity": "Entries from different catalogs are kept distinct; their sky overlap means entry counts are not unique-star counts.",
        "missing_data": "Unavailable numbers remain null. GCVS maxima/minima are not intensity means; no distance, mass, radius or luminosity is inferred.",
        "photometry": "OGLE I-band archive observations; raw HJD-2450000 is converted to full HJD. Light curves beyond the two bundled examples download on demand.",
    }
    for filename, text in example_texts.items():
        _atomic_bytes(target / "lightcurves" / filename, text.encode("utf-8"))
    _atomic_bytes(target / "catalog.jsonl.gz", compressed)
    _atomic_bytes(target / "manifest.json", (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))
    _catalog.cache_clear()
    _star_index.cache_clear()
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Refresh THOTH's complete source-backed Mira snapshot")
    parser.add_argument("--output", type=Path, help="Writable output data directory (default: package data)")
    args = parser.parse_args()
    manifest = refresh_catalog(args.output)
    print(json.dumps({"catalog_entries": manifest["catalog_entries"],
                      "counts_by_catalog": manifest["counts_by_catalog"],
                      "retrieved_utc": manifest["retrieved_utc"]}, indent=2))


if __name__ == "__main__":
    main()
