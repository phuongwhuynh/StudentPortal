from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.announcement.create_announcement_schema import (
    CreateAnnouncementRequest,
    CreateAnnouncementResponse,
)

from sp_backend.dependencies.auth import get_current_user

router = APIRouter(tags=["Announcement"], prefix="/announcements")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_announcement(
    request: Request,
    create_announcement_request: CreateAnnouncementRequest,
    current_user=Depends(get_current_user),
) -> CreateAnnouncementResponse:
    pass
