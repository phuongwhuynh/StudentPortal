from pydantic import BaseModel, Field
from sp_backend.constants.forum import ForumCategory
from sp_backend.schemas.user.user_claims import UserClaims


class CreateForumRequest(BaseModel):
    title: str = Field(..., description="The title of the forum post", max_length=300)
    category: ForumCategory = Field(..., description="The category of the forum post")
    body: str = Field(..., description="The body content of the forum post")


class PosterInfo(BaseModel):
    id: int = Field(..., description="The unique identifier of the user")
    email: str = Field(..., description="The email address of the user")
    full_name: str = Field(..., description="The full name of the user")


class CreateForumResponse(BaseModel):
    id: int = Field(..., description="The unique identifier of the created forum post")
    title: str = Field(..., description="The title of the created forum post")
    body: str = Field(..., description="The body content of the created forum post")
    category: ForumCategory = Field(
        ..., description="The category of the created forum post"
    )
    posted_by: PosterInfo = Field(
        ..., description="Information about the user who posted the forum"
    )
    created_at: str = Field(
        ..., description="The timestamp when the forum post was created"
    )
    updated_at: str = Field(
        ..., description="The timestamp when the forum post was last updated"
    )
    views_count: int = Field(
        ..., description="The number of views the forum post has received"
    )
    likes_count: int = Field(
        ..., description="The number of likes the forum post has received"
    )
    comments_count: int = Field(
        ..., description="The number of comments on the forum post"
    )
