from pydantic import BaseModel, Field
from typing import Optional
from sp_backend.constants.content_type import ContentType


class CreateCommentRequest(BaseModel):
    comment: str = Field(
        ..., description="The content of the comment", example="This is a comment"
    )
    content_id: int = Field(
        ...,
        description="The ID of the content to which the comment belongs",
        example=1,
    )
    content_type: ContentType = Field(
        ...,
        description="The type of the content (e.g., 'post', 'announcement')",
        example=ContentType.FORUM,
    )
    parent_comment_id: Optional[int] = Field(
        None,
        description="The ID of the parent comment if this is a reply",
    )


class CreateCommentResponse(BaseModel):
    id: int = Field(..., description="The ID of the created comment")
    comment: str = Field(..., description="The content of the comment")
    author_id: int = Field(..., description="The ID of the author of the comment")
    content_id: int = Field(
        ..., description="The ID of the content to which the comment belongs"
    )
    content_type: ContentType = Field(
        ..., description="The type of the content (e.g., 'post', 'announcement')"
    )

    parent_comment_id: Optional[int] = Field(
        None, description="The ID of the parent comment if this is a reply"
    )
