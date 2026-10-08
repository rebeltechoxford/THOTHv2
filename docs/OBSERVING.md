# Observing directions and telescope tracking

THOTH converts a selected catalog star into **azimuth and altitude at an
observer's location and UTC time**. Azimuth is measured clockwise from north:
0° north, 90° east, 180° south, 270° west. Altitude, also called elevation angle,
is 0° on the local horizontal plane and 90° at the zenith. The observer's
`elevation_m` is a different quantity: their WGS84 geodetic height in meters.
Longitude is positive east and negative west.

The University, Mississippi preset is an **approximate campus location**:
latitude 34.365°, longitude −89.538°, height 152.4 m (approximately 500 ft).
Use the actual telescope site's coordinates and geodetic height for a mount.
The preset uses the approximate [38677 postal-area coordinates](https://www.unitedstateszipcodes.org/38677/)
and [Ole Miss's stated 500-foot campus elevation](https://catalog.olemiss.edu/2027/fall/university/buildings).
This elevation estimate is not a surveyed WGS84 ellipsoid height; the
mean-sea-level/ellipsoid distinction remains part of its uncertainty.
Phone geolocation can supply latitude and longitude, but its reported accuracy
and altitude must be reviewed; an approximate campus preset is not a surveyed
observatory or a mount alignment.

## Coordinate calculation

Catalog positions are explicitly equinox J2000. THOTH treats them as a fixed
`FK5(equinox=J2000)` direction, then uses Astropy/ERFA to transform to
`AltAz(obstime=UTC, location=WGS84, pressure=0 hPa)`. This includes precession,
nutation, aberration and the Earth-orientation information available in the
installed IERS table. It does not add unmeasured stellar proper motion or a
stellar distance. Equinox and observation epoch are different concepts:
decades of proper motion can matter for precise pointing, especially when
source positions or target identification are uncertain.

Pressure is deliberately zero, producing **geometrical altitude without
atmospheric refraction**. A local terrain/building horizon, extinction,
weather, horizon dip, polar alignment and a mount's pointing model are also
outside this direction calculation. Azimuth is undefined exactly at the
zenith/nadir, and becomes numerically sensitive nearby. Such exact points have
`azimuth_defined=false` and `azimuth_deg=null` rather than an invented bearing.

The independent spherical relation used in the verification tests is

```
sin(altitude) = sin(latitude) sin(declination)
              + cos(latitude) cos(declination) cos(hour angle)

east  = −cos(declination) sin(hour angle)
north =  sin(declination) cos(latitude)
       −cos(declination) sin(latitude) cos(hour angle)
azimuth = atan2(east, north), wrapped to [0°, 360°)
```

The full Astropy result includes polar motion that this spherical equation
omits. Tests compare the two within one arcsecond and also check north/east/
south/west conventions, offset-aware time normalization and a historical
Astropy/ERFA coordinate fixture.

## Apparent equatorial coordinates for mount adapters

The response retains catalog `ra_j2000_hours` and `dec_j2000_deg`. It also
provides `ra_topocentric_hours` and `dec_topocentric_deg`, transformed to
**topocentric TETE: true equator and true equinox of the requested date**.
These are apparent equatorial coordinates. Local *apparent* sidereal time is
used with TETE to calculate the west-positive hour angle:

```
hour_angle_hours = wrap_to_[−12,+12)(lst_hours − ra_topocentric_hours)
```

An adapter must use the coordinate system advertised by its telescope driver.
J2000 coordinates and apparent coordinates cannot be exchanged casually.
THOTH's observation calculation does not itself connect, slew, track, guide,
park, unpark or synchronize a telescope.

## Offline Earth orientation and accuracy receipts

Each calculation reads the **bundled `finals2000A` IERS-A/B table** provided by
the installed `astropy-iers-data` package. Network downloads and downloaded
IERS caches are not used during a request. The response records:

- The table package version and first/last supported UTC dates.
- Whether the current direction uses definitive, rapid, predicted or degraded
  Earth-orientation values.
- The different status values occurring across the sampled trajectory.
- Any Astropy/ERFA warnings and whether current Earth orientation is usable
  for a mount command.

Rapid and predicted Earth orientation is a documented input rather than a new
measurement. For dates beyond the bundled table, Astropy uses the nearest
UT1 value and default polar motion. THOTH permits this only as **explicitly
degraded approximate planning**: `mount_ready=false` and
`tracking_allowed=false`. No physical tracking request may use such a point.
Far-future UTC also has uncertain future leap seconds; its captured ERFA
warning is included in the receipt.

Updating the dependency updates the packaged Earth-orientation data:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade astropy-iers-data
```

Restart the running server after updating so it reloads the table. Updates are
an explicit maintenance action; telescope control never silently downloads a
different Earth-rotation model during a command.

## Visibility trajectory and planning gates

A trajectory starts at the requested instant and includes the endpoint. The
default is 49 samples over 12 hours. Each point includes altitude, azimuth,
Sun altitude, angular Sun separation, horizon flags, Earth-orientation
availability and the reasons tracking is unavailable. Sun positions use
Astropy's `get_sun`, the ERFA approximation to VSOP2000.

For each sampled point, the observation planning gate requires all of:

1. Target altitude at or above the configured minimum (default 20°).
2. Target at least 30° from the Sun.
3. Sun altitude strictly below −6°.
4. Earth orientation within the installed bundled table's coverage.

These are conservative application defaults for ordinary stellar observing,
not a physical safety certification. A sampled trajectory does not prove a
continuous clear slew path or detect obstacles between samples. Local terrain,
cables, pier clearance, mount limits, alignment and weather require the mount
operator and telescope system. Driver state and the current UTC direction
must be checked again when a motion command is issued and while tracking.
`tracking_allowed` is a calculated planning gate, not an automatic command.

## Python interface

```python
from thoth.catalog import get_star
from thoth.observing import observing_target

result = observing_target(
    get_star("GCVS:omi Cet"),
    latitude_deg=34.365,
    longitude_deg=-89.538,
    elevation_m=152.4,
    when="2026-10-08T06:00:00Z",
    minimum_altitude_deg=20,
    duration_hours=12,
    samples=49,
)
print(result["azimuth_deg"], result["altitude_deg"])
print(result["earth_orientation"], result["reasons"])
```

`when=None` means current UTC on the server. Explicit inputs need an ISO 8601
UTC offset or a timezone-aware Python `datetime`; naive local timestamps are
rejected. UTC years 2000–2100 are supported for planning, with degraded
Earth-orientation flags as described above. The entire trajectory must remain
inside that interval. Validation also requires finite RA [0°,360°), declination
and latitude [−90°,90°], longitude [−180°,180°], observer height −500–10,000 m,
minimum altitude 0–85°, duration 0.5–24 h and 13–97 integer samples. Missing or
invalid catalog coordinates cause an error rather than an invented position.

## Primary references

- [Astropy AltAz: WGS84, azimuth convention and zero-pressure refraction behavior](https://docs.astropy.org/en/stable/api/astropy.coordinates.AltAz.html).
- [Astropy TETE: apparent equatorial coordinates and apparent sidereal time](https://docs.astropy.org/en/stable/api/astropy.coordinates.TETE.html).
- [Astropy IERS: packaged Earth orientation, offline operation and degraded accuracy](https://docs.astropy.org/en/stable/utils/iers.html).
- [Astropy get_sun: ERFA/VSOP2000 solar ephemeris](https://docs.astropy.org/en/stable/api/astropy.coordinates.get_sun.html).
