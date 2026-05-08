from pydantic import BaseModel, Field
from sp_backend.constants.announcement import AnnouncementCategory, AnnouncementPriority
from datetime import datetime
from typing import Optional
from sp_backend.constants.user import UserRole


class AnnouncementPoster(BaseModel):
    id: int = Field(..., description="The ID of the poster", example=1)
    name: str = Field(..., description="The name of the poster", example="John Doe")
    role: UserRole = Field(
        ..., description="The role of the poster", example=UserRole.STUDENT
    )


class GetAnnouncementResponse(BaseModel):
    id: int = Field(..., description="The ID of the announcement", example=1)
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
    created_at: datetime = Field(
        ...,
        description="The creation timestamp of the announcement",
        example="2024-01-01T12:00:00Z",
    )
    expired_at: datetime = Field(
        ...,
        description="The expiration timestamp of the announcement",
        example="2024-01-31T23:59:59Z",
    )
    has_expired: bool = Field(
        ...,
        description="Indicates whether the announcement has expired",
        example=False,
    )
    views_count: int = Field(
        ..., description="The number of views of the announcement", example=100
    )
    likes_count: int = Field(
        ..., description="The number of likes of the announcement", example=50
    )
    comments_count: int = Field(
        ..., description="The number of comments on the announcement", example=20
    )
    has_liked: bool = Field(
        ...,
        description="Indicates whether the user has liked the announcement",
        example=True,
    )
    posted_by: AnnouncementPoster = Field(
        ..., description="Information about the poster"
    )


class ListAnnouncementsResponse(BaseModel):
    announcements: list[GetAnnouncementResponse] = Field(
        ..., description="The list of announcements"
    )


class CountAnnouncementsResponse(BaseModel):
    count: int = Field(
        ..., description="The count of announcements matching the criteria", example=42
    )
