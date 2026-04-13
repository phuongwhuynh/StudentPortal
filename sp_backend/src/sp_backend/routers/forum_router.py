from fastapi import APIRouter, Depends, status, Query
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.forum.create_forum_schema import (
    CreateForumRequest,
    CreateForumResponse,
)
from sp_backend.schemas.forum.forum_list_schema import ForumListResponse
from sp_backend.dependencies.auth import get_current_user
from sp_backend.services.forum.create_forum_service import CreateForumService
from sp_backend.constants.forum import SortOptions, ForumCategory
from typing import Optional

router = APIRouter(tags=["Forum"], prefix="/forums")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_forum(
    request: Request,
    create_forum_request: CreateForumRequest,
    current_user=Depends(get_current_user),
) -> CreateForumResponse:
    service = CreateForumService(
        db_session=request.state.db,
        create_forum_request=create_forum_request,
        user_id=current_user.id,
    )
    create_forum_response: CreateForumResponse = service.invoke()
    return create_forum_response


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_forums(
    request: Request,
    sort_by: Optional[SortOptions] = Query(
        SortOptions.RECENT, description="Sort forums by this criteria"
    ),
    category: Optional[ForumCategory] = Query(
        None, description="Filter forums by this category"
    ),
    limit: Optional[int] = Query(10, description="Number of forums to return"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    search: Optional[str] = Query(None, description="Search forums by title or body"),
) -> ForumListResponse:
    pass
