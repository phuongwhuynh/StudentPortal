from pydantic import BaseModel, Field
from typing import Optional
from sp_backend.constants.content_type import ContentType
from sp_backend.constants.user import UserRole
from datetime import datetime


class CommenterInfo(BaseModel):
    id: int = Field(..., description="The ID of the commenter", example=1)
    full_name: str = Field(
        ..., description="The full name of the commenter", example="John Doe"
    )
    role: UserRole = Field(
        ..., description="The role of the commenter", example=UserRole.STUDENT
    )


class CommentInfo(BaseModel):
    id: int = Field(..., description="The ID of the comment", example=1)
    comment: str = Field(
        ..., description="The content of the comment", example="This is a great post!"
    )
    commenter: CommenterInfo = Field(..., description="Information about the commenter")
    created_at: datetime = Field(..., description="Timestamp when the comment was created")
    content_id: int = Field(
        ..., description="The ID of the content to which the comment belongs"
    )
    content_type: ContentType = Field(
        ...,
        description="The type of the content (e.g., 'post', 'announcement')",
        example=ContentType.FORUM,
    )
    parent_comment_id: Optional[int] = Field(
        None, description="The ID of the parent comment, if this is a reply"
    )
    load_more: bool = Field(
        False,
        description="Indicates if there are more replies to load for this comment",
        example=False,
    )


class ListCommentsResponse(BaseModel):
    comments: list[CommentInfo] = Field(..., description="A list of comments")
