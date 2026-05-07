from datetime import datetime

from pydantic import BaseModel, Field
from sp_backend.constants.question import QuestionCategory, QuestionStatus
from sp_backend.constants.user import UserRole


class CreateQuestionRequest(BaseModel):
    title: str = Field(
        ...,
        description="The title of the question",
        example="How do I reset my password?",
        max_length=300,
    )
    category: QuestionCategory = Field(
        ...,
        description="The category of the question",
        example=QuestionCategory.IT_SERVICES,
    )
    body: str = Field(
        ...,
        description="The body of the question",
        example="I forgot my password and I can't log in. Can someone help me reset it?",
    )


class PosterInfo(BaseModel):
    id: int = Field(..., description="The unique identifier of the user", example=1)
    full_name: str = Field(
        ..., description="The full name of the user", example="John Doe"
    )
    role: UserRole = Field(
        ..., description="The role of the user", example=UserRole.STUDENT
    )


class CreateQuestionResponse(BaseModel):
    id: int = Field(
        ...,
        description="The unique identifier of the created question",
        example=1,
    )
    title: str = Field(
        ...,
        description="The title of the created question",
        example="How do I reset my password?",
    )
    category: QuestionCategory = Field(
        ...,
        description="The category of the created question",
        example=QuestionCategory.IT_SERVICES,
    )
    status: QuestionStatus = Field(
        ...,
        description="The status of the created question",
        example=QuestionStatus.OPEN,
    )
    body: str = Field(
        ...,
        description="The body of the created question",
        example="I forgot my password and I can't log in. Can someone help me reset it?",
    )
    posted_by: PosterInfo = Field(
        ...,
        description="Information about the user who posted the question",
        example=PosterInfo(id=1, full_name="John Doe", role=UserRole.STUDENT),
    )
    views_count: int = Field(
        ...,
        description="The number of views the question has received",
        example=0,
    )
    likes_count: int = Field(
        ...,
        description="The number of likes the question has received",
        example=0,
    )
    comments_count: int = Field(
        ...,
        description="The number of comments the question has received",
        example=0,
    )
    created_at: datetime = Field(
        ...,
        description="The timestamp when the question was created",
        example="2024-01-01T12:00:00Z",
    )


class ResolveQuestionResponse(CreateQuestionResponse):
    completed_at: datetime = Field(
        ...,
        description="The timestamp when the question was resolved",
        example="2024-01-02T15:30:00Z",
    )
    completer: PosterInfo = Field(
        ...,
        description="Information about the user who resolved the question",
        example=PosterInfo(id=2, full_name="Jane Smith", role=UserRole.STAFF),
    )
