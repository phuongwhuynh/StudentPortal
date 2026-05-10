from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.dependencies.auth import get_current_user
from sp_backend.schemas.comment.create_comment_schema import (
    CreateCommentRequest,
    CreateCommentResponse,
)
from sp_backend.schemas.comment.get_comment_schema import ListCommentsResponse
from sp_backend.constants.content_type import ContentType
from sp_backend.services.comment.create_comment_service import CreateCommentService
from sp_backend.services.comment.get_comments_of_content_service import (
    GetCommentsOfContentService,
)
from sp_backend.services.comment.get_replies_of_comment_service import (
    GetCommentsOfContentService as GetRepliesOfCommentService,
)
from sp_backend.services.comment.exception import (
    ContentNotFoundException,
    CommentNotFoundException,
)

router = APIRouter(tags=["Comment"], prefix="/comment")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_comment(
    request: Request,
    create_comment_request: CreateCommentRequest,
    current_user=Depends(get_current_user),
) -> CreateCommentResponse:
    service = CreateCommentService(
        db_session=request.state.db,
        comment=create_comment_request.comment,
        content_id=create_comment_request.content_id,
        content_type=create_comment_request.content_type,
        parent_comment_id=create_comment_request.parent_comment_id,
        user_id=current_user.id,
    )
    create_comment_response: CreateCommentResponse = service.invoke()
    return create_comment_response


@router.get(
    "/{content_type}/{content_id}/",
    status_code=status.HTTP_200_OK,
)
async def get_comments_of_content(
    request: Request,
    content_type: ContentType,
    content_id: int,
) -> ListCommentsResponse:
    service = GetCommentsOfContentService(
        db_session=request.state.db, content_type=content_type, content_id=content_id
    )
    try:
        result = service.invoke()
        return JSONResponse(content=jsonable_encoder(result))
    except ContentNotFoundException as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})


@router.get(
    "/{parent_comment_id}/replies",
    status_code=status.HTTP_200_OK,
    response_class=JSONResponse,
)
async def get_replies_of_comment(
    request: Request, parent_comment_id: int
) -> ListCommentsResponse:
    service = GetRepliesOfCommentService(
        db_session=request.state.db, parent_comment_id=parent_comment_id
    )
    try:
        result = service.invoke()
        return JSONResponse(content=jsonable_encoder(result))
    except CommentNotFoundException as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
