from pydantic import BaseModel, Field
from sp_backend.constants.content_type import ContentType




class ReactionResponse(BaseModel):
    content_type: ContentType = Field(
        ...,
        description="The type of content (e.g., question, forum)",
        example="question",
    )
    content_id: int = Field(..., description="The identifier of the content", example=1)
    user_id: int = Field(
        ..., description="The identifier of the user who reacted", example=1
    )
