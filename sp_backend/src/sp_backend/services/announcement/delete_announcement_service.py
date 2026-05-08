from sqlalchemy.orm import Session
from sp_backend.models.announcement import Announcement
from sp_backend.models.content_daily_view import ContentDailyView
from sp_backend.models.reaction import Reaction
from sp_backend.models.comment import Comment
from sp_backend.models.user import User
from sp_backend.constants.user import UserRole
from sp_backend.services.announcement.exception import AnnouncementNotFoundException
from sp_backend.services.user.exception import (
    PermissionException,
    UserNotFoundException,
)
from typing import Optional
from sp_backend.constants.content_type import ContentType


class DeleteAnnouncementService:
    def __init__(self, announcement_id: int, user_id: int, db_session: Session):
        self.announcement_id = announcement_id
        self.user_id = user_id
        self.db_session = db_session
        self.announcement: Optional[Announcement] = None
        self.user: Optional[User] = None
        self.reactions: Optional[list[Reaction]] = None
        self.comments: Optional[list[Comment]] = None
        self.content_daily_view: Optional[list[ContentDailyView]] = None

    def validate_request(self):
        self.announcement: Announcement = (
            self.db_session.query(Announcement)
            .filter_by(id=self.announcement_id)
            .first()
        )
        if not self.announcement:
            raise AnnouncementNotFoundException(announcement_id=self.announcement_id)

        self.user: User = self.db_session.query(User).filter_by(id=self.user_id).first()
        if not self.user:
            raise UserNotFoundException(user_id=self.user_id)

        if self.user.role != UserRole.STAFF:
            raise PermissionException(
                "You do not have permission to delete this announcement."
            )

    def get_relevant_data(self):
        self.reactions = (
            self.db_session.query(Reaction)
            .filter(Reaction.content_type == ContentType.ANNOUNCEMENT)
            .filter(Reaction.content_id == self.announcement_id)
            .all()
        )
        self.comments = (
            self.db_session.query(Comment)
            .filter(Comment.content_type == ContentType.ANNOUNCEMENT)
            .filter(Comment.content_id == self.announcement_id)
            .all()
        )
        self.content_daily_view = (
            self.db_session.query(ContentDailyView)
            .filter(ContentDailyView.content_type == ContentType.ANNOUNCEMENT)
            .filter(ContentDailyView.content_id == self.announcement_id)
            .all()
        )

    def delete_announcement(self):
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

            # Finally, delete the announcement
            self.db_session.delete(self.announcement)
            self.db_session.commit()
        except Exception as e:
            self.db_session.rollback()
            raise e

    def invoke(self):
        self.validate_request()
        self.get_relevant_data()
        self.delete_announcement()
