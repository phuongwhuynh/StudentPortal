from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.schemas.forum.create_forum_schema import (
    CreateForumRequest,
    CreateForumResponse,
)
from sp_backend.dependencies.auth import get_current_user

router = APIRouter(tags=["Forum"], prefix="/forums")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_forum(
    request: Request,
    create_forum_request: CreateForumRequest,
    current_user=Depends(get_current_user),
) -> CreateForumResponse:
    pass
