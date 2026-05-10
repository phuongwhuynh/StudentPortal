from datetime import date

from fastapi import APIRouter, Depends, Path, status, Query, Response
from fastapi.encoders import jsonable_encoder
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
from sp_backend.constants.content_type import ContentType
from sp_backend.services.comment.get_comments_of_content_service import (
    GetCommentsOfContentService,
)
from sp_backend.constants.forum import SortOptions, ForumCategory
from typing import Optional
from sp_backend.services.forum.delete_forum_service import DeleteForumService

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


@router.get(
    "/sort-options", status_code=status.HTTP_200_OK, response_class=JSONResponse
)
async def list_forum_sort_options(
    request: Request,
) -> list[SortOptions]:
    return [option for option in SortOptions]


@router.get("/{forum_id}", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def get_forum_details(
    request: Request,
    forum_id: int,
    increment_views: bool = Query(
        False,
        description="Whether to increment the view counter for this request",
    ),
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
) -> GetForumResponse:
    service = GetForumService(
        db_session=request.state.db,
        forum_id=forum_id,
        user_id=current_user.id if current_user else None,
    )
    service.increment_views = increment_views
    forum_response: GetForumResponse = service.invoke()
    # also fetch top-level comments for the forum to return together
    try:
        comments_service = GetCommentsOfContentService(
            db_session=request.state.db, content_type=ContentType.FORUM, content_id=forum_id
        )
        comments_result = comments_service.invoke()
        payload = forum_response.dict()
        payload["comments"] = [c.dict() for c in comments_result.comments]
        return JSONResponse(content=jsonable_encoder(payload))
    except Exception:
        return JSONResponse(content=jsonable_encoder(forum_response.dict()))


@router.post("/{forum_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def increment_forum_view(
    request: Request,
    forum_id: int,
):
    service = GetForumService(db_session=request.state.db, forum_id=forum_id)
    try:
        service.get_forum()
        service.update_views_count()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": "Forum not found"})


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
    limit: int = Query(1000, ge=1, le=1000, description="Number of forums to return"),
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


@router.delete("/{forum_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_forum(
    request: Request,
    forum_id: int = Path(..., description="The ID of the forum to delete", examples=1),
    current_user: UserClaims = Depends(get_current_user),
):
    service = DeleteForumService(
        db_session=request.state.db,
        forum_id=forum_id,
        user_id=current_user.id,
    )
    service.invoke()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
