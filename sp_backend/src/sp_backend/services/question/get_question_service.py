from sp_backend.models.question import Question
from sp_backend.models.reaction import Reaction
from sqlalchemy.orm import Session, joinedload
from sp_backend.schemas.question.get_question_schema import (
    QuestionPoster,
    QuestionAnswerer,
    GetQuestionResponse,
)
from typing import Optional
from sp_backend.services.question.exception import QuestionNotFoundException
from sp_backend.constants.content_type import ContentType
from sp_backend.models.content_daily_view import ContentDailyView
from datetime import date


class GetQuestionService:
    def __init__(
        self,
        db_session: Session,
        question_id: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.question_id: int = question_id
        self.user_id: Optional[int] = user_id
        self.question_response: Optional[GetQuestionResponse] = None
        self.question: Optional[Question] = None
        self.user_liked: Optional[bool] = None

    def get_question(self) -> Question:
        self.question: Optional[Question] = (
            self.db_session.query(Question)
            .options(
                joinedload(Question.poster),
                joinedload(Question.completer),
            )
            .filter(Question.id == self.question_id)
            .first()
        )
        if not self.question:
            raise QuestionNotFoundException(question_id=self.question_id)

    def get_user_reaction(self):
        if self.user_id is None:
            self.user_liked = False
            return

        reaction: Optional[Reaction] = (
            self.db_session.query(Reaction)
            .filter(
                Reaction.content_id == self.question_id,
                Reaction.content_type == ContentType.QUESTION,
                Reaction.user_id == self.user_id,
            )
            .first()
        )
        self.user_liked = reaction is not None

    def update_views_count(self):
        # Increment the views count of the question
        self.question.views_count += 1
        today = date.today()
        content_daily_view = (
            self.db_session.query(ContentDailyView)
            .filter(
                ContentDailyView.content_id == self.question_id,
                ContentDailyView.content_type == ContentType.QUESTION,
                ContentDailyView.content_date == today,
            )
            .first()
        )
        if content_daily_view:
            content_daily_view.views_count += 1
        else:
            content_daily_view = ContentDailyView(
                content_id=self.question_id,
                content_type=ContentType.QUESTION,
                content_date=today,
                views_count=1,
            )

        try:
            self.db_session.add(self.question)
            self.db_session.add(content_daily_view)
            self.db_session.commit()
            self.db_session.refresh(self.question)
            self.db_session.refresh(content_daily_view)
        except Exception as e:
            self.db_session.rollback()
            raise e

    def build_response(self):
        poster = QuestionPoster(
            id=self.question.poster.id,
            name=self.question.poster.full_name,
            role=self.question.poster.role,
        )
        answerer = (
            QuestionAnswerer(
                id=self.question.completer.id,
                name=self.question.completer.full_name,
                role=self.question.completer.role,
            )
            if self.question.completer
            else None
        )
        self.question_response = GetQuestionResponse(
            id=self.question.id,
            title=self.question.title,
            body=self.question.body,
            category=self.question.category,
            status=self.question.status,
            posted_by=poster,
            answerer=answerer,
            completed_at=self.question.completed_at,
            created_at=self.question.created_at,
            views_count=self.question.views_count,
            likes_count=self.question.likes_count,
            comments_count=self.question.comments_count,
            has_liked=self.user_liked,
        )

    def invoke(self) -> GetQuestionResponse:
        self.get_question()
        self.get_user_reaction()
        self.update_views_count()
        self.build_response()
        return self.question_response
