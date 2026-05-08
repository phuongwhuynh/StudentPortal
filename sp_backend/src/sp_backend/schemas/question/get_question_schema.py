from pydantic import BaseModel, Field
from sp_backend.constants.question import QuestionCategory, QuestionStatus
from datetime import datetime
from typing import Optional


class QuestionPoster(BaseModel):
    id: int = Field(..., description="The ID of the poster", example=1)
    name: str = Field(..., description="The name of the poster", example="John Doe")
    role: str = Field(..., description="The role of the poster", example="STUDENT")


class QuestionAnswerer(BaseModel):
    id: int = Field(..., description="The ID of the answerer", example=2)
    name: str = Field(..., description="The name of the answerer", example="Jane Smith")
    role: str = Field(..., description="The role of the answerer", example="STAFF")


class GetQuestionResponse(BaseModel):
    id: int = Field(..., description="The ID of the question", example=1)
    title: str = Field(
        ...,
        description="The title of the question",
        example="How to reset my password?",
    )
    body: str = Field(
        ...,
        description="The body of the question",
        example="I forgot my password and can't log in. How can I reset it?",
    )
    category: QuestionCategory = Field(
        ...,
        description="The category of the question",
        example=QuestionCategory.LIBRARY,
    )
    status: QuestionStatus = Field(
        ...,
        description="The status of the question",
        example=QuestionStatus.OPEN,
    )
    posted_by: QuestionPoster = Field(
        ...,
        description="Information about the user who posted the question",
    )
    answerer: Optional[QuestionAnswerer] = Field(
        None,
        description="Information about the user who answered the question",
    )
    completed_at: Optional[datetime] = Field(
        None,
        description="The timestamp when the question was completed (answered)",
        example="2024-01-02T15:30:00Z",
    )
    created_at: datetime = Field(
        ...,
        description="The creation timestamp of the question",
        example="2024-01-01T12:00:00Z",
    )
    views_count: int = Field(
        ..., description="The number of views of the question", example=100
    )
    comments_count: int = Field(
        ..., description="The number of comments on the question", example=5
    )
    likes_count: int = Field(
        ..., description="The number of likes of the question", example=20
    )
    has_liked: bool = Field(
        ...,
        description="Indicates whether the current user has liked the question",
        example=True,
    )


class CommentPoster(BaseModel):
    id: int = Field(..., description="The ID of the comment poster", example=3)
    name: str = Field(
        ..., description="The name of the comment poster", example="Alice Johnson"
    )
    role: str = Field(
        ..., description="The role of the comment poster", example="STUDENT"
    )


class LatestComment(BaseModel):
    id: int = Field(..., description="The ID of the comment", example=1)
    content: str = Field(
        ...,
        description="The content of the comment",
        example="I have the same issue. Any updates?",
    )
    posted_by: CommentPoster = Field(
        ...,
        description="Information about the user who posted the comment",
    )
    created_at: datetime = Field(
        ...,
        description="The creation timestamp of the comment",
        example="2024-01-02T14:00:00Z",
    )


class GetQuestionWithLatestCommentResponse(GetQuestionResponse):
    latest_comment: Optional[LatestComment] = Field(
        None,
        description="The content of the latest comment on the question",
        example="I have the same issue. Any updates?",
    )


class ListQuestionsResponse(BaseModel):
    questions: list[GetQuestionWithLatestCommentResponse] = Field(
        ..., description="A list of questions matching the criteria"
    )


class CountQuestionsResponse(BaseModel):
    count: int = Field(
        ...,
        description="The total number of questions matching the criteria",
        example=42,
    )
