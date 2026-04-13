from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.announcement.create_announcement_schema import (
    CreateAnnouncementRequest,
    CreateAnnouncementResponse,
)

from sp_backend.dependencies.auth import get_current_user
from sp_backend.services.announcement.create_announcement_service import (
    CreateAnnouncementService,
)

router = APIRouter(tags=["Announcement"], prefix="/announcements")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_announcement(
    request: Request,
    create_announcement_request: CreateAnnouncementRequest,
    current_user=Depends(get_current_user),
) -> CreateAnnouncementResponse:
    service = CreateAnnouncementService(
        db_session=request.state.db_session,
        create_announcement_request=create_announcement_request,
        user_id=current_user.id,
    )
    create_announcement_response: CreateAnnouncementResponse = service.invoke()
    return create_announcement_response
