from fastapi import HTTPException, status
from sp_backend.constants.content_type import ContentType


class ContentNotFoundException(HTTPException):
    def __init__(self, content_type: ContentType, content_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{content_type.value} with ID {content_id} not found.",
        )


class CommentNotFoundException(ContentNotFoundException):
    def __init__(self, comment_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with ID {comment_id} not found.",
        )
