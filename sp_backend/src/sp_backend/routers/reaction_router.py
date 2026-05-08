from fastapi import APIRouter, Depends, Path, status, Query
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.dependencies.auth import get_current_user
from sp_backend.schemas.user.user_claims import UserClaims
from sp_backend.constants.content_type import ContentType
from sp_backend.schemas.reaction.reaction_schema import (
    ReactionResponse,
)
from sp_backend.services.reaction.like_content_service import LikeContentService
from sp_backend.services.reaction.unlike_content_service import UnlikeContentService

router = APIRouter(tags=["Reaction"], prefix="/like")


@router.post(
    "/{content_type}/{content_id}",
    status_code=status.HTTP_201_CREATED,
    response_class=JSONResponse,
)
async def like_content(
    request: Request,
    content_type: ContentType = Path(..., description="Type of content to like"),
    content_id: int = Path(..., description="ID of the content to like"),
    current_user: UserClaims = Depends(get_current_user),
) -> ReactionResponse:
    service = LikeContentService(
        db_session=request.state.db,
        content_type=content_type,
        content_id=content_id,
        user_id=current_user.id,
    )
    reaction_response: ReactionResponse = service.invoke()
    return reaction_response


@router.delete(
    "/{content_type}/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=JSONResponse,
)
async def unlike_content(
    request: Request,
    content_type: ContentType = Path(..., description="Type of content to unlike"),
    content_id: int = Path(..., description="ID of the content to unlike"),
    current_user: UserClaims = Depends(get_current_user),
):
    service = UnlikeContentService(
        db_session=request.state.db,
        content_type=content_type,
        content_id=content_id,
        user_id=current_user.id,
    )
    service.invoke()
