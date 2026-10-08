"""Acquire auditable Gaia candidates; identity and distance stay conditional."""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
import math
from pathlib import Path
import re
import uuid

import httpx

from .catalog import get_star
from .datasets import workspace_directory

ESA_TAP = "https://gea.esac.esa.int/tap-server/tap/sync"
CDS_TAP = "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync"
BUNDLED = Path(__file__).parent / "data" / "astrometry.json"
NUMERIC_FIELDS = ("ra", "dec", "parallax", "parallax_error", "pmra", "pmdec", "ruwe", "phot_g_mean_mag")


def separation_arcsec(ra1: float, dec1: float, ra2: float, dec2: float) -> float:
    a1, d1, a2, d2 = map(math.radians, (ra1, dec1, ra2, dec2))
    hav = math.sin((d2-d1)/2)**2 + math.cos(d1)*math.cos(d2)*math.sin((a2-a1)/2)**2
    return math.degrees(2*math.asin(math.sqrt(min(1.0, max(0.0, hav))))) * 3600


def _key(star_id: str, radius: float) -> str:
    return hashlib.sha256(f"Gaia-DR3:{star_id}:{radius:.6f}".encode()).hexdigest()


def _cache_path(star_id: str, radius: float) -> Path:
    return workspace_directory() / "astrometry" / f"{_key(star_id, radius)}.json"


def _write_cache(record: dict) -> None:
    path = _cache_path(record["star_id"], record["cone_radius_arcsec"])
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.stem}.{uuid.uuid4().hex}.tmp")
    try:
        temporary.write_text(json.dumps(record, indent=2, allow_nan=False), encoding="utf-8")
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def _validate_record(record: dict, star_id: str | None = None, radius: float | None = None,
                     star: dict | None = None) -> dict:
    """Keep corrupt or mismatched local cache rows out of scientific results."""
    try:
        if not isinstance(record, dict) or not isinstance(record["star_id"], str):
            raise ValueError("Invalid astrometry cache identity.")
        if not isinstance(record["name"], str) or not record["name"] or record["gaia_reference_epoch_jyear"] != 2016.0:
            raise ValueError("Invalid astrometry name or Gaia reference epoch.")
        if not all(isinstance(record[field], str) and record[field] for field in
                   ("source_url", "adql_query", "retrieved_utc", "response_sha256", "archive")):
            raise ValueError("Missing archive receipt fields.")
        if not isinstance(record["caveats"], list) or not all(isinstance(value, str) for value in record["caveats"]):
            raise ValueError("Invalid acquisition caveats.")
        if star_id is not None and record["star_id"] != star_id:
            raise ValueError("Astrometry cache belongs to a different catalog entry.")
        recorded_radius = float(record["cone_radius_arcsec"])
        if not math.isfinite(recorded_radius) or not 1 <= recorded_radius <= 30:
            raise ValueError("Invalid astrometry cone radius.")
        if radius is not None and recorded_radius != radius:
            raise ValueError("Astrometry cache uses a different acquisition cone.")
        ra, dec = float(record["catalog_ra_deg"]), float(record["catalog_dec_deg"])
        if not math.isfinite(ra) or not math.isfinite(dec) or not 0 <= ra < 360 or not -90 <= dec <= 90:
            raise ValueError("Invalid cached catalog coordinates.")
        if star is not None and (abs(ra - float(star["ra_deg"])) > 1e-9 or
                                 abs(dec - float(star["dec_deg"])) > 1e-9):
            raise ValueError("Catalog coordinates changed since this evidence was acquired.")
        if not isinstance(record["candidates"], list) or len(record["candidates"]) != record["candidate_count"]:
            raise ValueError("Invalid astrometry candidate inventory.")
        if len(record["candidates"]) > 21:
            raise ValueError("Astrometry inventory exceeds the acquisition query limit.")
        if not re.fullmatch(r"[0-9a-f]{64}", record["response_sha256"]):
            raise ValueError("Invalid archive response receipt.")
        if record["association_status"] != "unconfirmed_position_candidates":
            raise ValueError("Cache cannot promote candidate identities to confirmed stars.")
        if record["source_url"] not in {ESA_TAP, CDS_TAP} or not record["adql_query"] or not record["retrieved_utc"]:
            raise ValueError("Missing archive provenance.")
        seen = set()
        for candidate in record["candidates"]:
            identifier = candidate["source_id"]
            if not isinstance(identifier, str) or not re.fullmatch(r"[0-9]{1,20}", identifier) or identifier in seen:
                raise ValueError("Invalid or repeated Gaia source identifier.")
            seen.add(identifier)
            for field in NUMERIC_FIELDS:
                value = candidate[field]
                if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value)):
                    raise ValueError("Non-finite or invalid cached astrometry.")
            if candidate["ra"] is None or candidate["dec"] is None or not 0 <= candidate["ra"] < 360 or not -90 <= candidate["dec"] <= 90:
                raise ValueError("Invalid cached Gaia coordinates.")
            separation = separation_arcsec(ra, dec, candidate["ra"], candidate["dec"])
            if separation > recorded_radius + 0.001 or not math.isfinite(candidate["separation_arcsec"]) or abs(separation - candidate["separation_arcsec"]) > 0.001:
                raise ValueError("Gaia candidate does not match its acquisition cone.")
            usable = candidate["parallax"] is not None and candidate["parallax_error"] is not None and candidate["parallax_error"] > 0
            if candidate["distance_usable"] is not usable or not isinstance(candidate["quality_flags"], list) or not all(isinstance(flag, str) for flag in candidate["quality_flags"]):
                raise ValueError("Invalid cached distance usability or quality flags.")
        return record
    except (KeyError, TypeError, OverflowError) as error:
        raise ValueError("Malformed astrometry cache record.") from error


def cached_evidence(star_id: str, radius_arcsec: float = 3.0) -> dict | None:
    star = get_star(star_id)
    path = _cache_path(star_id, radius_arcsec)
    if path.exists():
        try:
            return _validate_record(json.loads(path.read_text(encoding="utf-8")), star_id, radius_arcsec, star)
        except (OSError, ValueError):
            pass
    if BUNDLED.exists():
        snapshot = json.loads(BUNDLED.read_text(encoding="utf-8"))
        for record in snapshot.get("items", []):
            if record["star_id"] == star_id and record["cone_radius_arcsec"] == radius_arcsec:
                return _validate_record(record, star_id, radius_arcsec, star)
    return None


def _query(star: dict, radius: float, mirror: bool = False) -> str:
    table = '"I/355/gaiadr3"' if mirror else "gaiadr3.gaia_source"
    columns = ("Source AS source_id,RA_ICRS AS ra,DE_ICRS AS dec,Plx AS parallax,e_Plx AS parallax_error,"
               "pmRA AS pmra,pmDE AS pmdec,RUWE AS ruwe,Gmag AS phot_g_mean_mag"
               if mirror else "source_id,ra,dec,parallax,parallax_error,pmra,pmdec,ruwe,phot_g_mean_mag")
    ra_name, dec_name = ("RA_ICRS", "DE_ICRS") if mirror else ("ra", "dec")
    separation = (f"DISTANCE(POINT('ICRS',{ra_name},{dec_name}),"
                  f"POINT('ICRS',{float(star['ra_deg']):.12f},{float(star['dec_deg']):.12f}))")
    # Every interpolated value is validated numeric input, never SQL text from a name.
    return (f"SELECT TOP 21 {columns},{separation} AS angular_distance FROM {table} WHERE "
            f"1=CONTAINS(POINT('ICRS',{ra_name},{dec_name}),"
            f"CIRCLE('ICRS',{float(star['ra_deg']):.12f},{float(star['dec_deg']):.12f},{radius/3600:.12f})) "
            "ORDER BY angular_distance")


def parse_candidates(text: str, star: dict) -> list[dict]:
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or not {"source_id", "ra", "dec", "parallax", "parallax_error"}.issubset(reader.fieldnames):
        raise ValueError("Gaia archive response did not contain the requested astrometry columns.")
    candidates = []
    seen = set()
    for row in reader:
        source_id = str(row.get("source_id", "")).strip()
        if not re.fullmatch(r"[0-9]{1,20}", source_id) or source_id in seen:
            raise ValueError("The archive returned an invalid Gaia source identifier.")
        seen.add(source_id)
        candidate: dict = {"source_id": source_id}
        for field in NUMERIC_FIELDS:
            value = row.get(field, "")
            candidate[field] = float(value) if value not in {None, "", "null"} else None
            if candidate[field] is not None and not math.isfinite(candidate[field]):
                raise ValueError("The archive returned non-finite astrometry.")
        if candidate["ra"] is None or candidate["dec"] is None or not 0 <= candidate["ra"] < 360 or not -90 <= candidate["dec"] <= 90:
            raise ValueError("The archive returned invalid source coordinates.")
        candidate["separation_arcsec"] = separation_arcsec(star["ra_deg"], star["dec_deg"], candidate["ra"], candidate["dec"])
        candidate["distance_usable"] = candidate["parallax"] is not None and candidate["parallax_error"] is not None and candidate["parallax_error"] > 0
        candidate["quality_flags"] = []
        if candidate["ruwe"] is None or candidate["ruwe"] > 1.4:
            candidate["quality_flags"].append("Missing or elevated RUWE; the single-source astrometric fit may be unreliable.")
        if candidate["distance_usable"] and abs(candidate["parallax"] / candidate["parallax_error"]) < 5:
            candidate["quality_flags"].append("Low parallax signal-to-noise; distance inference is sensitive to its prior.")
        if candidate["parallax"] is not None and candidate["parallax"] <= 0:
            candidate["quality_flags"].append("Nonpositive measured parallax; reciprocal parallax is not a physical distance estimate.")
        candidates.append(candidate)
    return sorted(candidates, key=lambda candidate: candidate["separation_arcsec"])


def acquire_evidence(star: dict, radius_arcsec: float = 3.0, *, refresh: bool = False) -> dict:
    radius = float(radius_arcsec)
    if not math.isfinite(radius) or not 1 <= radius <= 30:
        raise ValueError("Gaia cone radius must be between 1 and 30 arcseconds.")
    if any(star.get(key) is None or not math.isfinite(float(star[key])) for key in ("ra_deg", "dec_deg")):
        raise ValueError("This record has no usable celestial coordinates for an archive search.")
    if not 0 <= float(star["ra_deg"]) < 360 or not -90 <= float(star["dec_deg"]) <= 90:
        raise ValueError("Catalog coordinates fall outside the celestial frame.")
    if not refresh:
        cached = cached_evidence(star["id"], radius)
        if cached is not None:
            try:
                return _validate_record(cached, star["id"], radius, star)
            except ValueError:
                pass
    failures = []
    for mirror, endpoint in ((False, ESA_TAP), (True, CDS_TAP)):
        query = _query(star, radius, mirror)
        try:
            response = httpx.get(endpoint, params={"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "QUERY": query}, timeout=20)
            response.raise_for_status()
            candidates = parse_candidates(response.text, star)
            record = {"star_id": star["id"], "name": star["name"], "catalog_ra_deg": star["ra_deg"],
                "catalog_dec_deg": star["dec_deg"], "cone_radius_arcsec": radius,
                "candidates": candidates, "candidate_count": len(candidates),
                "query_limit_reached": len(candidates) >= 21, "association_status": "unconfirmed_position_candidates",
                "archive": "Gaia DR3 / CDS mirror" if mirror else "ESA Gaia DR3", "source_url": endpoint,
                "adql_query": query, "response_sha256": hashlib.sha256(response.content).hexdigest(),
                "retrieved_utc": datetime.now(timezone.utc).isoformat(), "gaia_reference_epoch_jyear": 2016.0,
                "caveats": [
                    "Nearby sources are candidate associations, not confirmed identities; a closest angular match is not proof.",
                    "Catalog J2000 specifies the coordinate frame/equinox. A common source position epoch is not established; proper motion is retained but not silently applied.",
                    "Gaia zero-point correction, astrometric covariances, binary photocenter motion and Mira variability systematics are not modeled.",
                    "Distance posteriors use an explicitly chosen prior and reported parallax error; they are conditional estimates, not directly measured distances.",
                    "A source cone reaching its 21-row limit is incomplete; use a narrower cone or external cross-matching before selecting an identity.",
                ]}
            _validate_record(record, star["id"], radius, star)
            _write_cache(record)
            return record
        except (httpx.HTTPError, ValueError) as error:
            failures.append(str(error))
    raise RuntimeError("Gaia evidence could not be acquired from ESA or its CDS mirror. Cached data remain available.")


def spatial_candidates(prior_length_pc: float = 1350, max_records: int = 500) -> dict:
    from .research import _native_engine
    native = _native_engine()
    if isinstance(max_records, bool) or not isinstance(max_records, int) or not 1 <= max_records <= 5000:
        raise ValueError("The acquisition record limit must be an integer between 1 and 5000.")
    records: dict[str, dict] = {}
    rejected = 0
    if BUNDLED.exists():
        for record in json.loads(BUNDLED.read_text(encoding="utf-8")).get("items", []):
            _validate_record(record, star=get_star(record["star_id"]))
            records[_key(record["star_id"], record["cone_radius_arcsec"])] = record
    directory = workspace_directory() / "astrometry"
    if directory.exists():
        for path in sorted(directory.glob("*.json"))[:max_records]:
            try:
                record = _validate_record(json.loads(path.read_text(encoding="utf-8")))
                _validate_record(record, star=get_star(record["star_id"]))
                records[_key(record["star_id"], record["cone_radius_arcsec"])] = record
            except (ValueError, OSError):
                rejected += 1
    items = []
    skipped_candidates = []
    seen = set()
    for record in list(records.values())[:max_records]:
        for candidate in record["candidates"]:
            if not candidate["distance_usable"] or (record["star_id"], candidate["source_id"]) in seen:
                continue
            seen.add((record["star_id"], candidate["source_id"]))
            try:
                posterior = native.distance_posterior(candidate["parallax"], candidate["parallax_error"], prior_length_pc, 1024, 20000)
            except ValueError as error:
                skipped_candidates.append({"star_id": record["star_id"], "source_id": candidate["source_id"], "reason": str(error)})
                continue
            a, d = math.radians(candidate["ra"]), math.radians(candidate["dec"])
            direction = [math.cos(d)*math.cos(a), math.sin(d), -math.cos(d)*math.sin(a)]
            items.append({"star_id": record["star_id"], "source_id": candidate["source_id"],
                "name": record["name"], "direction": direction,
                "position_pc": [coordinate*posterior["median_pc"] for coordinate in direction],
                "distance_median_pc": posterior["median_pc"], "distance_p16_pc": posterior["p16_pc"],
                "distance_p84_pc": posterior["p84_pc"], "parallax_mas": candidate["parallax"],
                "parallax_error_mas": candidate["parallax_error"], "quality_flags": candidate["quality_flags"],
                "separation_arcsec": candidate["separation_arcsec"], "association_status": record["association_status"],
                "source_url": record["source_url"], "response_sha256": record["response_sha256"],
                "retrieved_utc": record["retrieved_utc"], "cone_radius_arcsec": record["cone_radius_arcsec"],
                "gaia_reference_epoch_jyear": record["gaia_reference_epoch_jyear"],
                "posterior_upper_bound_pc": posterior["upper_bound_pc"],
                "prior_length_pc": posterior["prior_length_pc"]})
    return {"items": items, "total": len(items), "prior_length_pc": prior_length_pc,
            "rejected_cache_records": rejected, "record_limit": max_records,
            "skipped_candidates": skipped_candidates,
            "geometry": "Heliocentric Cartesian parsecs from Gaia-candidate posterior medians; Y-up view",
            "caveats": ["Candidate associations are unconfirmed and do not locate every catalog entry in physical space.",
                        "Radial intervals are conditional on the EDSD distance prior; catalog overlap is not deduplicated.",
                        "The integration is bounded at 20,000 pc; this generic disk prior is unsuitable for treating weak Magellanic Cloud parallaxes as reliable galaxy distances.",
                        "At most 500 acquisition records are shown; corrupt or stale local caches are excluded and counted."]}


def main() -> None:
    parser = argparse.ArgumentParser(description="Acquire Gaia DR3 position candidates with an auditable query receipt")
    parser.add_argument("--star", action="append", required=True)
    parser.add_argument("--radius-arcsec", type=float, default=3)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    records = []
    for name in args.star:
        star = get_star(name)
        if star is None:
            parser.error(f"Unknown catalog star: {name}")
        records.append(acquire_evidence(star, args.radius_arcsec))
    snapshot = {"release": "Gaia DR3", "items": records}
    if args.output:
        from .cli import write_json
        write_json(args.output, snapshot)
    else:
        print(json.dumps(snapshot, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
