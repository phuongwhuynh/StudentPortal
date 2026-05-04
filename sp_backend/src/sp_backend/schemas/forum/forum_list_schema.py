from datetime import datetime

from pydantic import BaseModel, Field


class ForumInfo(BaseModel):
    id: int = Field(
        ..., description="The unique identifier of the forum post", example=1
    )
    title: str = Field(
        ...,
        description="The title of the forum post",
        example="Forum Post Title",
    )
    body: str = Field(
        ...,
        description="The body content of the forum post",
        example="This is the body of the forum post.",
    )
    category: str = Field(
        ...,
        description="The category of the forum post",
        example="General",
    )
    posted_by: str = Field(
        ...,
        description="The name of the user who posted the forum",
        example="John Doe",
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
    updated_at: datetime = Field(
        ...,
        description="The timestamp when the forum post was last updated",
        example="2024-01-01T12:00:00Z",
    )


class ForumListResponse(BaseModel):
    forums: list[ForumInfo] = Field(..., description="List of forum posts")
