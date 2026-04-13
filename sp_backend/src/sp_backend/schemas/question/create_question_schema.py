from pydantic import BaseModel, Field
from sp_backend.constants.question import QuestionCategory


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
    email: str = Field(
        ..., description="The email address of the user", example="user@example.com"
    )
    full_name: str = Field(
        ..., description="The full name of the user", example="John Doe"
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
    body: str = Field(
        ...,
        description="The body of the created question",
        example="I forgot my password and I can't log in. Can someone help me reset it?",
    )
    posted_by: PosterInfo = Field(
        ...,
        description="Information about the user who posted the question",
        example=PosterInfo(id=1, email="user@example.com", full_name="John Doe"),
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
    created_at: str = Field(
        ...,
        description="The timestamp when the question was created",
        example="2024-01-01T12:00:00Z",
    )
    updated_at: str = Field(
        ...,
        description="The timestamp when the question was last updated",
        example="2024-01-01T12:00:00Z",
    )
