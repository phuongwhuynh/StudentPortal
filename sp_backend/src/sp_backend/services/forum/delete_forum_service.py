from sqlalchemy.orm import Session
from sp_backend.models.forum import Forum
from sp_backend.models.content_daily_view import ContentDailyView
from sp_backend.models.reaction import Reaction
from sp_backend.models.comment import Comment
from sp_backend.models.user import User
from sp_backend.constants.user import UserRole
from sp_backend.services.forum.exception import ForumNotFoundException
from sp_backend.services.user.exception import (
    PermissionException,
    UserNotFoundException,
)
from typing import Optional
from sp_backend.constants.content_type import ContentType


class DeleteForumService:
    def __init__(self, forum_id: int, user_id: int, db_session: Session):
        self.forum_id = forum_id
        self.user_id = user_id
        self.db_session = db_session
        self.forum: Optional[Forum] = None
        self.user: Optional[User] = None
        self.reactions: Optional[list[Reaction]] = None
        self.comments: Optional[list[Comment]] = None
        self.content_daily_view: Optional[list[ContentDailyView]] = None

    def validate_request(self):
        self.forum: Forum = (
            self.db_session.query(Forum).filter_by(id=self.forum_id).first()
        )
        if not self.forum:
            raise ForumNotFoundException(forum_id=self.forum_id)

        self.user: User = self.db_session.query(User).filter_by(id=self.user_id).first()
        if not self.user:
            raise UserNotFoundException(user_id=self.user_id)

        if self.user.role != UserRole.STAFF:
            raise PermissionException(
                "You do not have permission to delete this forum."
            )

    def get_relevant_data(self):
        # For delete operation, we may not need to fetch additional data
        self.reactions = (
            self.db_session.query(Reaction)
            .filter(Reaction.content_type == ContentType.FORUM)
            .filter(Reaction.content_id == self.forum_id)
            .all()
        )
        self.comments = (
            self.db_session.query(Comment)
            .filter(Comment.content_type == ContentType.FORUM)
            .filter(Comment.content_id == self.forum_id)
            .all()
        )
        self.content_daily_view = (
            self.db_session.query(ContentDailyView)
            .filter(ContentDailyView.content_type == ContentType.FORUM)
            .filter(ContentDailyView.content_id == self.forum_id)
            .all()
        )

    def delete_forum(self):
        try:
            for reaction in self.reactions:
                self.db_session.delete(reaction)
            for comment in self.comments:
                self.db_session.delete(comment)
            for view in self.content_daily_view:
                self.db_session.delete(view)
            self.db_session.delete(self.forum)
            self.db_session.commit()
        except Exception as e:
            self.db_session.rollback()
            raise e

    def invoke(self):
        self.validate_request()
        self.get_relevant_data()
        self.delete_forum()
