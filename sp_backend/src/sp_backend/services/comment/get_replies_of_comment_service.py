from sqlalchemy.orm import Session, joinedload
from sp_backend.constants.content_type import ContentType
from sp_backend.schemas.comment.get_comment_schema import (
    CommenterInfo,
    ListCommentsResponse,
    CommentInfo,
)
from sp_backend.models.comment import Comment
from sp_backend.services.comment.exception import CommentNotFoundException


class GetCommentsOfContentService:
    def __init__(
        self,
        db_session: Session,
        parent_comment_id: int,
    ):
        self.db_session: Session = db_session
        self.parent_comment_id: int = parent_comment_id
        self.comments: list[Comment] = []

    def validate_request(self):
        # Validate that the parent comment exists
        parent_comment = (
            self.db_session.query(Comment)
            .filter(Comment.id == self.parent_comment_id)
            .first()
        )
        if not parent_comment:
            raise CommentNotFoundException(self.parent_comment_id)

    def get_comments(self):
        self.comments: list[Comment] = (
            self.db_session.query(Comment)
            .options(joinedload(Comment.children_comments))
            .options(joinedload(Comment.poster))
            .filter(Comment.parent_comment_id == self.parent_comment_id)
            .all()
        )

    def invoke(self) -> ListCommentsResponse:
        self.validate_request()
        self.get_comments()
        return ListCommentsResponse(
            comments=[
                CommentInfo(
                    id=comment.id,
                    comment=comment.body,
                    commenter=CommenterInfo(
                        id=comment.poster.id, name=comment.poster.full_name
                    ),
                    content_id=comment.content_id,
                    content_type=comment.content_type,
                    parent_comment_id=comment.parent_comment_id,
                    load_more=len(comment.children_comments) > 0,
                )
                for comment in self.comments
            ]
        )
