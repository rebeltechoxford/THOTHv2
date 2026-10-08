"""FastAPI telescope adapter endpoints; all motion is an explicit action."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import APIRouter, Header, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute
from pydantic import BaseModel, ConfigDict, Field

from .mounts import MountController, MountError


class MountRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ConnectRequest(MountRequest):
    adapter_id: str = Field(min_length=1, max_length=80)


class ArmRequest(MountRequest):
    aligned_ack: bool = Field(strict=True)


class PlanRequest(MountRequest):
    star_id: str = Field(min_length=1, max_length=150)
    latitude_deg: float = Field(ge=-90, le=90, allow_inf_nan=False, strict=True)
    longitude_deg: float = Field(ge=-180, le=180, allow_inf_nan=False, strict=True)
    elevation_m: float = Field(0, ge=-500, le=10000, allow_inf_nan=False, strict=True)
    minimum_altitude_deg: float = Field(20, ge=0, le=85, allow_inf_nan=False, strict=True)


class TrackRequest(MountRequest):
    plan_id: str = Field(min_length=1, max_length=64)


class MountRoute(APIRoute):
    def get_route_handler(self):
        original = super().get_route_handler()
        async def handler(request):
            try:
                return await original(request)
            except RequestValidationError as error:
                # FastAPI's default handler can attempt to serialize the NaN
                # input inside a validation error. Return finite diagnostics.
                detail = [{key: item[key] for key in ("type", "loc", "msg") if key in item}
                          for item in error.errors()]
                raise HTTPException(422, detail) from error
        return handler


def create_mount_router(controller: MountController | None = None) -> APIRouter:
    controller = controller or MountController()
    @asynccontextmanager
    async def lifespan(app):
        controller.start_watchdog()
        try:
            yield
        finally:
            controller.shutdown()
    api = APIRouter(prefix="/api/mounts", tags=["telescope mounts"], route_class=MountRoute,
                    lifespan=lifespan)
    # Root applications using their own lifespan can call these explicitly.
    api.mount_controller = controller

    def invoke(action, *args, **kwargs):
        # One operation controls this mount at a time. Reject concurrent browser
        # commands rather than accepting several queued motion requests.
        if not controller.lock.acquire(blocking=False):
            raise HTTPException(409, "A mount operation is already in progress.")
        try:
            return action(*args, **kwargs)
        except MountError as error:
            raise HTTPException(error.status_code, str(error)) from error
        except Exception as error:
            raise HTTPException(502, "The mount adapter failed; inspect its controller before continuing.") from error
        finally:
            controller.lock.release()

    @api.get("")
    def mounts():
        return controller.inventory()

    @api.get("/status")
    def status():
        return invoke(controller.status)

    @api.post("/connect")
    def connect(request: ConnectRequest, token: str | None = Header(None, alias="X-THOTH-Mount-Token")):
        return invoke(controller.connect, request.adapter_id, token)

    @api.post("/arm")
    def arm(request: ArmRequest, token: str | None = Header(None, alias="X-THOTH-Mount-Token")):
        return invoke(controller.arm, request.aligned_ack, token)

    @api.post("/plan")
    def plan(request: PlanRequest):
        return invoke(controller.prepare_plan, **request.model_dump())

    @api.post("/track")
    def track(request: TrackRequest, token: str | None = Header(None, alias="X-THOTH-Mount-Token")):
        return invoke(controller.track, request.plan_id, token)

    @api.post("/heartbeat")
    def heartbeat(token: str | None = Header(None, alias="X-THOTH-Mount-Token")):
        return invoke(controller.heartbeat, token)

    @api.post("/stop")
    def stop(token: str | None = Header(None, alias="X-THOTH-Mount-Token")):
        return invoke(controller.stop, token)

    @api.post("/disconnect")
    def disconnect(token: str | None = Header(None, alias="X-THOTH-Mount-Token")):
        return invoke(controller.disconnect, token)

    return api


router = create_mount_router()
