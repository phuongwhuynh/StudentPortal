from sp_backend.models.announcement import Announcement
from sp_backend.models.reaction import Reaction
from sqlalchemy.orm import Session, joinedload
from sp_backend.schemas.announcement.get_announcement_schema import (
    AnnouncementPoster,
    GetAnnouncementResponse,
)
from typing import Optional
from sp_backend.services.announcement.exception import AnnouncementNotFoundException
from sp_backend.constants.content_type import ContentType
from sp_backend.models.content_daily_view import ContentDailyView
from datetime import date, datetime


class GetAnnouncementService:
    def __init__(
        self,
        db_session: Session,
        announcement_id: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.announcement_id: int = announcement_id
        self.user_id: Optional[int] = user_id
        self.announcement_response: Optional[GetAnnouncementResponse] = None
        self.announcement: Optional[Announcement] = None
        self.user_liked: Optional[bool] = None

    def get_announcement(self) -> Announcement:
        self.announcement: Optional[Announcement] = (
            self.db_session.query(Announcement)
            .options(joinedload(Announcement.poster))
            .filter(Announcement.id == self.announcement_id)
            .first()
        )
        if not self.announcement:
            raise AnnouncementNotFoundException(announcement_id=self.announcement_id)

    def get_user_reaction(self):
        if self.user_id is None:
            self.user_liked = False
            return

        reaction: Optional[Reaction] = (
            self.db_session.query(Reaction)
            .filter(
                Reaction.content_id == self.announcement_id,
                Reaction.content_type == ContentType.ANNOUNCEMENT,
                Reaction.user_id == self.user_id,
            )
            .first()
        )
        self.user_liked = reaction is not None

    def update_views_count(self):
        # Increment the views count of the announcement
        self.announcement.views_count += 1
        today = date.today()
        content_daily_view = (
            self.db_session.query(ContentDailyView)
            .filter(
                ContentDailyView.content_id == self.announcement_id,
                ContentDailyView.content_type == ContentType.ANNOUNCEMENT,
                ContentDailyView.content_date == today,
            )
            .first()
        )
        if content_daily_view:
            content_daily_view.views_count += 1
        else:
            content_daily_view = ContentDailyView(
                content_id=self.announcement_id,
                content_type=ContentType.ANNOUNCEMENT,
                content_date=today,
                views_count=1,
            )

        try:
            self.db_session.add(self.announcement)
            self.db_session.add(content_daily_view)
            self.db_session.commit()
            self.db_session.refresh(content_daily_view)
            self.db_session.refresh(self.announcement)
        except Exception as e:
            self.db_session.rollback()
            raise e

    def build_response(self):
        poster = AnnouncementPoster(
            id=self.announcement.poster.id,
            name=self.announcement.poster.full_name,
            role=self.announcement.poster.role,
        )
        now = datetime.now(tz=self.announcement.expired_at.tzinfo)
        has_expired = self.announcement.expired_at < now
        self.announcement_response = GetAnnouncementResponse(
            id=self.announcement.id,
            title=self.announcement.title,
            body=self.announcement.body,
            category=self.announcement.category,
            priority=self.announcement.priority,
            created_at=self.announcement.created_at,
            expired_at=self.announcement.expired_at,
            views_count=self.announcement.views_count,
            likes_count=self.announcement.likes_count,
            comments_count=self.announcement.comments_count,
            has_liked=self.user_liked,
            posted_by=poster,
            has_expired=has_expired,
        )

    def invoke(self) -> GetAnnouncementResponse:
        self.get_announcement()
        self.get_user_reaction()
        self.update_views_count()
        self.build_response()
        return self.announcement_response
