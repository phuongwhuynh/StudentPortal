from fastapi import APIRouter, Depends, status, Path, Query, Response
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from sp_backend.dependencies.auth import get_current_user, get_current_user_optional
from sp_backend.schemas.question.create_question_schema import (
    CreateQuestionRequest,
    CreateQuestionResponse,
    ResolveQuestionResponse,
)
from sp_backend.schemas.question.get_question_schema import (
    GetQuestionResponse,
    ListQuestionsResponse,
    CountQuestionsResponse,
)
from sp_backend.schemas.user.user_claims import UserClaims
from sp_backend.services.question.create_question_service import CreateQuestionService
from sp_backend.constants.question import QuestionCategory, QuestionStatus, SortOptions
from sp_backend.services.question.delete_question_service import DeleteQuestionService
from sp_backend.services.question.get_question_service import GetQuestionService
from sp_backend.services.question.list_question_service import ListQuestionService
from sp_backend.services.question.resolve_question_service import ResolveQuestionService
from typing import Optional
from datetime import date
from sp_backend.services.question.count_question_service import CountQuestionService

router = APIRouter(tags=["Question"], prefix="/question")


@router.post("/", status_code=status.HTTP_201_CREATED, response_class=JSONResponse)
async def create_question(
    request: Request,
    create_question_request: CreateQuestionRequest,
    current_user: UserClaims = Depends(get_current_user),
) -> CreateQuestionResponse:
    service = CreateQuestionService(
        db_session=request.state.db,
        create_question_request=create_question_request,
        user_id=current_user.id,
    )
    create_question_response: CreateQuestionResponse = service.invoke()
    return create_question_response


@router.post(
    "/resolve/{question_id}",
    status_code=status.HTTP_200_OK,
    response_class=JSONResponse,
)
async def resolve_question(
    request: Request,
    question_id: int = Path(..., description="The ID of the question to resolve"),
    current_user: UserClaims = Depends(get_current_user),
) -> ResolveQuestionResponse:
    service = ResolveQuestionService(
        db_session=request.state.db,
        question_id=question_id,
        user_id=current_user.id,
    )
    resolve_question_response: ResolveQuestionResponse = service.invoke()
    return resolve_question_response


@router.get("/categories", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_question_categories(
    request: Request,
) -> list[QuestionCategory]:
    return [category for category in QuestionCategory]


@router.get("/statuses", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_question_statuses(
    request: Request,
) -> list[QuestionStatus]:
    return [status for status in QuestionStatus]


@router.get(
    "/sort-options", status_code=status.HTTP_200_OK, response_class=JSONResponse
)
async def list_question_sort_options(
    request: Request,
) -> list[SortOptions]:
    return [option for option in SortOptions]


@router.get("/count", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def count_questions(
    request: Request,
    status: Optional[QuestionStatus] = Query(
        None, description="Filter questions by status"
    ),
    posted_on: Optional[date] = Query(
        None, description="Filter questions posted on this date (YYYY-MM-DD)"
    ),
) -> CountQuestionsResponse:
    service = CountQuestionService(
        db_session=request.state.db,
        status=status,
        posted_on=posted_on,
    )
    return service.invoke()


@router.get(
    "/{question_id}", status_code=status.HTTP_200_OK, response_class=JSONResponse
)
async def get_question(
    request: Request,
    question_id: int = Path(..., description="The ID of the question to retrieve"),
    increment_views: bool = Query(
        False,
        description="Whether to increment the view counter for this request",
    ),
    current_user: Optional[UserClaims] = Depends(get_current_user_optional),
) -> GetQuestionResponse:
    service = GetQuestionService(
        db_session=request.state.db,
        question_id=question_id,
        user_id=current_user.id if current_user else None,
    )
    service.increment_views = increment_views
    get_question_response: GetQuestionResponse = service.invoke()
    return get_question_response


@router.post("/{question_id}/view", status_code=status.HTTP_204_NO_CONTENT)
async def increment_question_view(
    request: Request,
    question_id: int,
):
    service = GetQuestionService(db_session=request.state.db, question_id=question_id)
    try:
        service.get_question()
        service.update_views_count()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Question not found"},
        )


@router.get("/", status_code=status.HTTP_200_OK, response_class=JSONResponse)
async def list_questions(
    request: Request,
    sort_by: SortOptions = Query(
        SortOptions.RECENT,
        description="The sorting option for the questions (default: RECENT)",
    ),
    category: Optional[QuestionCategory] = Query(
        None, description="Filter questions by category"
    ),
    status: Optional[QuestionStatus] = Query(
        None, description="Filter questions by status"
    ),
    search: Optional[str] = Query(
        None, description="Search questions by keyword in title or body"
    ),
    limit: int = Query(
        10, ge=1, le=100, description="The number of questions to return"
    ),
    offset: int = Query(
        0, ge=0, description="The number of questions to skip for pagination"
    ),
    current_user=Depends(get_current_user_optional),
) -> ListQuestionsResponse:
    service = ListQuestionService(
        db_session=request.state.db,
        sort_by=sort_by,
        category=category,
        status=status,
        search=search,
        limit=limit,
        offset=offset,
        user_id=current_user.id if current_user else None,
    )
    question_list_response: ListQuestionsResponse = service.invoke()
    return question_list_response


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    request: Request,
    question_id: int = Path(..., description="The ID of the question to delete"),
    current_user: UserClaims = Depends(get_current_user),
):
    service = DeleteQuestionService(
        db_session=request.state.db,
        question_id=question_id,
        user_id=current_user.id,
    )
    service.invoke()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
