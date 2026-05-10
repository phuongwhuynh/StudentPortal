from sqlalchemy.orm import Session, joinedload
from sp_backend.constants.content_type import ContentType
from sp_backend.schemas.comment.get_comment_schema import (
    ListCommentsResponse,
    CommentInfo,
    CommenterInfo,
)
from sp_backend.models.comment import Comment
from sp_backend.models.forum import Forum
from sp_backend.models.question import Question
from sp_backend.models.announcement import Announcement
from sp_backend.services.comment.exception import ContentNotFoundException


class GetCommentsOfContentService:
    def __init__(
        self,
        db_session: Session,
        content_type: ContentType,
        content_id: int,
    ):
        self.db_session: Session = db_session
        self.content_type: ContentType = content_type
        self.content_id: int = content_id
        self.comments: list[Comment] = []

    def validate_request(self):
        # Validate that the content exists based on content_type and content_id
        content = None
        if self.content_type == ContentType.FORUM:
            content = (
                self.db_session.query(Forum).filter(Forum.id == self.content_id).first()
            )
        elif self.content_type == ContentType.QUESTION:
            content = (
                self.db_session.query(Question)
                .filter(Question.id == self.content_id)
                .first()
            )
        elif self.content_type == ContentType.ANNOUNCEMENT:
            content = (
                self.db_session.query(Announcement)
                .filter(Announcement.id == self.content_id)
                .first()
            )
        if not content:
            raise ContentNotFoundException(self.content_type, self.content_id)

    def get_comments(self):
        comments_query = (
            self.db_session.query(Comment)
            .filter(
                Comment.content_type == self.content_type,
                Comment.content_id == self.content_id,
            )
            .options(joinedload(Comment.children_comments))
            .options(joinedload(Comment.poster))
            .order_by(Comment.created_at.asc())
        )
        self.comments = comments_query.all()

    def invoke(self) -> ListCommentsResponse:
        self.validate_request()
        self.get_comments()
        return ListCommentsResponse(
            comments=[
                CommentInfo(
                    id=comment.id,
                    comment=comment.body,
                    commenter=CommenterInfo(
                        id=comment.poster.id,
                        full_name=comment.poster.full_name,
                        role=comment.poster.role,
                    ),
                    created_at=comment.created_at,
                    content_id=comment.content_id,
                    content_type=comment.content_type,
                    parent_comment_id=comment.parent_comment_id,
                    load_more=len(comment.children_comments) > 0,
                )
                for comment in self.comments
            ]
        )
