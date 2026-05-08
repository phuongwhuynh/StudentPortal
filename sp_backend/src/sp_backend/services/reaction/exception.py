from fastapi import HTTPException
from fastapi import status
from sp_backend.constants.content_type import ContentType


class ContentNotFoundException(HTTPException):
    def __init__(self, content_type: ContentType, content_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{content_type.value} with ID {content_id} not found.",
        )


class ReactionNotFoundException(HTTPException):
    def __init__(self, user_id: int, content_type: ContentType, content_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reaction of user {user_id} for {content_type.value} with ID {content_id} not found.",
        )
