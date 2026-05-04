from sqlalchemy.orm import Session
from sp_backend.schemas.comment.create_comment_schema import (
    CreateCommentRequest,
    CreateCommentResponse,
)
from sp_backend.models.user import User
from sp_backend.models.comment import Comment
from sp_backend.services.user.exception import UserNotFoundException
from sp_backend.constants.content_type import ContentType
from typing import Optional


class CreateCommentService:
    def __init__(
        self,
        db_session: Session,
        comment: str,
        content_id: int,
        content_type: ContentType,
        parent_comment_id: Optional[int],
        user_id: int,
    ):
        self.db_session: Session = db_session
        self.comment: str = comment
        self.content_id: int = content_id
        self.content_type: ContentType = content_type
        self.parent_comment_id: Optional[int] = parent_comment_id
        self.user_id: int = user_id
        self.user: Optional[User] = None
        self.comment_obj: Optional[Comment] = None

    def validate_user(self) -> User:
        self.user = self.db_session.query(User).filter(User.id == self.user_id).first()
        if not self.user:
            raise UserNotFoundException(f"User with ID {self.user_id} not found")

    def create_comment(self):
        self.comment_obj = Comment(
            body=self.comment,
            posted_by=self.user.id,
            content_id=self.content_id,
            content_type=self.content_type,
            parent_comment_id=self.parent_comment_id,
        )
        try:
            self.db_session.add(self.comment_obj)
            self.db_session.commit()
            self.db_session.refresh(self.comment_obj)
        except:
            self.db_session.rollback()
            raise

    def invoke(self) -> CreateCommentResponse:
        self.validate_user()
        self.create_comment()
        return CreateCommentResponse(
            id=self.comment_obj.id,
            comment=self.comment_obj.body,
            author_id=self.comment_obj.posted_by,
            content_id=self.comment_obj.content_id,
            content_type=self.comment_obj.content_type,
            parent_comment_id=self.comment_obj.parent_comment_id,
        )
