from fastapi import APIRouter, Depends, status, Query, Path
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.announcement.create_announcement_schema import (
    CreateAnnouncementRequest,
    CreateAnnouncementResponse,
)

from sp_backend.dependencies.auth import get_current_user, get_current_user_optional
from sp_backend.services.announcement.count_announcement_service import (
    CountAnnouncementService,
)
from sp_backend.services.announcement.create_announcement_service import (
    CreateAnnouncementService,
)
from sp_backend.services.announcement.get_announcement_service import (
    GetAnnouncementService,
)
from sp_backend.schemas.announcement.get_announcement_schema import (
    GetAnnouncementResponse,
    ListAnnouncementsResponse,
    CountAnnouncementsResponse,
)
from typing import Optional
from sp_backend.schemas.user.user_claims import UserClaims
from sp_backend.constants.announcement import (
    SortOptions,
    AnnouncementCategory,
    AnnouncementPriority,
)
from sp_backend.services.announcement.list_announcement_service import (
    ListAnnouncementService,
)
from datetime import date

router = APIRouter(tags=["Announcement"], prefix="/announcement")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_announcement(
    request: Request,
    create_announcement_request: CreateAnnouncementRequest,
    current_user: UserClaims = Depends(get_current_user),
) -> CreateAnnouncementResponse:
    service = CreateAnnouncementService(
        db_session=request.state.db,
        create_announcement_request=create_announcement_request,
        user_id=current_user.id,
    )
    create_announcement_response: CreateAnnouncementResponse = service.invoke()
    return create_announcement_response


@router.get("/categories", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_announcement_categories(
    request: Request,
) -> list[AnnouncementCategory]:
    return [category for category in AnnouncementCategory]


@router.get("/priorities", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_announcement_priorities(
    request: Request,
) -> list[AnnouncementPriority]:
    return [priority for priority in AnnouncementPriority]


@router.get("/count", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def count_announcements(
    request: Request,
    priority: Optional[AnnouncementPriority] = Query(
        None, description="Filter announcements by this priority"
    ),
    has_expired: Optional[bool] = Query(
        None, description="Filter announcements based on whether they have expired"
    ),
    posted_on: Optional[date] = Query(
        None, description="Filter announcements posted on this date (YYYY-MM-DD)"
    ),
) -> CountAnnouncementsResponse:
    service = CountAnnouncementService(
        db_session=request.state.db,
        priority=priority,
        has_expired=has_expired,
        posted_on=posted_on,
    )
    count_announcements_response: CountAnnouncementsResponse = service.invoke()
    return count_announcements_response


@router.get(
    "/{announcement_id}", status_code=status.HTTP_200_OK, response_class=JSONResponse
)
async def get_announcement(
    request: Request,
    announcement_id: int = Path(
        ..., description="The ID of the announcement to retrieve", examples=1
    ),
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
) -> GetAnnouncementResponse:
    service = GetAnnouncementService(
        db_session=request.state.db,
        announcement_id=announcement_id,
        user_id=current_user.id if current_user else None,
    )
    get_announcement_response: GetAnnouncementResponse = service.invoke()
    return get_announcement_response


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_announcements(
    request: Request,
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
    sort_by: SortOptions = Query(
        SortOptions.RECENT,
        description="Sort announcements by this criteria",
    ),
    category: Optional[AnnouncementCategory] = Query(
        None, description="Filter announcements by this category"
    ),
    priority: Optional[AnnouncementPriority] = Query(
        None, description="Filter announcements by this priority"
    ),
    has_expired: Optional[bool] = Query(
        None, description="Filter announcements based on whether they have expired"
    ),
    search: Optional[str] = Query(
        None,
        min_length=2,
        max_length=200,
        description="Search announcements by title or body",
    ),
    limit: int = Query(
        10, ge=1, le=100, description="Number of announcements to return"
    ),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
) -> ListAnnouncementsResponse:
    service = ListAnnouncementService(
        db_session=request.state.db,
        sort_by=sort_by,
        category=category,
        priority=priority,
        has_expired=has_expired,
        search=search,
        limit=limit,
        offset=offset,
        user_id=current_user.id if current_user else None,
    )
    announcement_list_response: ListAnnouncementsResponse = service.invoke()
    return announcement_list_response
