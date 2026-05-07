from sqlalchemy.orm import Session
from sp_backend.schemas.question.create_question_schema import (
    CreateQuestionRequest,
    CreateQuestionResponse,
    PosterInfo,
)
from sp_backend.models.user import User
from sp_backend.models.question import Question
from sp_backend.services.user.exception import UserNotFoundException
from sp_backend.services.embedding.embedding_service import EmbeddingService


class CreateQuestionService:
    def __init__(
        self,
        db_session: Session,
        create_question_request: CreateQuestionRequest,
        user_id: int,
    ):
        self.db_session: Session = db_session
        self.create_question_request: CreateQuestionRequest = create_question_request
        self.user_id: int = user_id
        self.embedding: list[float] = []
        self.question: Question = None
        self.user: User = None

    def validate_request(self) -> None:
        self.user = self.db_session.get(User, self.user_id)
        if not self.user:
            raise UserNotFoundException()

    def generate_embedding(self) -> None:
        self.embedding = EmbeddingService.get_embedding(
            text=self.create_question_request.title
            + " "
            + self.create_question_request.body
        )

    def create_question(self) -> None:
        self.question = Question(
            title=self.create_question_request.title,
            body=self.create_question_request.body,
            body_embedding=self.embedding,
            category=self.create_question_request.category,
            posted_by=self.user_id,
        )
        try:
            self.db_session.add(self.question)
            self.db_session.commit()
            self.db_session.refresh(self.question)
        except:
            self.db_session.rollback()
            raise

    def invoke(self) -> CreateQuestionResponse:
        self.validate_request()
        self.generate_embedding()
        self.create_question()
        return CreateQuestionResponse(
            id=self.question.id,
            title=self.question.title,
            body=self.question.body,
            category=self.question.category,
            status=self.question.status,
            posted_by=PosterInfo(
                id=self.user.id,
                full_name=self.user.full_name,
                role=self.user.role,
            ),
            views_count=self.question.views_count,
            likes_count=self.question.likes_count,
            comments_count=self.question.comments_count,
            created_at=self.question.created_at,
        )
