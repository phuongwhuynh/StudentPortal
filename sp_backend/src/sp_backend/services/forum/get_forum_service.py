from sp_backend.models.forum import Forum
from sp_backend.models.reaction import Reaction
from sqlalchemy.orm import Session, joinedload
from sp_backend.schemas.forum.get_forum_schema import (
    PosterInfo,
    GetForumResponse,
)
from typing import Optional
from sp_backend.services.forum.exception import ForumNotFoundException
from sp_backend.constants.content_type import ContentType


class GetForumService:
    def __init__(
        self,
        db_session: Session,
        forum_id: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.forum_id: int = forum_id
        self.user_id: Optional[int] = user_id
        self.forum_response: Optional[GetForumResponse] = None
        self.forum: Optional[Forum] = None
        self.user_liked: Optional[bool] = None

    def get_forum(self) -> Forum:
        self.forum: Optional[Forum] = (
            self.db_session.query(Forum)
            .options(joinedload(Forum.poster))
            .filter(Forum.id == self.forum_id)
            .first()
        )
        if not self.forum:
            raise ForumNotFoundException(forum_id=self.forum_id)

    def get_user_reaction(self):
        if self.user_id is None:
            self.user_liked = False
            return

        reaction: Optional[Reaction] = (
            self.db_session.query(Reaction)
            .filter(
                Reaction.content_id == self.forum_id,
                Reaction.content_type == ContentType.FORUM,
                Reaction.user_id == self.user_id,
            )
            .first()
        )
        self.user_liked = reaction is not None

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
            has_liked=self.user_liked,
        )

    def invoke(self) -> GetForumResponse:
        self.get_forum()
        self.get_user_reaction()
        self.build_response()
        return self.forum_response
