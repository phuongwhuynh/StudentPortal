from sqlalchemy.orm import Session
from sp_backend.models.forum import Forum
from datetime import date, timedelta, datetime
from typing import Optional


class CountForumService:
    def __init__(
        self,
        db_session: Session,
        posted_on: date,
    ):
        self.db_session: Session = db_session
        self.posted_on: date = posted_on
        self.count: Optional[int] = None

    def get_forums_count(self):
        start = datetime.combine(self.posted_on, datetime.min.time())
        end = start + timedelta(days=1)
        count = (
            self.db_session.query(Forum)
            .filter(
                Forum.created_at >= start,
                Forum.created_at < end,
            )
            .count()
        )
        self.count = count

    def invoke(self) -> int:
        self.get_forums_count()
        return self.count
