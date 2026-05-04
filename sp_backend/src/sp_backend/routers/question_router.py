from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.dependencies.auth import get_current_user
from sp_backend.schemas.question.create_question_schema import (
    CreateQuestionRequest,
    CreateQuestionResponse,
)
from sp_backend.services.question.create_question_service import CreateQuestionService

router = APIRouter(tags=["Question"], prefix="/question")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_question(
    request: Request,
    create_question_request: CreateQuestionRequest,
    current_user=Depends(get_current_user),
) -> CreateQuestionResponse:
    service = CreateQuestionService(
        db_session=request.state.db_session,
        create_question_request=create_question_request,
        user_id=current_user.id,
    )
    create_question_response: CreateQuestionResponse = service.invoke()
    return create_question_response
