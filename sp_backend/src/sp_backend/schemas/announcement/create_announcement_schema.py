from pydantic import BaseModel, Field
from sp_backend.constants.announcement import AnnouncementCategory, AnnouncementPriority
from datetime import datetime


class CreateAnnouncementRequest(BaseModel):
    title: str = Field(
        ...,
        description="The title of the announcement",
        example="Announcement Title",
        max_length=300,
    )
    category: AnnouncementCategory = Field(
        ...,
        description="The category of the announcement",
        example=AnnouncementCategory.ACADEMIC,
    )
    priority: AnnouncementPriority = Field(
        ...,
        description="The priority of the announcement",
        example=AnnouncementPriority.INFO,
    )
    body: str = Field(
        ...,
        description="The body of the announcement",
        example="This is the body of the announcement.",
    )


class AnnouncementPoster(BaseModel):
    id: int = Field(..., description="The ID of the poster", example=1)
    name: str = Field(..., description="The name of the poster", example="John Doe")
    email: str = Field(
        ..., description="The email of the poster", example="john.doe@example.com"
    )


class CreateAnnouncementResponse(BaseModel):
    title: str = Field(
        ..., description="The title of the announcement", example="Announcement Title"
    )
    body: str = Field(
        ...,
        description="The body of the announcement",
        example="This is the body of the announcement.",
    )
    category: AnnouncementCategory = Field(
        ...,
        description="The category of the announcement",
        example=AnnouncementCategory.ACADEMIC,
    )
    priority: AnnouncementPriority = Field(
        ...,
        description="The priority of the announcement",
        example=AnnouncementPriority.INFO,
    )
    posted_by: AnnouncementPoster = Field(
        ...,
        description="The poster of the announcement",
        example=AnnouncementPoster(id=1, name="John Doe", email="john.doe@example.com"),
    )
    views_count: int = Field(
        ..., description="The number of views for the announcement", example=0
    )
    likes_count: int = Field(
        ..., description="The number of likes for the announcement", example=0
    )
    comments_count: int = Field(
        ..., description="The number of comments for the announcement", example=0
    )
    created_at: datetime = Field(
        ...,
        description="The creation timestamp of the announcement",
        example="2024-01-01T12:00:00Z",
    )
    updated_at: datetime = Field(
        ...,
        description="The last update timestamp of the announcement",
        example="2024-01-01T12:00:00Z",
    )
