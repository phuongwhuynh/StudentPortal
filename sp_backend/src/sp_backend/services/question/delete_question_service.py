from sqlalchemy.orm import Session
from sp_backend.models.question import Question
from sp_backend.models.content_daily_view import ContentDailyView
from sp_backend.models.reaction import Reaction
from sp_backend.models.comment import Comment
from sp_backend.models.user import User
from sp_backend.constants.user import UserRole
from sp_backend.services.question.exception import QuestionNotFoundException
from sp_backend.services.user.exception import (
    PermissionException,
    UserNotFoundException,
)
from typing import Optional
from sp_backend.constants.content_type import ContentType


class DeleteQuestionService:
    def __init__(self, question_id: int, user_id: int, db_session: Session):
        self.question_id = question_id
        self.user_id = user_id
        self.db_session = db_session
        self.question: Optional[Question] = None
        self.user: Optional[User] = None
        self.reactions: Optional[list[Reaction]] = None
        self.comments: Optional[list[Comment]] = None
        self.content_daily_view: Optional[list[ContentDailyView]] = None

    def validate_request(self):
        self.question: Question = (
            self.db_session.query(Question).filter_by(id=self.question_id).first()
        )
        if not self.question:
            raise QuestionNotFoundException(question_id=self.question_id)

        self.user: User = self.db_session.query(User).filter_by(id=self.user_id).first()
        if not self.user:
            raise UserNotFoundException(user_id=self.user_id)

        if self.user.role != UserRole.STAFF:
            raise PermissionException(
                "You do not have permission to delete this question."
            )

    def get_relevant_data(self):
        self.reactions = (
            self.db_session.query(Reaction)
            .filter(Reaction.content_type == ContentType.QUESTION)
            .filter(Reaction.content_id == self.question_id)
            .all()
        )
        self.comments = (
            self.db_session.query(Comment)
            .filter(Comment.content_type == ContentType.QUESTION)
            .filter(Comment.content_id == self.question_id)
            .all()
        )
        self.content_daily_view = (
            self.db_session.query(ContentDailyView)
            .filter(ContentDailyView.content_type == ContentType.QUESTION)
            .filter(ContentDailyView.content_id == self.question_id)
            .all()
        )

    def delete_question(self):
        try:
            # Delete reactions
            for reaction in self.reactions:
                self.db_session.delete(reaction)

            # Delete comments
            for comment in self.comments:
                self.db_session.delete(comment)

            # Delete content daily views
            for view in self.content_daily_view:
                self.db_session.delete(view)

            # Finally, delete the question
            self.db_session.delete(self.question)
            self.db_session.commit()
        except Exception as e:
            self.db_session.rollback()
            raise e

    def invoke(self):
        self.validate_request()
        self.get_relevant_data()
        self.delete_question()
