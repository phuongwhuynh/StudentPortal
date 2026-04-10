from sqlalchemy.orm import Session
from sp_backend.schemas.forum.create_forum_schema import (
    CreateForumRequest,
    CreateForumResponse,
    PosterInfo,
)
from sp_backend.models.user import User
from sp_backend.models.forum import Forum
from sp_backend.services.user.exception import UserNotFoundException
from sp_backend.services.embedding.embedding_service import EmbeddingService


class CreateForumService:
    def __init__(
        self,
        db_session: Session,
        create_forum_request: CreateForumRequest,
        user_id: int,
    ):
        self.db_session: Session = db_session
        self.create_forum_request: CreateForumRequest = create_forum_request
        self.user_id: int = user_id
        self.embedding: list[float] = []
        self.forum: Forum = None
        self.user: User = None

    def validate_request(self) -> None:
        self.user = self.db_session.query(User).filter_by(id=self.user_id).first()
        if not self.user:
            raise UserNotFoundException()

    def generate_embedding(self) -> None:
        self.embedding = EmbeddingService.get_embedding(
            text=self.create_forum_request.body
        )

    def create_forum(self) -> None:
        self.forum = Forum(
            title=self.create_forum_request.title,
            body=self.create_forum_request.body,
            body_embedding=self.embedding,
            category=self.create_forum_request.category,
            posted_by=self.user_id,
        )
        self.db_session.add(self.forum)
        self.db_session.commit()
        self.db_session.refresh(self.forum)

    def invoke(self) -> CreateForumResponse:
        self.validate_request()
        self.generate_embedding()
        self.create_forum()
        return CreateForumResponse(
            id=self.forum.id,
            title=self.forum.title,
            body=self.forum.body,
            category=self.forum.category,
            posted_by=PosterInfo(
                id=self.user.id,
                email=self.user.email,
                full_name=self.user.full_name,
            ),
            views_count=self.forum.views_count,
            likes_count=self.forum.likes_count,
            comments_count=self.forum.comments_count,
            created_at=self.forum.created_at,
            updated_at=self.forum.updated_at,
        )
