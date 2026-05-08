from sqlalchemy.orm import Session
from sp_backend.models.announcement import (
    Announcement,
    AnnouncementPriority,
)
from datetime import date, timedelta, datetime, timezone
from typing import Optional
from sp_backend.schemas.announcement.get_announcement_schema import (
    CountAnnouncementsResponse,
)


class CountAnnouncementService:
    def __init__(
        self,
        db_session: Session,
        posted_on: Optional[date] = None,
        priority: Optional[AnnouncementPriority] = None,
        has_expired: Optional[bool] = None,
    ):
        self.db_session: Session = db_session
        self.posted_on: Optional[date] = posted_on
        self.priority: Optional[AnnouncementPriority] = priority
        self.has_expired: Optional[bool] = has_expired
        self.count: Optional[int] = None

    def get_announcement_counts(self):
        query = self.db_session.query(Announcement)

        if self.posted_on:
            start = datetime.combine(self.posted_on, datetime.min.time())
            end = start + timedelta(days=1)
            query = query.filter(
                Announcement.created_at >= start,
                Announcement.created_at < end,
            )

        if self.priority:
            query = query.filter(Announcement.priority == self.priority)

        if self.has_expired is not None:
            now = datetime.now(tz=timezone.utc)
            if self.has_expired:
                query = query.filter(Announcement.expired_at < now)
            else:
                query = query.filter(Announcement.expired_at >= now)

        self.count = query.count()

    def invoke(self) -> CountAnnouncementsResponse:
        self.get_announcement_counts()
        return CountAnnouncementsResponse(count=self.count)
