from sqlalchemy.orm import Session, joinedload
from sp_backend.schemas.question.create_question_schema import (
    ResolveQuestionResponse,
    PosterInfo,
)
from sp_backend.models.user import User
from sp_backend.models.question import Question
from sp_backend.constants.question import QuestionStatus, QuestionCategory
from sp_backend.services.question.exception import QuestionNotFoundException
from sp_backend.services.user.exception import (
    UserNotFoundException,
    PermissionException,
)
from datetime import datetime, timezone
from sp_backend.constants.user import UserRole


class ResolveQuestionService:
    def __init__(
        self,
        db_session: Session,
        question_id: int,
        user_id: int,
    ):
        self.db_session: Session = db_session
        self.question_id: int = question_id
        self.user_id: int = user_id
        self.question: Question = None
        self.user: User = None

    def validate_request(self) -> None:
        self.question = (
            self.db_session.query(Question)
            .options(joinedload(Question.poster))
            .filter(Question.id == self.question_id)
            .first()
        )
        if not self.question:
            raise QuestionNotFoundException(self.question_id)

        self.user = self.db_session.get(User, self.user_id)
        if not self.user:
            raise UserNotFoundException()
        if self.user.role != UserRole.STAFF:
            raise PermissionException()

    def resolve_question(self) -> None:
        self.question.status = QuestionStatus.COMPLETED
        self.question.completed_at = datetime.now(timezone.utc)
        self.question.completed_by = self.user.id
        try:
            self.db_session.add(self.question)
            self.db_session.commit()
            self.db_session.refresh(self.question)
        except Exception as e:
            self.db_session.rollback()
            raise e

    def invoke(self) -> ResolveQuestionResponse:
        self.validate_request()
        self.resolve_question()
        return ResolveQuestionResponse(
            id=self.question.id,
            title=self.question.title,
            category=self.question.category,
            status=self.question.status,
            body=self.question.body,
            posted_by=PosterInfo(
                id=self.question.poster.id,
                full_name=self.question.poster.full_name,
                role=self.question.poster.role,
            ),
            views_count=self.question.views_count,
            likes_count=self.question.likes_count,
            comments_count=self.question.comments_count,
            created_at=self.question.created_at,
            completed_at=self.question.completed_at,
            completer=PosterInfo(
                id=self.user.id,
                full_name=self.user.full_name,
                role=self.user.role,
            ),
        )
