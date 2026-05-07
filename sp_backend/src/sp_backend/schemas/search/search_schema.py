from pydantic import BaseModel, Field
from sp_backend.constants.content_type import ContentType
from typing import Optional
from sp_backend.constants.forum import ForumCategory
from sp_backend.constants.question import QuestionCategory, QuestionStatus
from sp_backend.constants.announcement import AnnouncementCategory, AnnouncementPriority


class PosterInfo(BaseModel):
    id: int = Field(..., description="The identifier of the poster", example=1)
    full_name: str = Field(
        ..., description="The full name of the poster", example="John Doe"
    )


class ContentResult(BaseModel):
    content_type: ContentType = Field(
        ...,
        description="The type of content (e.g., question, forum)",
        example=ContentType.QUESTION,
    )
    id: int = Field(..., description="The identifier of the search result", example=1)
    title: str = Field(
        ...,
        description="The title of the search result",
        example="How to reset password?",
    )

    body: str = Field(
        ...,
        description="The body of the search result",
        example="I forgot my password and I can't log in. Can someone help me reset it?",
    )
    posted_by: PosterInfo = Field(
        ..., description="Information about the poster of the content"
    )
    views_count: int = Field(
        ..., description="The number of views the content has received", example=0
    )
    likes_count: int = Field(
        ..., description="The number of likes the content has received", example=0
    )
    comments_count: int = Field(
        ..., description="The number of comments on the content", example=0
    )
    forum_category: Optional[ForumCategory] = Field(
        None,
        description="The category of the forum post (if content_type is forum)",
        example=ForumCategory.GENERAL,
    )
    question_category: Optional[QuestionCategory] = Field(
        None,
        description="The category of the question (if content_type is question)",
        example=QuestionCategory.IT_SERVICES,
    )
    question_status: Optional[QuestionStatus] = Field(
        None,
        description="The status of the question (if content_type is question)",
        example=QuestionStatus.OPEN,
    )
    announcement_category: Optional[AnnouncementCategory] = Field(
        None,
        description="The category of the announcement (if content_type is announcement)",
        example=AnnouncementCategory.ACADEMIC,
    )
    announcement_priority: Optional[AnnouncementPriority] = Field(
        None,
        description="The priority of the announcement (if content_type is announcement)",
        example=AnnouncementPriority.URGENT,
    )
    # has user liked this content or not, to be used in frontend to display like button state
    has_liked: bool = Field(
        ...,
        description="Indicates whether the current user has liked this content",
        example=False,
    )
    # for debugging purposes only, not to be used in frontend
    distance: float = Field(
        ...,
        description="FOR DEBUGGING: The distance of the search result from the search query embedding",
        example=0.0,
    )


class SearchResponse(BaseModel):
    results: list[ContentResult] = Field(
        ..., description="A list of search results matching the query"
    )
