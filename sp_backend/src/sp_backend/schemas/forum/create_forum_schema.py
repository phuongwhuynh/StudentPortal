from pydantic import BaseModel, Field
from sp_backend.constants.forum import ForumCategory
from datetime import datetime


class CreateForumRequest(BaseModel):
    title: str = Field(
        ...,
        description="The title of the forum post",
        max_length=300,
        example="Forum Post Title",
    )
    category: ForumCategory = Field(
        ...,
        description="The category of the forum post",
        example=ForumCategory.GENERAL,
    )
    body: str = Field(
        ...,
        description="The body content of the forum post",
        example="This is the body content of the forum post.",
    )


class PosterInfo(BaseModel):
    id: int = Field(..., description="The unique identifier of the user", example=1)
    email: str = Field(
        ..., description="The email address of the user", example="user@example.com"
    )
    full_name: str = Field(
        ..., description="The full name of the user", example="John Doe"
    )


class CreateForumResponse(BaseModel):
    id: int = Field(
        ..., description="The unique identifier of the created forum post", example=1
    )
    title: str = Field(
        ...,
        description="The title of the created forum post",
        example="Forum Post Title",
    )
    body: str = Field(
        ...,
        description="The body content of the created forum post",
        example="This is the body content of the forum post.",
    )
    category: ForumCategory = Field(
        ...,
        description="The category of the created forum post",
        example=ForumCategory.GENERAL,
    )
    posted_by: PosterInfo = Field(
        ...,
        description="Information about the user who posted the forum",
        example=PosterInfo(id=1, email="user@example.com", full_name="John Doe"),
    )
    created_at: datetime = Field(
        ...,
        description="The timestamp when the forum post was created",
        example="2024-01-01T12:00:00Z",
    )
    updated_at: datetime = Field(
        ...,
        description="The timestamp when the forum post was last updated",
        example="2024-01-01T12:00:00Z",
    )
    views_count: int = Field(
        ..., description="The number of views the forum post has received", example=0
    )
    likes_count: int = Field(
        ..., description="The number of likes the forum post has received", example=0
    )
    comments_count: int = Field(
        ..., description="The number of comments on the forum post", example=0
    )
