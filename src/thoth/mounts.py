"""Explicit telescope control: trusted adapters, short plans, and a tracking lease.

No device discovery, network requests, or physical commands occur at import time.
"""
from __future__ import annotations

import hmac
import math
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from importlib.metadata import entry_points
from typing import Callable, Protocol
from urllib.parse import urlsplit

import httpx


class MountError(RuntimeError):
    def __init__(self, message: str, status_code: int = 409, *, uncertain: bool = False):
        super().__init__(message)
        self.status_code = status_code
        self.uncertain = uncertain


class MountAdapter(Protocol):
    """Installed, server-side adapters implement this synchronous interface."""
    id: str
    label: str
    simulated: bool
    def status(self) -> dict: ...
    def connect(self, connected: bool) -> None: ...
    def set_sidereal(self) -> None: ...
    def set_tracking(self, enabled: bool) -> None: ...
    def slew(self, ra_hours: float, dec_deg: float) -> None: ...
    def abort(self) -> None: ...
    def close(self) -> None: ...


class SimulatorMount:
    id = "simulator"
    label = "THOTH software mount simulator"
    simulated = True

    def __init__(self, latitude_deg: float = 34.365, longitude_deg: float = -89.538,
                 elevation_m: float = 152.4):
        self.connected = self.tracking = self.slewing = self.at_park = False
        self.ra_hours, self.dec_deg = 0.0, 0.0
        self.site = {"latitude_deg": latitude_deg, "longitude_deg": longitude_deg,
                     "elevation_m": elevation_m}
        self.calls: list[tuple] = []
        self._slew_until = 0.0

    def status(self) -> dict:
        self.slewing = self.slewing and time.monotonic() < self._slew_until
        return {"name": self.label, "connected": self.connected, "tracking": self.tracking,
                "slewing": self.slewing, "at_park": self.at_park, "site": dict(self.site),
                "ra_hours": self.ra_hours, "dec_deg": self.dec_deg,
                "capabilities": {"can_set_tracking": True, "can_slew_async": True,
                                 "equatorial_system": 2, "tracking_rate": 0}}

    def connect(self, connected: bool) -> None:
        self.calls.append(("connected", connected))
        self.connected = connected
        if not connected:
            self.tracking = self.slewing = False

    def set_sidereal(self) -> None:
        self.calls.append(("tracking_rate", 0))

    def set_tracking(self, enabled: bool) -> None:
        if not self.connected:
            raise MountError("The simulator is disconnected.")
        self.calls.append(("tracking", enabled))
        self.tracking = enabled

    def slew(self, ra_hours: float, dec_deg: float) -> None:
        if not self.connected or self.at_park or not self.tracking:
            raise MountError("Slewing requires a connected, unparked, tracking mount.")
        self.calls.append(("slew", ra_hours, dec_deg))
        self.ra_hours, self.dec_deg = ra_hours, dec_deg
        self.slewing = True
        self._slew_until = time.monotonic() + 1.0

    def abort(self) -> None:
        self.calls.append(("abort",))
        self.slewing = False

    def close(self) -> None:
        pass


def _finite(value, label: str) -> float:
    if isinstance(value, bool):
        raise MountError(f"The mount returned an invalid {label}.", 502)
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise MountError(f"The mount returned an invalid {label}.", 502) from error
    if not math.isfinite(number):
        raise MountError(f"The mount returned a nonfinite {label}.", 502)
    return number


class AlpacaMount:
    id = "alpaca"
    label = "ASCOM Alpaca telescope"
    simulated = False

    def __init__(self, base_url: str, device_number: int = 0, *, client: httpx.Client | None = None,
                 client_id: int = 2417):
        parsed = urlsplit(base_url)
        if (parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username
                or parsed.password or parsed.query or parsed.fragment or parsed.path not in {"", "/"}):
            raise ValueError("THOTH_ALPACA_URL must be an HTTP(S) server origin without credentials or a path.")
        if not 0 <= device_number <= 65535:
            raise ValueError("THOTH_ALPACA_DEVICE must be between 0 and 65535.")
        self._base = base_url.rstrip("/") + f"/api/v1/telescope/{device_number}"
        self._client = client or httpx.Client(timeout=2.0, follow_redirects=False, trust_env=False)
        self._owns_client = client is None
        self._client_id = client_id
        self._transaction = 0
        self._request_lock = threading.Lock()

    def _request(self, method: str, member: str, **parameters):
        # Each physical command has one attempt. A timeout cannot tell us whether
        # the device received the command, so it must never trigger a retry.
        with self._request_lock:
            self._transaction = self._transaction % 0xFFFFFFFF + 1
            transaction = self._transaction
            form = {"ClientID": str(self._client_id), "ClientTransactionID": str(transaction)}
            form.update({key: str(value).lower() if isinstance(value, bool) else str(value)
                         for key, value in parameters.items()})
            try:
                response = self._client.request(method, self._base + "/" + member,
                                                **({"params": form} if method == "GET" else {"data": form}))
                response.raise_for_status()
                payload = response.json()
            except (httpx.HTTPError, ValueError) as error:
                raise MountError(f"Alpaca {member} communication failed; " +
                                 ("command outcome is uncertain." if method == "PUT" else "status is unavailable."),
                                 502, uncertain=method == "PUT") from error
            if not isinstance(payload, dict):
                raise MountError(f"Alpaca {member} returned an invalid response.", 502,
                                 uncertain=method == "PUT")
            result = {str(key).casefold(): value for key, value in payload.items()}
            if (type(result.get("errornumber")) is not int
                    or type(result.get("clienttransactionid")) is not int
                    or result["clienttransactionid"] != transaction
                    or type(result.get("servertransactionid")) is not int
                    or not isinstance(result.get("errormessage"), str)):
                raise MountError(f"Alpaca {member} returned an invalid transaction envelope.", 502,
                                 uncertain=method == "PUT")
            if result["errornumber"] != 0:
                # Driver messages can contain network paths and credentials.
                raise MountError(f"Alpaca {member} rejected the request (ASCOM error {result['errornumber']}).", 502)
            if method == "GET" and "value" not in result:
                raise MountError(f"Alpaca {member} omitted its value.", 502)
            return result.get("value")

    def _boolean(self, member: str) -> bool:
        value = self._request("GET", member)
        if type(value) is not bool:
            raise MountError(f"Alpaca {member} did not return a boolean.", 502)
        return value

    def status(self) -> dict:
        connected = self._boolean("connected")
        state = {"name": self.label, "connected": connected, "tracking": False,
                 "slewing": False, "at_park": False, "site": None, "capabilities": {}}
        if not connected:
            return state
        state.update({"tracking": self._boolean("tracking"), "slewing": self._boolean("slewing"),
                      "at_park": self._boolean("atpark"),
                      "site": {"latitude_deg": _finite(self._request("GET", "sitelatitude"), "latitude"),
                               "longitude_deg": _finite(self._request("GET", "sitelongitude"), "longitude"),
                               "elevation_m": _finite(self._request("GET", "siteelevation"), "elevation")}})
        system = self._request("GET", "equatorialsystem")
        supported = self._request("GET", "trackingrates")
        if not isinstance(supported, list) or any(type(rate) is not int for rate in supported) or 0 not in supported:
            raise MountError("The mount does not advertise sidereal tracking support.", 422)
        rate = self._request("GET", "trackingrate")
        if type(system) is not int or type(rate) is not int:
            raise MountError("Alpaca coordinate system or tracking rate is invalid.", 502)
        state["capabilities"] = {"can_set_tracking": self._boolean("cansettracking"),
                                 "can_slew_async": self._boolean("canslewasync"),
                                 "equatorial_system": system, "tracking_rate": rate,
                                 "does_refraction": self._boolean("doesrefraction")}
        value = self._request("GET", "utcdate")
        try:
            if not isinstance(value, str):
                raise ValueError("UTCDate must be a string")
            mount_time = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if mount_time.tzinfo is None:
                mount_time = mount_time.replace(tzinfo=timezone.utc)  # ASCOM specifies UTC.
            state["mount_utc_timestamp"] = mount_time.timestamp()
            state["mount_utc_date"] = mount_time.astimezone(timezone.utc).isoformat()
        except (ValueError, OverflowError) as error:
            raise MountError("Alpaca UTCDate is invalid; correct the mount's UTC clock.", 502) from error
        return state

    def connect(self, connected: bool) -> None:
        self._request("PUT", "connected", Connected=connected)

    def set_sidereal(self) -> None:
        # A fixed-rate driver may reject writing the same rate; reading its
        # already-sidereal rate avoids relying on optional setter support.
        supported = self._request("GET", "trackingrates")
        if not isinstance(supported, list) or any(type(rate) is not int for rate in supported) or 0 not in supported:
            raise MountError("The mount does not advertise sidereal tracking support.", 422)
        rate = self._request("GET", "trackingrate")
        if type(rate) is not int:
            raise MountError("Alpaca tracking rate is invalid.", 502)
        if rate != 0:
            self._request("PUT", "trackingrate", TrackingRate=0)
        if self._request("GET", "trackingrate") != 0:
            raise MountError("The mount did not confirm sidereal tracking rate.", 502)
        # Stellar tracking must not inherit a comet's secular RA/Dec offsets.
        for member, capability, parameter in (("rightascensionrate", "cansetrightascensionrate", "RightAscensionRate"),
                                               ("declinationrate", "cansetdeclinationrate", "DeclinationRate")):
            if _finite(self._request("GET", member), member) != 0:
                if not self._boolean(capability):
                    raise MountError("The mount has nonzero tracking offsets that THOTH cannot reset.", 422)
                self._request("PUT", member, **{parameter: 0})
                if _finite(self._request("GET", member), member) != 0:
                    raise MountError("The mount did not confirm zero stellar tracking offsets.", 502)

    def set_tracking(self, enabled: bool) -> None:
        self._request("PUT", "tracking", Tracking=enabled)

    def slew(self, ra_hours: float, dec_deg: float) -> None:
        self._request("PUT", "slewtocoordinatesasync", RightAscension=ra_hours, Declination=dec_deg)

    def abort(self) -> None:
        self._request("PUT", "abortslew")

    def close(self) -> None:
        if self._owns_client:
            self._client.close()


def configured_adapters() -> tuple[dict[str, MountAdapter], str | None]:
    adapters: dict[str, MountAdapter] = {"simulator": SimulatorMount()}
    configuration_error = None
    origin = os.environ.get("THOTH_ALPACA_URL", "").strip()
    if origin:
        try:
            adapters["alpaca"] = AlpacaMount(origin, int(os.environ.get("THOTH_ALPACA_DEVICE", "0")))
        except (ValueError, OverflowError):
            configuration_error = "Alpaca server configuration is invalid; correct THOTH_ALPACA_URL and THOTH_ALPACA_DEVICE."
    # These are installed Python packages, never paths or code supplied by an
    # HTTP request. Treat adapters marked simulated=False as physical devices.
    for entry in entry_points(group="thoth.mount_adapters"):
        try:
            adapter = entry.load()()
            if (adapter.id in adapters or adapter.id in {"alpaca", "simulator"}
                    or not isinstance(adapter.id, str) or not adapter.id.isidentifier()
                    or type(adapter.simulated) is not bool):
                raise ValueError("Invalid adapter registration")
            adapters[adapter.id] = adapter
        except Exception:
            configuration_error = "An installed mount adapter could not be initialized."
    return adapters, configuration_error


def _iso(timestamp: float) -> str | None:
    return datetime.fromtimestamp(timestamp, timezone.utc).isoformat() if timestamp > 0 else None


class MountController:
    PLAN_SECONDS = 15.0
    ARM_SECONDS = 60.0
    LEASE_SECONDS = 120.0

    def __init__(self, *, adapters: dict[str, MountAdapter] | None = None,
                 control_token: str | None = None, target_lookup: Callable | None = None,
                 pointing: Callable | None = None, clock: Callable = time.time,
                 monotonic_clock: Callable = time.monotonic):
        if adapters is None:
            adapters, self.configuration_error = configured_adapters()
        else:
            self.configuration_error = None
        if "simulator" not in adapters:
            raise ValueError("A simulator adapter is required.")
        self.adapters = adapters
        self.adapter = adapters["simulator"]
        self.control_token = control_token if control_token is not None else os.environ.get("THOTH_MOUNT_CONTROL_TOKEN", "")
        self.target_lookup = target_lookup
        self.pointing = pointing
        self.clock = clock
        self.monotonic = monotonic_clock
        self.lock = threading.RLock()
        self.armed_until = self.lease_until = 0.0
        self._armed_deadline = self._lease_deadline = 0.0
        self.target: dict | None = None
        self.plan: dict | None = None
        self.fault: str | None = None
        self.stop_errors: list[str] = []
        self._shutdown = threading.Event()
        self._thread: threading.Thread | None = None

    def authorize(self, token: str | None, requested: MountAdapter | None = None) -> None:
        if not self.adapter.simulated or (requested is not None and not requested.simulated):
            if not self.control_token:
                raise MountError("Physical mount control requires THOTH_MOUNT_CONTROL_TOKEN on the server.", 403)
            if not token or not hmac.compare_digest(token.encode(), self.control_token.encode()):
                raise MountError("A valid X-THOTH-Mount-Token is required for physical mount control.", 403)

    def inventory(self) -> dict:
        records = [{"id": a.id, "label": a.label, "available": True,
                    "simulated": a.simulated, "configured": True} for a in self.adapters.values()]
        if "alpaca" not in self.adapters:
            records.append({"id": "alpaca", "label": AlpacaMount.label,
                            "available": False, "simulated": False, "configured": False})
        return {"adapters": records, "active_adapter_id": self.adapter.id,
                "control_requires_token": not self.adapter.simulated,
                "configuration_error": self.configuration_error}

    def status(self) -> dict:
        with self.lock:
            state = self.adapter.status()
            return {**state, "adapter_id": self.adapter.id, "simulated": self.adapter.simulated,
                    "armed_until": _iso(self.armed_until), "lease_until": _iso(self.lease_until),
                    "target": self.target, "fault": self.fault, "stop_errors": list(self.stop_errors)}

    def _stop(self) -> list[str]:
        # Abort and tracking-off are independent: failure of the first command
        # must not prevent the second. Report failures instead of claiming stop.
        errors = []
        for label, action in (("Abort slew", self.adapter.abort),
                              ("Disable tracking", lambda: self.adapter.set_tracking(False))):
            try:
                action()
            except Exception as error:
                errors.append(f"{label}: {error}" if isinstance(error, MountError)
                              else f"{label}: adapter failed; outcome is uncertain.")
        try:
            state = self.adapter.status()
            if state["tracking"] or state["slewing"]:
                errors.append("The mount still reports tracking or slewing after stop commands.")
        except Exception:
            errors.append("The mount's stopped state could not be verified.")
        self.armed_until = self.lease_until = 0.0
        self._armed_deadline = self._lease_deadline = 0.0
        self.plan = self.target = None
        self.stop_errors = errors
        if errors:
            self.fault = "Stop could not be confirmed. Use the mount's physical controller."
        return errors

    def _command_failed(self, error: Exception):
        self.fault = str(error) if isinstance(error, MountError) else "Mount adapter failed; command outcome is uncertain."
        self._stop()
        raise MountError(self.fault, 502, uncertain=True) from error

    def connect(self, adapter_id: str, token: str | None = None) -> dict:
        with self.lock:
            selected = self.adapters.get(adapter_id)
            if selected is None:
                raise MountError("Mount adapter is unavailable. Configure it on the server first.", 422)
            self.authorize(token, selected)
            current = self.adapter.status()
            if current["connected"]:
                raise MountError("Disconnect the current adapter before connecting another one.")
            self.adapter = selected
            self.plan = self.target = None
            self.armed_until = self.lease_until = 0.0
            self._armed_deadline = self._lease_deadline = 0.0
            self.fault = None
            self.stop_errors = []
            try:
                self.adapter.connect(True)
                state = self.status()
                if not state["connected"]:
                    raise MountError("The mount did not confirm its connection.", 502)
                return state
            except Exception as error:
                self._command_failed(error)

    def arm(self, aligned_ack: bool, token: str | None = None) -> dict:
        with self.lock:
            self.authorize(token)
            if not aligned_ack:
                raise MountError("Confirm the mount is aligned before arming.", 422)
            state = self.adapter.status()
            self._ready(state)
            clock_reasons = self._hardware_clock_reasons(state)
            if clock_reasons:
                raise MountError("; ".join(clock_reasons), 422)
            if state["tracking"] or state["slewing"] or self.lease_until:
                raise MountError("Stop the current mount motion before arming a new target.")
            self.fault = None
            self.armed_until = self.clock() + self.ARM_SECONDS
            self._armed_deadline = self.monotonic() + self.ARM_SECONDS
            self.plan = None
            return self.status()

    @staticmethod
    def _ready(state: dict) -> None:
        if not state["connected"]:
            raise MountError("Connect the mount first.")
        if state["at_park"]:
            raise MountError("The mount is parked. Unpark it with its physical controller before using THOTH.")
        caps = state["capabilities"]
        if not caps.get("can_set_tracking") or not caps.get("can_slew_async"):
            raise MountError("This mount must support CanSetTracking and CanSlewAsync.", 422)
        if caps.get("equatorial_system") not in {1, 2}:
            raise MountError("Only ASCOM J2000 (2) and topocentric (1) coordinate systems are supported.", 422)

    def _hardware_clock_reasons(self, state: dict) -> list[str]:
        if self.adapter.simulated:
            return []
        reasons = []
        if state.get("capabilities", {}).get("does_refraction") is not True:
            reasons.append("The driver must report DoesRefraction=True for THOTH's unrefracted coordinates.")
        mount_utc = state.get("mount_utc_timestamp")
        if not isinstance(mount_utc, (int, float)) or not math.isfinite(mount_utc):
            reasons.append("The mount's UTCDate must be readable before motor commands.")
        elif abs(self.clock() - mount_utc) > 10:
            reasons.append("The mount's UTCDate differs from THOTH by more than 10 seconds. Correct the clock in its driver.")
        return reasons

    def _pointing(self, star_id: str, site: dict, minimum_altitude_deg: float) -> dict:
        lookup = self.target_lookup
        if lookup is None:
            from .catalog import get_star
            lookup = get_star
        star = lookup(star_id)
        if star is None:
            raise MountError("Star not found.", 404)
        compute = self.pointing
        if compute is None:
            from .observing import observing_target
            compute = observing_target
        try:
            return compute(star, **site, when=datetime.fromtimestamp(self.clock(), timezone.utc),
                           minimum_altitude_deg=minimum_altitude_deg, duration_hours=0.5, samples=13)
        except (ValueError, RuntimeError) as error:
            raise MountError(str(error), 422) from error

    @staticmethod
    def _site_reasons(state: dict, site: dict, simulated: bool) -> list[str]:
        if simulated:
            return []
        actual = state.get("site")
        if not actual:
            return ["The mount's observing site could not be verified."]
        longitude_delta = abs((actual["longitude_deg"] - site["longitude_deg"] + 180) % 360 - 180)
        if (abs(actual["latitude_deg"] - site["latitude_deg"]) > 0.01
                or longitude_delta > 0.01 or abs(actual["elevation_m"] - site["elevation_m"]) > 100):
            return ["The mount site does not match the observing site (0.01 degree / 100 metre tolerance). Configure its driver site first."]
        return []

    @staticmethod
    def _pointing_reasons(target: dict) -> list[str]:
        reasons = list(target.get("reasons", target.get("tracking_reasons", [])))
        if not target.get("mount_ready", False):
            reasons.append("Current Earth orientation data are required for mount commands.")
        if not target.get("tracking_allowed", False) and not reasons:
            reasons.append("The target does not satisfy the current observing constraints.")
        return list(dict.fromkeys(reasons))

    def prepare_plan(self, star_id: str, latitude_deg: float, longitude_deg: float,
                     elevation_m: float = 0, minimum_altitude_deg: float = 20) -> dict:
        with self.lock:
            site = {"latitude_deg": latitude_deg, "longitude_deg": longitude_deg, "elevation_m": elevation_m}
            minimum_altitude_deg = max(20.0, minimum_altitude_deg)
            target = self._pointing(star_id, site, minimum_altitude_deg)
            state = self.adapter.status()
            reasons = (self._pointing_reasons(target) + self._site_reasons(state, site, self.adapter.simulated)
                       + self._hardware_clock_reasons(state))
            try:
                self._ready(state)
            except MountError as error:
                reasons.append(str(error))
            if state["tracking"] or state["slewing"] or self.lease_until:
                reasons.append("Stop current motion before planning another target.")
            system = state.get("capabilities", {}).get("equatorial_system", 2)
            prefix = "ra_j2000_hours" if system == 2 else "ra_topocentric_hours"
            dec = "dec_j2000_deg" if system == 2 else "dec_topocentric_deg"
            now = self.clock()
            result = {"plan_id": uuid.uuid4().hex, "expires_at": _iso(now + self.PLAN_SECONDS),
                      "allowed": not reasons, "reasons": list(dict.fromkeys(reasons)), "target": target,
                      "coordinate_system": "J2000" if system == 2 else "Topocentric (TETE)",
                      "target_ra_hours": target.get(prefix), "target_dec_deg": target.get(dec),
                      "site": site, "minimum_altitude_deg": minimum_altitude_deg}
            self.plan = {**result, "star_id": star_id, "expires_timestamp": now + self.PLAN_SECONDS,
                         "expires_monotonic": self.monotonic() + self.PLAN_SECONDS,
                         "adapter_id": self.adapter.id, "equatorial_system": system}
            return result

    def track(self, plan_id: str, token: str | None = None) -> dict:
        with self.lock:
            self.authorize(token)
            now = self.monotonic()
            if now >= self._armed_deadline:
                raise MountError("Arm the mount again; arming expires after 60 seconds.")
            plan = self.plan
            self.plan = None  # One-use even if validation or a command fails.
            if not plan or plan["plan_id"] != plan_id or now >= plan["expires_monotonic"]:
                raise MountError("Create a fresh tracking plan; plans expire after 15 seconds.")
            if not plan["allowed"]:
                raise MountError("The tracking plan is blocked: " + "; ".join(plan["reasons"]), 422)
            state = self.adapter.status()
            self._ready(state)
            if state["slewing"] or state["tracking"] or self.lease_until:
                raise MountError("Stop current motion before starting another target.")
            if state["capabilities"]["equatorial_system"] != plan["equatorial_system"]:
                raise MountError("The mount coordinate system changed. Prepare a new plan.")
            target = self._pointing(plan["star_id"], plan["site"], plan["minimum_altitude_deg"])
            reasons = (self._pointing_reasons(target) + self._site_reasons(state, plan["site"], self.adapter.simulated)
                       + self._hardware_clock_reasons(state))
            if reasons:
                raise MountError("Tracking is blocked: " + "; ".join(reasons), 422)
            j2000 = state["capabilities"]["equatorial_system"] == 2
            ra = _finite(target["ra_j2000_hours" if j2000 else "ra_topocentric_hours"], "target RA")
            dec = _finite(target["dec_j2000_deg" if j2000 else "dec_topocentric_deg"], "target declination")
            if not 0 <= ra < 24 or not -90 <= dec <= 90:
                raise MountError("The computed target coordinates are outside ASCOM ranges.", 422)
            if self.monotonic() >= self._armed_deadline or self.monotonic() >= plan["expires_monotonic"]:
                raise MountError("The arm or tracking plan expired during verification. Prepare and arm again.")
            # Set the lease BEFORE any motion request. The watchdog can clean
            # up an uncertain operation; never issue a second slew as a retry.
            arm_deadline = self._armed_deadline
            self.target = {"star_id": plan["star_id"], "site": plan["site"],
                           "minimum_altitude_deg": plan["minimum_altitude_deg"], "pointing": target}
            self.lease_until = self.clock() + self.LEASE_SECONDS
            self._lease_deadline = self.monotonic() + self.LEASE_SECONDS
            self.armed_until = 0.0
            self._armed_deadline = 0.0
            try:
                self.adapter.set_sidereal()
                if self.monotonic() >= plan["expires_monotonic"] or self.monotonic() >= arm_deadline:
                    raise MountError("The arm or tracking plan expired while verifying sidereal rates; motion was not started.")
                self.adapter.set_tracking(True)
                self.adapter.slew(ra, dec)
                return self.status()
            except Exception as error:
                self._command_failed(error)

    def heartbeat(self, token: str | None = None) -> dict:
        with self.lock:
            self.authorize(token)
            if not self.target or self.monotonic() >= self._lease_deadline:
                if self.target:
                    self._stop()
                raise MountError("No active tracking lease. Prepare and arm a new target.")
            self.lease_until = self.clock() + self.LEASE_SECONDS
            self._lease_deadline = self.monotonic() + self.LEASE_SECONDS
            return self.status()

    def stop(self, token: str | None = None) -> dict:
        with self.lock:
            self.authorize(token)
            self._stop()
            return self.status()

    def disconnect(self, token: str | None = None) -> dict:
        with self.lock:
            self.authorize(token)
            if self.adapter.status()["connected"]:
                errors = self._stop()
                if errors:
                    raise MountError("Stop could not be confirmed; keep the connection and use the physical controller.", 502)
                try:
                    self.adapter.connect(False)
                except Exception as error:
                    self._command_failed(error)
            return self.status()

    def watchdog_once(self) -> None:
        with self.lock:
            if not self.target:
                return
            if self.monotonic() >= self._lease_deadline:
                self.fault = "Tracking stopped because the 120-second controller lease expired."
                self._stop()
                return
            try:
                state = self.adapter.status()
                self._ready(state)
                if self.monotonic() >= self._lease_deadline:
                    raise MountError("Tracking stopped because the 120-second controller lease expired.")
                target = self._pointing(self.target["star_id"], self.target["site"],
                                        self.target["minimum_altitude_deg"])
                reasons = (self._pointing_reasons(target) + self._site_reasons(state, self.target["site"], self.adapter.simulated)
                           + self._hardware_clock_reasons(state))
                if not state["tracking"]:
                    reasons.append("The mount no longer reports tracking.")
                if reasons:
                    raise MountError("Tracking stopped: " + "; ".join(reasons))
                self.target["pointing"] = target
            except Exception as error:
                self.fault = str(error) if isinstance(error, MountError) else "Tracking status could not be verified."
                self._stop()

    def start_watchdog(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._shutdown.clear()
        def watch():
            while not self._shutdown.wait(5):
                self.watchdog_once()
        self._thread = threading.Thread(target=watch, name="thoth-mount-watchdog", daemon=True)
        self._thread.start()

    def shutdown(self) -> None:
        self._shutdown.set()
        with self.lock:
            if self.target:
                self._stop()
            for adapter in self.adapters.values():
                adapter.close()
