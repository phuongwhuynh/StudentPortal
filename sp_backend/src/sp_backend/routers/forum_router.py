from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.forum.create_forum_schema import (
    CreateForumRequest,
    CreateForumResponse,
)
from sp_backend.dependencies.auth import get_current_user
from sp_backend.services.forum.create_forum_service import CreateForumService

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
