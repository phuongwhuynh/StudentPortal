from datetime import date

from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.forum.create_forum_schema import (
    CreateForumRequest,
    CreateForumResponse,
)
from sp_backend.schemas.forum.get_forum_schema import (
    ForumListResponse,
    GetForumResponse,
    CountForumResponse,
)
from sp_backend.dependencies.auth import get_current_user, get_current_user_optional
from sp_backend.schemas.user.user_claims import UserClaims
from sp_backend.services.forum.create_forum_service import CreateForumService
from sp_backend.services.forum.list_forum_service import ListForumService
from sp_backend.services.forum.get_forum_service import GetForumService
from sp_backend.services.forum.count_forum_service import (
    CountForumService,
)
from sp_backend.constants.forum import SortOptions, ForumCategory
from typing import Optional

router = APIRouter(tags=["Forum"], prefix="/forum")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_forum(
    request: Request,
    create_forum_request: CreateForumRequest,
    current_user: UserClaims = Depends(get_current_user),
) -> CreateForumResponse:
    service = CreateForumService(
        db_session=request.state.db,
        create_forum_request=create_forum_request,
        user_id=current_user.id,
    )
    create_forum_response: CreateForumResponse = service.invoke()
    return create_forum_response


@router.get("/count", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def get_todays_forums_count(
    request: Request,
    posted_on: Optional[date] = Query(
        date.today(),
        description="Get count of forums posted on this day (defaults to today)",
    ),
) -> CountForumResponse:
    service = CountForumService(db_session=request.state.db, posted_on=posted_on)
    count: int = service.invoke()
    return CountForumResponse(count=count)


@router.get("/categories", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_forum_categories(
    request: Request,
) -> list[ForumCategory]:
    return [category for category in ForumCategory]


@router.get("/{forum_id}", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def get_forum_details(
    request: Request,
    forum_id: int,
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
) -> GetForumResponse:
    service = GetForumService(
        db_session=request.state.db,
        forum_id=forum_id,
        user_id=current_user.id if current_user else None,
    )
    forum_response: GetForumResponse = service.invoke()
    return forum_response


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_forums(
    request: Request,
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
    sort_by: SortOptions = Query(
        SortOptions.RECENT, description="Sort forums by this criteria"
    ),
    category: Optional[ForumCategory] = Query(
        None, description="Filter forums by this category"
    ),
    search: Optional[str] = Query(
        None, min_length=2, max_length=200, description="Search forums by title or body"
    ),
    limit: int = Query(10, ge=1, le=100, description="Number of forums to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
) -> ForumListResponse:
    service = ListForumService(
        db_session=request.state.db,
        sort_by=sort_by,
        category=category,
        search=search,
        limit=limit,
        offset=offset,
        user_id=current_user.id if current_user else None,
    )
    forum_list_response: ForumListResponse = service.invoke()
    return forum_list_response
