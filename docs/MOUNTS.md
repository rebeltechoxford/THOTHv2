# Telescope mount adapters

THOTH converts catalog coordinates to the observer's azimuth/elevation and prepares an explicit tracking plan. The default **software simulator** exercises connection, arming, asynchronous slewing, sidereal tracking, heartbeat, stop, and disconnect without moving hardware. Selecting a star or opening the app never connects a mount or starts motion.

## ASCOM / Alpaca setup

Configure the ASCOM Alpaca telescope server on the PC or controller connected to your mount. A traditional Windows ASCOM COM driver needs an Alpaca bridge such as ASCOM Remote; THOTH speaks Alpaca HTTP directly. No automatic network discovery occurs.

Set these variables in the terminal that launches THOTH:

```powershell
$env:THOTH_ALPACA_URL = 'http://YOUR-CONTROLLER:11111'
$env:THOTH_ALPACA_DEVICE = '0'
$env:THOTH_MOUNT_CONTROL_TOKEN = [Guid]::NewGuid().ToString('N')
.\scripts\start-lab.ps1
```

Replace the example origin and device number with your configured server. The URL must be an HTTP(S) origin without credentials, query, fragment, or path. It is configured only on the server; browser requests cannot supply a mount URL. Copy the generated control token from this terminal into THOTH's physical-mount control field. THOTH does not return the server token through its API. The front end keeps the entered token in memory and sends it as `X-THOTH-Mount-Token` for explicit physical control actions.

Use **Connect → acknowledge alignment → Arm → Prepare plan → Track**. A plan lasts 15 seconds and arming lasts 60 seconds. Preparing a plan only reads coordinates/status. Tracking consumes the plan once, verifies the target again at actual UTC, confirms sidereal rate, clears nonzero secular RA/Dec offsets where supported, enables tracking, then calls `SlewToCoordinatesAsync`. ASCOM equatorial slewing requires tracking to be enabled first. The mount then uses its own sidereal drive; THOTH does not send repeated slews or autoguiding pulses.

University, Mississippi is an approximate observing preset at **34.365° N, 89.538° W, 152.4 m**. Enter the actual telescope site. Before physical tracking, the driver site must agree within 0.01° latitude/longitude and 100 m elevation. THOTH reads the driver's site, UTC clock, coordinate system, and refraction setting; it does not change them, align, synchronize, unpark, or flip the mount.

## Coordinates and control constraints

The supported ASCOM coordinate systems are:

| EquatorialSystem | Supplied coordinates | Additional driver requirement |
| --- | --- | --- |
| 2 — J2000 | Catalog FK5 J2000 RA in hours and declination in degrees | `DoesRefraction=True` |
| 1 — Topocentric | Astropy TETE apparent topocentric RA/declination at actual UTC | `DoesRefraction=True` |

Other coordinate systems are blocked. `DoesRefraction=False` with topocentric coordinates means the driver expects observed, refracted coordinates; THOTH's geometric coordinates are unsuitable for that mode. The mount must report a valid `UTCDate` within **10 seconds** of THOTH's UTC clock. Correct site, clock, and coordinate settings in the mount driver before continuing. J2000 catalog directions are treated as fixed; proper motion and a physical distance are not invented.

Plans require target altitude at least **20°** (a higher user limit is honored), Sun separation at least **30°**, Sun altitude below **−6°**, and Earth orientation coverage valid for the current instant. A lower planning display horizon cannot lower the motor-control floor. `CanSetTracking` and `CanSlewAsync` must be true, and the mount must be connected and unparked. The driver must advertise sidereal tracking. A fixed sidereal-only driver need not implement a tracking-rate setter when it already reports rate 0.

One THOTH controller owns one tracking lease. The browser sends a heartbeat every 30 seconds while tracking. The lease expires after **120 seconds** without renewal; a server watchdog checks every five seconds and aborts the slew and disables tracking when the lease or observing constraints fail. Control deadlines use a monotonic clock, so a backwards system-clock adjustment cannot extend them. UTC is used for astronomical calculations and displayed receipts. A slow status/coordinate/rate check cannot carry an expired plan or arm into motion.

**Stop** attempts abort and tracking-off independently, then checks reported motion. Failed operations appear in `stop_errors` and `fault`; THOTH does not claim a confirmed stop when it cannot establish one. Failed or timed-out motion requests are never retried automatically because receipt of a physical command may be uncertain. Application shutdown attempts to stop its own active lease.

These checks assess the target direction and tracking state. They do not calculate the mechanical slew path or certify alignment, cable/pier clearance, weather, or the mount's meridian/zenith limits. Configure hard travel limits and the emergency stop in the mount controller. If the THOTH PC loses power or its network link fails, software cannot guarantee a physical stop; the mount's own limits remain necessary. There is no automatic park, unpark, synchronization, or meridian flip in this version.

## HTTP API

All physical mutations require `X-THOTH-Mount-Token`; simulator operations require no token. Status and plans are read-only. Connection to another adapter cannot bypass authentication or leave the current physical mount tracking: explicitly stop and disconnect it first.

| Request | Purpose |
| --- | --- |
| `GET /api/mounts` | Available/configured adapters; defaults to simulator |
| `GET /api/mounts/status` | Connection, tracking, slewing, park, capabilities, lease, target, faults |
| `POST /api/mounts/connect` `{adapter_id}` | Explicit connection |
| `POST /api/mounts/arm` `{aligned_ack:true}` | Acknowledge alignment and arm for 60 s |
| `POST /api/mounts/plan` `{star_id,latitude_deg,longitude_deg,elevation_m,minimum_altitude_deg}` | Fresh 15 s plan, pointing, frame, reasons |
| `POST /api/mounts/track` `{plan_id}` | Consume a plan and start sidereal tracking |
| `POST /api/mounts/heartbeat` `{}` | Extend an existing active lease |
| `POST /api/mounts/stop` `{}` | Abort slew and turn tracking off |
| `POST /api/mounts/disconnect` `{}` | Stop before disconnecting |

Mutation results use the status envelope. Plans return `plan_id`, `expires_at`, `allowed`, `reasons`, `target` (the observing report), `coordinate_system`, `target_ra_hours`, `target_dec_deg`, and the requested site/altitude limit. A blocked plan is a successful read with `allowed:false`; no motion occurs. Invalid requests return 422, unavailable authentication 403, stale/concurrent operations 409, missing stars 404, and protocol/device failures 502. Nonfinite numeric inputs are rejected.

## Installed adapter plugins

The Python `MountAdapter` protocol in `src/thoth/mounts.py` defines `status`, `connect`, `set_sidereal`, `set_tracking`, `slew`, `abort`, and `close`. Register an installed package factory using an entry point:

```toml
[project.entry-points."thoth.mount_adapters"]
my_mount = "my_package.adapter:create_adapter"
```

The factory returns an object with a unique identifier, label, and explicit boolean `simulated` property. A physical adapter must return the same status schema as `AlpacaMount`, including capabilities (`can_set_tracking`, `can_slew_async`, `equatorial_system`, `does_refraction`), site coordinates, `mount_utc_timestamp`, and reported connection/motion states. Its sidereal operation must establish rate 0 and zero secular offsets. Install only trusted Python packages; this registration does not accept browser-uploaded scripts, modules, or URLs. The controller applies the same authentication, plans, site/frame/clock checks, leases, and stop handling to physical plugins.

## Verification and references

Protocol tests use `httpx.MockTransport`, software mounts, and injected UTC/monotonic clocks. They cover protocol errors despite HTTP success, transaction matching, RA units, capability/frame/refraction/site/clock guards, single-use plans, expiry during slow checks, backwards clock steps, lease loss, stop failures, driver-message redaction, and absence of mutation retries. No actual telescope was contacted or moved during development.

- [ASCOM Alpaca REST API](https://ascom-standards.org/api/)
- [ASCOM Alpaca API reference](https://ascom-standards.org/AlpacaDeveloper/ASCOMAlpacaAPIReference.html)
- [ASCOM telescope master interface](https://ascom-standards.org/newdocs/telescope.html)
- [ASCOM astronomical coordinate/refraction conventions](https://ascom-standards.org/help/html/72A95B28-BBE2-4C7D-BC03-2D6AB324B6F7.htm)
- [ASCOM Remote configuration guide](https://download.ascom-standards.org/docs/RemoteInstConf.pdf)
- [THOTH observing calculations](OBSERVING.md)
