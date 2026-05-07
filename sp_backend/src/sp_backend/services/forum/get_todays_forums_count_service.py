from sqlalchemy.orm import Session
from sp_backend.models.forum import Forum
from datetime import date, timedelta, datetime
from typing import Optional


class GetTodaysForumsCountService:
    def __init__(
        self,
        db_session: Session,
    ):
        self.db_session: Session = db_session
        self.count: Optional[int] = None

    def get_todays_forums_count(self):
        today = date.today()
        start = datetime.combine(today, datetime.min.time())
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
        self.get_todays_forums_count()
        return self.count
