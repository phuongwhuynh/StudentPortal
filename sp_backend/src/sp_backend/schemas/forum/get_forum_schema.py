from datetime import datetime

from pydantic import BaseModel, Field


class PosterInfo(BaseModel):
    id: int = Field(
        ...,
        description="The unique identifier of the user who posted the forum",
        example=1,
    )
    full_name: str = Field(
        ..., description="The name of the user who posted the forum", example="John Doe"
    )


class GetForumResponse(BaseModel):
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
    posted_by: PosterInfo = Field(
        ...,
        description="Information about the user who posted the forum",
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
    has_liked: bool = Field(
        ...,
        description="Indicates whether the current user has liked the forum post",
        example=False,
    )


class ForumListResponse(BaseModel):
    forums: list[GetForumResponse] = Field(..., description="List of forum posts")


class TodaysForumsCountResponse(BaseModel):
    count: int = Field(..., description="The number of forums created today", example=5)
