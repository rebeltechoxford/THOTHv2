"""Protocol and motion guards use mock transports and a controllable clock."""
from datetime import datetime, timezone
from urllib.parse import parse_qs

import httpx
import pytest

from thoth.mounts import AlpacaMount, MountController, MountError, SimulatorMount, configured_adapters


class Clock:
    value = 1_800_000_000.0
    def __call__(self):
        return self.value


def pointing(star, **kwargs):
    return {"star_id": star["id"], "star_name": "test Mira", "time_utc": kwargs["when"].isoformat(),
            "altitude_deg": 60.0, "azimuth_deg": 120.0, "mount_ready": True,
            "tracking_allowed": True, "reasons": [], "sun_altitude_deg": -20.0,
            "sun_separation_deg": 80.0, "ra_j2000_hours": 4.0, "dec_j2000_deg": 20.0,
            "ra_topocentric_hours": 4.02, "dec_topocentric_deg": 20.04}


class Hardware(SimulatorMount):
    id = "hardware"
    label = "Mock physical mount"
    simulated = False
    def __init__(self, clock=None):
        super().__init__()
        self.clock = clock or Clock()
        self.refraction = True
        self.clock_offset = 0

    def status(self):
        result = super().status()
        result["capabilities"]["does_refraction"] = self.refraction
        result["mount_utc_timestamp"] = self.clock() + self.clock_offset
        return result


@pytest.fixture
def rig():
    clock = Clock()
    hardware = Hardware(clock)
    controller = MountController(adapters={"simulator": SimulatorMount(), "hardware": hardware},
        control_token="secret", clock=clock, monotonic_clock=clock,
        target_lookup=lambda identifier: {"id": identifier}, pointing=pointing)
    return controller, clock, hardware


def plan(controller):
    return controller.prepare_plan("Mira", 34.365, -89.538, 152.4)


def activate(controller, adapter_id="simulator"):
    controller.connect(adapter_id, "secret")
    controller.arm(True, "secret")
    return plan(controller)


def test_inventory_does_not_connect_or_expose_token(rig):
    controller, _, hardware = rig
    result = controller.inventory()
    assert result["active_adapter_id"] == "simulator"
    assert not result["control_requires_token"]
    assert not hardware.calls
    assert "secret" not in str(result)
    assert any(row["id"] == "alpaca" and not row["available"] for row in result["adapters"])


@pytest.mark.parametrize("token", [None, "", "wrong"])
def test_real_connect_requires_correct_token_before_any_command(rig, token):
    controller, _, hardware = rig
    with pytest.raises(MountError) as error:
        controller.connect("hardware", token)
    assert error.value.status_code == 403
    assert not hardware.calls


def test_real_control_requires_server_token_even_when_client_supplies_one(rig):
    controller, _, hardware = rig
    controller.control_token = ""
    with pytest.raises(MountError, match="THOTH_MOUNT_CONTROL_TOKEN"):
        controller.connect("hardware", "secret")
    assert not hardware.calls


def test_no_arming_or_motion_occurs_when_connecting_or_preparing_plan(rig):
    controller, _, _ = rig
    controller.connect("simulator")
    result = plan(controller)
    assert result["allowed"]
    assert controller.adapter.calls == [("connected", True)]
    assert controller.status()["armed_until"] is None
    with pytest.raises(MountError, match="Arm"):
        controller.track(result["plan_id"])
    assert not controller.adapter.tracking


def test_simulator_command_sequence_and_sidereal_driver_tracking(rig):
    controller, _, _ = rig
    result = activate(controller)
    status = controller.track(result["plan_id"])
    assert controller.adapter.calls[-3:] == [("tracking_rate", 0), ("tracking", True), ("slew", 4.0, 20.0)]
    assert status["tracking"] and status["slewing"]
    assert status["lease_until"] is not None and status["armed_until"] is None
    assert controller.plan is None
    before = list(controller.adapter.calls)
    controller.heartbeat()
    controller.watchdog_once()
    assert controller.adapter.calls == before  # No repeated slew for tracking.


@pytest.mark.parametrize("delta,action,match", [(61, "track", "Arm"), (16, "track", "fresh tracking plan")])
def test_short_arm_and_plan_expirations_block_motion(rig, delta, action, match):
    controller, clock, _ = rig
    result = activate(controller)
    clock.value += delta
    with pytest.raises(MountError, match=match):
        controller.track(result["plan_id"])
    assert not any(call[0] == "slew" for call in controller.adapter.calls)


def test_plan_consumed_on_invalid_identifier_and_cannot_be_replayed(rig):
    controller, _, _ = rig
    result = activate(controller)
    with pytest.raises(MountError):
        controller.track("wrong")
    with pytest.raises(MountError):
        controller.track(result["plan_id"])
    assert not controller.adapter.tracking


def test_track_recomputes_actual_time_and_rejects_new_unsafe_target(rig):
    controller, clock, _ = rig
    result = activate(controller)
    clock.value += 2
    def unsafe(star, **kwargs):
        assert kwargs["when"] == datetime.fromtimestamp(clock(), timezone.utc)
        return {**pointing(star, **kwargs), "tracking_allowed": False, "reasons": ["Sun is too close."]}
    controller.pointing = unsafe
    with pytest.raises(MountError, match="Sun is too close"):
        controller.track(result["plan_id"])
    assert not controller.adapter.tracking


def test_hardware_site_mismatch_blocks_without_changing_driver_site(rig):
    controller, _, hardware = rig
    controller.connect("hardware", "secret")
    hardware.site["longitude_deg"] = -80
    result = plan(controller)
    assert not result["allowed"]
    assert any("site does not match" in reason for reason in result["reasons"])
    assert hardware.calls == [("connected", True)]


@pytest.mark.parametrize("field,value", [("latitude_deg", 0), ("elevation_m", 1000)])
def test_each_real_site_tolerance_is_enforced(rig, field, value):
    controller, _, hardware = rig
    controller.connect("hardware", "secret")
    hardware.site[field] = value
    assert not plan(controller)["allowed"]


def test_longitude_site_match_wraps_antimeridian(rig):
    controller, _, hardware = rig
    controller.connect("hardware", "secret")
    hardware.site["longitude_deg"] = 179.999
    result = controller.prepare_plan("Mira", 34.365, -179.999, 152.4)
    assert result["allowed"]


def test_mount_altitude_floor_cannot_be_lowered(rig):
    controller, _, _ = rig
    controller.connect("simulator")
    received = []
    def record(star, **kwargs):
        received.append(kwargs)
        return pointing(star, **kwargs)
    controller.pointing = record
    result = controller.prepare_plan("Mira", 34.365, -89.538, 152.4, 0)
    assert result["minimum_altitude_deg"] == 20
    assert received[0]["minimum_altitude_deg"] == 20
    assert received[0]["duration_hours"] == .5 and received[0]["samples"] == 13


def test_outdated_earth_orientation_blocks_plan_even_if_other_flags_allow(rig):
    controller, _, _ = rig
    controller.connect("simulator")
    controller.pointing = lambda star, **kwargs: {**pointing(star, **kwargs), "mount_ready": False}
    assert not plan(controller)["allowed"]


def test_parked_mount_is_never_unparked_automatically(rig):
    controller, _, _ = rig
    controller.connect("simulator")
    controller.adapter.at_park = True
    with pytest.raises(MountError, match="parked"):
        controller.arm(True)
    assert not plan(controller)["allowed"]
    assert controller.adapter.calls == [("connected", True)]


def test_alignment_acknowledgment_required(rig):
    controller, _, _ = rig
    controller.connect("simulator")
    with pytest.raises(MountError, match="Confirm"):
        controller.arm(False)
    assert controller.armed_until == 0


@pytest.mark.parametrize("system", [0, 3, 4])
def test_unknown_coordinate_systems_block_arm_and_plan(rig, monkeypatch, system):
    controller, _, _ = rig
    controller.connect("simulator")
    original = controller.adapter.status
    def changed():
        result = original()
        result["capabilities"]["equatorial_system"] = system
        return result
    monkeypatch.setattr(controller.adapter, "status", changed)
    with pytest.raises(MountError, match="coordinate systems"):
        controller.arm(True)
    assert not plan(controller)["allowed"]


def test_topocentric_mount_receives_tete_hours_and_degrees(rig, monkeypatch):
    controller, _, _ = rig
    controller.connect("simulator")
    original = controller.adapter.status
    def changed():
        result = original()
        result["capabilities"]["equatorial_system"] = 1
        return result
    monkeypatch.setattr(controller.adapter, "status", changed)
    controller.arm(True)
    result = plan(controller)
    assert result["coordinate_system"] == "Topocentric (TETE)"
    controller.track(result["plan_id"])
    assert controller.adapter.calls[-1] == ("slew", 4.02, 20.04)


def test_switch_to_simulator_cannot_bypass_real_token_or_leave_motion(rig):
    controller, _, _ = rig
    result = activate(controller, "hardware")
    controller.track(result["plan_id"], "secret")
    with pytest.raises(MountError) as error:
        controller.connect("simulator")
    assert error.value.status_code == 403
    with pytest.raises(MountError, match="Disconnect"):
        controller.connect("simulator", "secret")
    assert controller.adapter.id == "hardware"


def test_lease_expires_without_browser_and_watchdog_stops_both_motions(rig):
    controller, clock, _ = rig
    result = activate(controller)
    controller.track(result["plan_id"])
    clock.value += 121
    controller.watchdog_once()
    assert not controller.adapter.tracking and not controller.adapter.slewing
    assert controller.adapter.calls[-2:] == [("abort",), ("tracking", False)]
    assert "lease expired" in controller.fault


def test_heartbeat_extends_active_lease_but_cannot_restart_expired_tracking(rig):
    controller, clock, _ = rig
    result = activate(controller)
    controller.track(result["plan_id"])
    initial = controller.lease_until
    clock.value += 30
    controller.heartbeat()
    assert controller.lease_until == initial + 30
    clock.value += 121
    with pytest.raises(MountError, match="No active"):
        controller.heartbeat()
    assert not controller.adapter.tracking


def test_watchdog_horizon_change_stops_without_second_slew(rig):
    controller, _, _ = rig
    result = activate(controller)
    controller.track(result["plan_id"])
    controller.pointing = lambda star, **kwargs: {**pointing(star, **kwargs),
        "tracking_allowed": False, "reasons": ["Target fell below minimum altitude."]}
    controller.watchdog_once()
    assert "below minimum" in controller.fault
    assert sum(call[0] == "slew" for call in controller.adapter.calls) == 1
    assert not controller.adapter.tracking


def test_stop_attempts_tracking_off_even_when_abort_fails(rig, monkeypatch):
    controller, _, _ = rig
    result = activate(controller)
    controller.track(result["plan_id"])
    def failed():
        raise MountError("Abort timed out.", 502, uncertain=True)
    monkeypatch.setattr(controller.adapter, "abort", failed)
    result = controller.stop()
    assert not result["tracking"]
    assert result["stop_errors"] and "Abort timed out" in result["stop_errors"][0]
    assert "Stop could not be confirmed" in result["fault"]


def test_uncertain_slew_is_never_retried_and_stop_is_attempted(rig, monkeypatch):
    controller, _, _ = rig
    result = activate(controller)
    attempts = []
    def timeout(ra, dec):
        attempts.append((ra, dec))
        raise MountError("Slew outcome is uncertain.", 502, uncertain=True)
    monkeypatch.setattr(controller.adapter, "slew", timeout)
    with pytest.raises(MountError) as error:
        controller.track(result["plan_id"])
    assert error.value.uncertain
    assert len(attempts) == 1
    assert controller.adapter.calls[-2:] == [("abort",), ("tracking", False)]
    assert not controller.adapter.tracking


def test_disconnect_stops_before_disconnect(rig):
    controller, _, _ = rig
    result = activate(controller)
    controller.track(result["plan_id"])
    result = controller.disconnect()
    assert controller.adapter.calls[-3:] == [("abort",), ("tracking", False), ("connected", False)]
    assert not result["connected"]


class AlpacaServer:
    def __init__(self):
        self.state = {"connected": False, "tracking": False, "slewing": False, "atpark": False,
            "sitelatitude": 34.365, "sitelongitude": -89.538, "siteelevation": 152.4,
            "cansettracking": True, "canslewasync": True, "equatorialsystem": 2,
            "trackingrate": 0, "trackingrates": [0, 1, 2],
            "rightascensionrate": 0.0, "declinationrate": 0.0,
            "cansetrightascensionrate": True, "cansetdeclinationrate": True}
        self.state.update(doesrefraction=True, utcdate=datetime.now(timezone.utc).isoformat())
        self.calls = []
        self.error_number = 0
        self.bad_transaction = False

    def __call__(self, request):
        assert request.url.path.startswith("/api/v1/telescope/7/")
        member = request.url.path.rsplit("/", 1)[-1]
        form = dict(request.url.params) if request.method == "GET" else {
            key: values[0] for key, values in parse_qs(request.content.decode()).items()}
        self.calls.append((request.method, member, form))
        assert form["ClientID"] == "2417"
        transaction = int(form["ClientTransactionID"])
        response = {"ErrorNumber": self.error_number, "ErrorMessage": "driver secret", "ServerTransactionID": len(self.calls),
                    "ClientTransactionID": transaction + 1 if self.bad_transaction else transaction}
        if request.method == "GET":
            response["Value"] = self.state[member]
        elif not self.error_number:
            if member == "slewtocoordinatesasync":
                self.state["slewing"] = True
            elif member == "abortslew":
                self.state["slewing"] = False
            elif member in {"tracking", "connected"}:
                self.state[member] = form[member.capitalize()] == "true"
            else:
                self.state[member] = float(next(value for key, value in form.items()
                    if key not in {"ClientID", "ClientTransactionID"}))
        return httpx.Response(200, json=response)


@pytest.fixture
def alpaca():
    server = AlpacaServer()
    client = httpx.Client(transport=httpx.MockTransport(server))
    adapter = AlpacaMount("http://configured.test:11111", 7, client=client)
    yield adapter, server
    client.close()


def test_alpaca_http_form_units_and_transaction_ids(alpaca):
    adapter, server = alpaca
    adapter.connect(True)
    state = adapter.status()
    assert state["connected"] and state["site"]["longitude_deg"] == -89.538
    adapter.set_sidereal()
    adapter.set_tracking(True)
    adapter.slew(3.5, -20.2)
    method, member, form = server.calls[-1]
    assert (method, member) == ("PUT", "slewtocoordinatesasync")
    assert form["RightAscension"] == "3.5" and form["Declination"] == "-20.2"
    assert [int(call[2]["ClientTransactionID"]) for call in server.calls] == list(range(1, len(server.calls) + 1))
    adapter.abort()
    adapter.set_tracking(False)
    assert not adapter.status()["tracking"]


def test_alpaca_selects_sidereal_and_clears_old_comet_offsets(alpaca):
    adapter, server = alpaca
    server.state.update(trackingrate=2, rightascensionrate=.1, declinationrate=-.2)
    adapter.set_sidereal()
    assert server.state["trackingrate"] == 0
    assert server.state["rightascensionrate"] == server.state["declinationrate"] == 0
    assert [member for method, member, _ in server.calls if method == "PUT"] == [
        "trackingrate", "rightascensionrate", "declinationrate"]


def test_alpaca_rejects_driver_error_despite_http_success_and_redacts_message(alpaca):
    adapter, server = alpaca
    server.error_number = 1025
    with pytest.raises(MountError, match="ASCOM error 1025") as error:
        adapter.connect(True)
    assert "driver secret" not in str(error.value)
    assert len(server.calls) == 1


def test_alpaca_wrong_transaction_is_an_uncertain_command(alpaca):
    adapter, server = alpaca
    server.bad_transaction = True
    with pytest.raises(MountError, match="transaction envelope") as error:
        adapter.connect(True)
    assert error.value.uncertain


@pytest.mark.parametrize("value", ["false", 0, None])
def test_alpaca_does_not_coerce_invalid_booleans(alpaca, value):
    adapter, server = alpaca
    server.state["connected"] = value
    with pytest.raises(MountError, match="boolean"):
        adapter.status()


@pytest.mark.parametrize("value", [float("nan"), float("inf"), None, True])
def test_alpaca_nonfinite_site_fields_are_rejected(alpaca, value):
    adapter, server = alpaca
    server.state["connected"] = True
    server.state["sitelatitude"] = value
    with pytest.raises((MountError, ValueError)):
        adapter.status()


def test_alpaca_transport_timeout_has_one_mutation_attempt():
    requests = []
    def timeout(request):
        requests.append(request)
        raise httpx.ReadTimeout("private transport message", request=request)
    with httpx.Client(transport=httpx.MockTransport(timeout)) as client:
        adapter = AlpacaMount("http://configured.test", client=client)
        with pytest.raises(MountError, match="uncertain") as error:
            adapter.set_tracking(True)
        assert error.value.uncertain
        assert len(requests) == 1 and "private" not in str(error.value)


@pytest.mark.parametrize("origin", ["ftp://mount", "http://user:secret@mount", "http://mount/path",
                                  "http://mount?token=x", "http://mount#x", "mount"])
def test_server_origin_configuration_is_restricted(origin):
    with pytest.raises(ValueError):
        AlpacaMount(origin)


def test_adapter_configuration_is_lazy_and_invalid_settings_do_not_contact_network(monkeypatch):
    monkeypatch.setenv("THOTH_ALPACA_URL", "http://user:secret@mount")
    adapters, error = configured_adapters()
    assert set(adapters) == {"simulator"} and error
    assert "secret" not in error


def test_adapter_configured_from_environment_without_contacting_mount(monkeypatch):
    monkeypatch.setenv("THOTH_ALPACA_URL", "http://configured.test:11111")
    monkeypatch.setenv("THOTH_ALPACA_DEVICE", "7")
    adapters, error = configured_adapters()
    assert set(adapters) == {"simulator", "alpaca"} and error is None
    for adapter in adapters.values():
        adapter.close()


@pytest.mark.parametrize("refraction", [False, None])
def test_real_driver_refraction_contract_blocks_unrefracted_commands(rig, refraction):
    controller, _, hardware = rig
    controller.connect("hardware", "secret")
    hardware.refraction = refraction
    with pytest.raises(MountError, match="DoesRefraction"):
        controller.arm(True, "secret")
    result = plan(controller)
    assert not result["allowed"] and any("DoesRefraction" in reason for reason in result["reasons"])
    assert hardware.calls == [("connected", True)]


@pytest.mark.parametrize("clock_offset", [-11, 11, float("nan")])
def test_real_mount_utc_skew_or_invalid_time_blocks_motor_commands(rig, clock_offset):
    controller, _, hardware = rig
    controller.connect("hardware", "secret")
    hardware.clock_offset = clock_offset
    with pytest.raises(MountError, match="UTCDate"):
        controller.arm(True, "secret")
    assert not plan(controller)["allowed"]
    assert hardware.calls == [("connected", True)]


def test_real_watchdog_stops_if_mount_clock_loses_agreement(rig):
    controller, _, hardware = rig
    result = activate(controller, "hardware")
    controller.track(result["plan_id"], "secret")
    hardware.clock_offset = 11
    controller.watchdog_once()
    assert not hardware.tracking and "UTCDate" in controller.fault


def test_slow_status_verification_cannot_slew_after_plan_expired(rig, monkeypatch):
    controller, clock, _ = rig
    result = activate(controller)
    original = controller.adapter.status
    def slow():
        clock.value += 16
        return original()
    monkeypatch.setattr(controller.adapter, "status", slow)
    with pytest.raises(MountError, match="expired during verification"):
        controller.track(result["plan_id"])
    assert not any(call[0] in {"slew", "tracking_rate"} for call in controller.adapter.calls)


def test_slow_coordinate_verification_cannot_slew_after_arm_expired(rig):
    controller, clock, _ = rig
    result = activate(controller)
    def slow(star, **kwargs):
        clock.value += 61
        return pointing(star, **kwargs)
    controller.pointing = slow
    with pytest.raises(MountError, match="expired during verification"):
        controller.track(result["plan_id"])
    assert not controller.adapter.tracking


def test_slow_sidereal_setup_rechecks_short_arm_before_motion(rig, monkeypatch):
    controller, clock, _ = rig
    controller.connect("simulator")
    controller.arm(True)
    clock.value += 50
    result = plan(controller)
    def slow():
        clock.value += 11
    monkeypatch.setattr(controller.adapter, "set_sidereal", slow)
    with pytest.raises(MountError, match="expired while verifying sidereal"):
        controller.track(result["plan_id"])
    assert ("tracking", True) not in controller.adapter.calls
    assert not any(call[0] == "slew" for call in controller.adapter.calls)


def test_monotonic_tracking_lease_survives_wall_clock_rollback_without_extension(rig):
    controller, wall, _ = rig
    elapsed = [100.0]
    controller.monotonic = lambda: elapsed[0]
    result = activate(controller)
    controller.track(result["plan_id"])
    wall.value -= 3600
    elapsed[0] += 121
    controller.watchdog_once()
    assert not controller.adapter.tracking
    assert "lease expired" in controller.fault


def test_monotonic_plan_expiration_survives_wall_clock_rollback(rig):
    controller, wall, _ = rig
    elapsed = [100.0]
    controller.monotonic = lambda: elapsed[0]
    result = activate(controller)
    wall.value -= 3600
    elapsed[0] += 16
    with pytest.raises(MountError, match="fresh tracking plan"):
        controller.track(result["plan_id"])
    assert not controller.adapter.tracking


@pytest.mark.parametrize("value", ["not-a-date", "999999999", None])
def test_alpaca_invalid_utcdate_is_rejected(alpaca, value):
    adapter, server = alpaca
    server.state.update(connected=True, utcdate=value)
    with pytest.raises(MountError, match="UTCDate"):
        adapter.status()


@pytest.mark.parametrize("value", ["2026-10-08T20:30:00Z", "2026-10-08T20:30:00", "2026-10-08T21:30:00+01:00"])
def test_alpaca_utc_dates_honor_ascom_utc_and_explicit_offsets(alpaca, value):
    adapter, server = alpaca
    server.state.update(connected=True, utcdate=value)
    result = adapter.status()
    assert result["mount_utc_date"] == "2026-10-08T20:30:00+00:00"


def test_sidereal_only_fixed_rate_driver_does_not_require_optional_setter(alpaca):
    adapter, server = alpaca
    server.state["trackingrates"] = [0]
    adapter.set_sidereal()
    assert not any(method == "PUT" for method, _, _ in server.calls)


def test_tracking_rate_support_must_include_sidereal(alpaca):
    adapter, server = alpaca
    server.state["trackingrates"] = [1, 2]
    with pytest.raises(MountError, match="sidereal tracking support"):
        adapter.set_sidereal()
    assert not any(method == "PUT" for method, _, _ in server.calls)


def test_nonzero_comet_offset_without_setter_blocks_stellar_tracking(alpaca):
    adapter, server = alpaca
    server.state.update(rightascensionrate=0.1, cansetrightascensionrate=False)
    with pytest.raises(MountError, match="nonzero tracking offsets"):
        adapter.set_sidereal()
    assert not any(method == "PUT" for method, _, _ in server.calls)
