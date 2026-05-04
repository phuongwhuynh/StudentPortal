from sp_backend.models.forum import Forum
from sqlalchemy.orm import Session, Query, joinedload
from sp_backend.schemas.forum.get_forum_schema import (
    PosterInfo,
    GetForumResponse,
)
from sp_backend.constants.forum import SortOptions, ForumCategory
from typing import Optional
from sp_backend.services.forum.exception import ForumNotFoundException


class GetForumService:
    def __init__(
        self,
        db_session: Session,
        forum_id: int,
    ):
        self.db_session: Session = db_session
        self.forum_id: int = forum_id
        self.forum_response: Optional[GetForumResponse] = None
        self.forum: Optional[Forum] = None

    def get_forum(self) -> Forum:
        self.forum: Optional[Forum] = (
            self.db_session.query(Forum)
            .options(joinedload(Forum.poster))
            .filter(Forum.id == self.forum_id)
            .first()
        )
        if not self.forum:
            raise ForumNotFoundException(forum_id=self.forum_id)

    def build_response(self):
        self.forum_response = GetForumResponse(
            id=self.forum.id,
            title=self.forum.title,
            body=self.forum.body,
            category=self.forum.category,
            posted_by=PosterInfo(
                id=self.forum.poster.id,
                full_name=self.forum.poster.full_name,
            ),
            views_count=self.forum.views_count,
            likes_count=self.forum.likes_count,
            comments_count=self.forum.comments_count,
            updated_at=self.forum.updated_at,
        )

    def invoke(self) -> GetForumResponse:
        self.get_forum()
        self.build_response()
        return self.forum_response
