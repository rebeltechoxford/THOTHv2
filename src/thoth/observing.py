"""Offline, auditable observing directions for a fixed J2000 catalog position.

Astropy/ERFA supplies the Earth and celestial frame transformations.  The
bundled Earth-orientation table is never silently replaced over the network.
An out-of-table date is useful for approximate planning, but cannot authorize
a telescope command.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from functools import lru_cache
from importlib.metadata import version
import math
import threading
import warnings

import astropy
import astropy.units as u
from astropy.coordinates import AltAz, EarthLocation, FK5, SkyCoord, TETE, get_sun
from astropy.time import Time
from astropy.utils import iers
import numpy as np


_TRANSFORM_LOCK = threading.RLock()
SUN_EXCLUSION_DEG = 30.0
NIGHTTIME_SUN_ALTITUDE_DEG = -6.0


def _finite(value, name: str, minimum: float, maximum: float, *, upper_open=False) -> float:
    if isinstance(value, bool):
        raise ValueError(f"{name} must be a finite number.")
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError) as error:
        raise ValueError(f"{name} must be a finite number.") from error
    in_range = minimum <= number < maximum if upper_open else minimum <= number <= maximum
    if not math.isfinite(number) or not in_range:
        endpoint = "less than" if upper_open else "at most"
        raise ValueError(f"{name} must be at least {minimum} and {endpoint} {maximum}.")
    return number


def _utc_time(when: str | datetime | None) -> datetime:
    if when is None:
        result = datetime.now(timezone.utc)
    elif isinstance(when, datetime):
        result = when
    elif isinstance(when, str) and 1 <= len(when) <= 64:
        try:
            result = datetime.fromisoformat(when[:-1] + "+00:00" if when.endswith("Z") else when)
        except ValueError as error:
            raise ValueError("when must be an ISO 8601 timestamp with an explicit UTC offset.") from error
    else:
        raise ValueError("when must be an ISO 8601 timestamp or timezone-aware datetime.")
    if result.tzinfo is None or result.utcoffset() is None:
        raise ValueError("when needs an explicit UTC offset; naive local times are ambiguous.")
    result = result.astimezone(timezone.utc)
    if not 2000 <= result.year <= 2100:
        raise ValueError("Observing calculations support UTC years 2000 through 2100.")
    return result


def _iso(when: datetime) -> str:
    return when.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


@lru_cache(maxsize=1)
def _bundled_table():
    # Opening this exact packaged file avoids downloaded caches and automatic
    # prediction-age refresh.  A receipt identifies the package used instead.
    return iers.IERS_A.open(iers.IERS_A_FILE)


def _status_name(status: int) -> str:
    if status == iers.FROM_IERS_B:
        return "definitive"
    if status == iers.FROM_IERS_A:
        return "rapid"
    if status == iers.FROM_IERS_A_PREDICTION:
        return "predicted"
    return "degraded"


def _gate(altitude: float, sun_altitude: float, sun_separation: float,
          minimum_altitude: float, mount_ready: bool) -> dict:
    reasons = []
    if altitude < minimum_altitude:
        reasons.append("Target is below the configured minimum altitude.")
    if sun_separation < SUN_EXCLUSION_DEG:
        reasons.append("Target is inside the 30 degree Sun exclusion zone.")
    if sun_altitude >= NIGHTTIME_SUN_ALTITUDE_DEG:
        reasons.append("The Sun must be below -6 degrees for tracking.")
    if not mount_ready:
        reasons.append("Earth orientation is outside bundled coverage; this is approximate planning only.")
    return {"above_horizon": altitude >= 0.0,
            "above_minimum_altitude": altitude >= minimum_altitude,
            "nighttime": sun_altitude < NIGHTTIME_SUN_ALTITUDE_DEG,
            "mount_ready": mount_ready, "tracking_allowed": not reasons,
            "reasons": reasons}


def observing_target(star: dict, latitude_deg: float, longitude_deg: float,
                     elevation_m: float = 0, when: str | datetime | None = None,
                     minimum_altitude_deg: float = 20, duration_hours: float = 12,
                     samples: int = 49) -> dict:
    """Return horizontal coordinates, apparent equatorial coordinates and a path.

    Longitude is positive east; azimuth is north=0, east=90.  Altitude is
    geometrical (pressure=0), relative to the WGS84 local horizontal plane.
    The trajectory starts at ``when`` and includes its requested endpoint.
    No source proper motion, distance, atmospheric refraction or mount model
    is inferred. ``tracking_allowed`` is a planning gate, not a motion command.
    """
    if not isinstance(star, dict) or not isinstance(star.get("id"), str) or not star["id"]:
        raise ValueError("A catalog star with a nonempty identifier is required.")
    if star.get("coordinate_system", "J2000") != "J2000":
        raise ValueError("The observing target needs catalog equinox J2000 coordinates.")
    ra = _finite(star.get("ra_deg"), "Catalog J2000 right ascension", 0, 360, upper_open=True)
    dec = _finite(star.get("dec_deg"), "Catalog J2000 declination", -90, 90)
    latitude = _finite(latitude_deg, "latitude_deg", -90, 90)
    longitude = _finite(longitude_deg, "longitude_deg", -180, 180)
    elevation = _finite(elevation_m, "elevation_m", -500, 10_000)
    minimum_altitude = _finite(minimum_altitude_deg, "minimum_altitude_deg", 0, 85)
    duration = _finite(duration_hours, "duration_hours", 0.5, 24)
    if isinstance(samples, bool) or not isinstance(samples, int) or not 13 <= samples <= 97:
        raise ValueError("samples must be an integer between 13 and 97.")
    start = _utc_time(when)
    finish = start + timedelta(hours=duration)
    if finish.year > 2100:
        raise ValueError("The complete trajectory must lie in UTC years 2000 through 2100.")
    dates = [start + timedelta(hours=duration * index / (samples - 1)) for index in range(samples)]
    location = EarthLocation.from_geodetic(lon=longitude * u.deg, lat=latitude * u.deg,
                                          height=elevation * u.m, ellipsoid="WGS84")
    target = SkyCoord(ra=ra * u.deg, dec=dec * u.deg, frame=FK5(equinox=Time("J2000")))
    table = _bundled_table()
    # Astropy's configuration and science-state context are process-wide.  The
    # lock keeps simultaneous THOTH observing calculations in one consistent
    # table/configuration, including their recorded warning receipts.
    with _TRANSFORM_LOCK, iers.conf.set_temp("auto_download", False), \
            iers.conf.set_temp("iers_degraded_accuracy", "warn"), \
            iers.earth_orientation_table.set(table), warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        times = Time(dates, scale="utc")
        delta_ut1, ut1_status = table.ut1_utc(times, return_status=True)
        _, _, polar_status = table.pm_xy(times, return_status=True)
        # IERS tables return the nearest UT1 value outside coverage.  Providing
        # it explicitly permits approximate planning without an online fetch.
        # Such points are always marked degraded and blocked for motor control.
        times.delta_ut1_utc = delta_ut1.to_value(u.s)
        frame = AltAz(obstime=times, location=location, pressure=0 * u.hPa)
        horizontal = target.transform_to(frame)
        sun_horizontal = get_sun(times).transform_to(frame)
        sun_separations = horizontal.separation(sun_horizontal).to_value(u.deg)
        current = times[0]
        apparent = target.transform_to(TETE(obstime=current, location=location))
        sidereal_hours = float(current.sidereal_time("apparent", longitude=location.lon).to_value(u.hourangle)) % 24
        apparent_ra = float(apparent.ra.to_value(u.hourangle)) % 24
        apparent_dec = float(apparent.dec.to_value(u.deg))
        captured = list(dict.fromkeys(str(item.message) for item in caught))

    trajectory = []
    for index, date in enumerate(dates):
        altitude = float(horizontal.alt[index].to_value(u.deg))
        azimuth = float(horizontal.az[index].to_value(u.deg)) % 360
        sun_altitude = float(sun_horizontal.alt[index].to_value(u.deg))
        sun_separation = float(sun_separations[index])
        mount_ready = int(ut1_status[index]) >= 0 and int(polar_status[index]) >= 0
        azimuth_defined = abs(90 - abs(altitude)) > 1e-7
        trajectory.append({"time_utc": _iso(date),
                           "azimuth_deg": azimuth if azimuth_defined else None,
                           "azimuth_defined": azimuth_defined,
                           "altitude_deg": altitude, "sun_altitude_deg": sun_altitude,
                           "sun_separation_deg": sun_separation,
                           **_gate(altitude, sun_altitude, sun_separation, minimum_altitude, mount_ready)})
    first = trajectory[0]
    statuses = [_status_name(int(a)) if int(b) >= 0 else "degraded"
                for a, b in zip(ut1_status, polar_status)]
    current_status = statuses[0]
    degraded = "degraded" in statuses
    table_start = Time(float(table["MJD"][0].to_value(u.day)), format="mjd", scale="utc")
    table_end = Time(float(table["MJD"][-1].to_value(u.day)), format="mjd", scale="utc")
    caveats = [
        "Catalog positions are treated as FK5 equinox J2000; their position epoch and proper motion are not supplied or inferred.",
        "Altitude is geometrical: no atmospheric refraction, local terrain, obstructions, extinction, or horizon dip is modeled.",
        "Earth orientation uses the installed bundled IERS table; rapid and predicted values differ from definitive measurements.",
        "Azimuth is undefined at the zenith/nadir and becomes unstable nearby; alt-az mount tracking also requires its own zenith-limit policy.",
        "Tracking eligibility is a planning gate, not proof of a safe physical slew path, mount alignment, cable clearance, pier clearance, or weather.",
        "The sampled trajectory cannot establish continuous clearance between samples or exact rise/set times.",
    ]
    if degraded:
        caveats.append("Dates outside bundled Earth-orientation coverage use nearest UT1/default polar motion for approximate planning; motor commands are prohibited for those points.")
    return {"star_id": star["id"], "star_name": str(star.get("name") or star["id"]),
            "location": {"latitude_deg": latitude, "longitude_deg": longitude,
                         "elevation_m": elevation, "datum": "WGS84", "longitude_convention": "east positive"},
            **first, "zenith_distance_deg": 90 - first["altitude_deg"],
            "hour_angle_hours": (sidereal_hours - apparent_ra + 12) % 24 - 12,
            "lst_hours": sidereal_hours, "ra_j2000_hours": ra / 15, "dec_j2000_deg": dec,
            "ra_topocentric_hours": apparent_ra, "dec_topocentric_deg": apparent_dec,
            "minimum_altitude_deg": minimum_altitude, "sun_exclusion_deg": SUN_EXCLUSION_DEG,
            "nighttime_sun_altitude_limit_deg": NIGHTTIME_SUN_ALTITUDE_DEG,
            "duration_hours": duration, "sample_interval_seconds": duration * 3600 / (samples - 1),
            "trajectory": trajectory,
            "summary": {"maximum_sampled_altitude_deg": max(point["altitude_deg"] for point in trajectory),
                        "tracking_allowed_samples": sum(point["tracking_allowed"] for point in trajectory),
                        "total_samples": samples},
            "earth_orientation": {"status": current_status, "trajectory_statuses": list(dict.fromkeys(statuses)),
                                  "mount_ready": first["mount_ready"], "degraded": degraded,
                                  "bundled_start_utc": _iso(table_start.to_datetime(timezone=timezone.utc)),
                                  "bundled_end_utc": _iso(table_end.to_datetime(timezone=timezone.utc)),
                                  "table_source": "bundled finals2000A IERS-A/B in astropy-iers-data",
                                  "package_version": version("astropy-iers-data"), "warnings": captured},
            "model": {"engine": "Astropy/ERFA", "astropy_version": astropy.__version__,
                      "input_frame": "FK5 equinox J2000, fixed catalog direction",
                      "horizontal_frame": "topocentric WGS84 AltAz, pressure=0 hPa",
                      "apparent_equatorial_frame": "topocentric TETE (true equator and true equinox of date)",
                      "sidereal_time": "local apparent sidereal time (IAU 2006A)",
                      "azimuth_convention": "north=0 degrees, east=90 degrees",
                      "sun_ephemeris": "Astropy get_sun, ERFA approximation to VSOP2000",
                      "network_downloads": False},
            "provenance": {"catalog_source_url": star.get("source_url") if isinstance(star.get("source_url"), str) else None,
                           "catalog": star.get("catalog") if isinstance(star.get("catalog"), str) else None,
                           "references": ["https://docs.astropy.org/en/stable/api/astropy.coordinates.AltAz.html",
                                          "https://docs.astropy.org/en/stable/api/astropy.coordinates.TETE.html",
                                          "https://docs.astropy.org/en/stable/utils/iers.html"]},
            "caveats": caveats}
