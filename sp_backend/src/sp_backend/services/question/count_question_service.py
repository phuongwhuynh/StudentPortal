from sqlalchemy.orm import Session
from sp_backend.models.question import Question
from sp_backend.constants.question import QuestionStatus
from datetime import date, timedelta, datetime
from typing import Optional
from sp_backend.schemas.question.get_question_schema import (
    CountQuestionsResponse,
)


class CountQuestionService:
    def __init__(
        self,
        db_session: Session,
        posted_on: Optional[date] = None,
        status: Optional[QuestionStatus] = None,
    ):
        self.db_session: Session = db_session
        self.posted_on: Optional[date] = posted_on
        self.status: Optional[QuestionStatus] = status
        self.count: Optional[int] = None

    def get_questions_count(self):
        query = self.db_session.query(Question)
        if self.posted_on:
            start = datetime.combine(self.posted_on, datetime.min.time())
            end = start + timedelta(days=1)
            query = query.filter(
                Question.created_at >= start,
                Question.created_at < end,
            )
        if self.status:
            query = query.filter(Question.status == self.status)

        self.count = query.count()

    def invoke(self) -> CountQuestionsResponse:
        self.get_questions_count()
        return CountQuestionsResponse(count=self.count)
