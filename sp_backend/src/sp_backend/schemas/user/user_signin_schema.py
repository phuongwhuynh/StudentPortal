from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sp_backend.constants.user import UserRole


class UserSignInRequest(BaseModel):
    email: EmailStr = Field(..., description="The user's email address")
    password: str = Field(..., min_length=8, description="The user's password")
    model_config = ConfigDict(from_attributes=True)


class UserSignInResponse(BaseModel):
    id: int = Field(..., description="The unique identifier of the user")
    email: EmailStr = Field(..., description="The user's email address")
    role: UserRole = Field(..., description="The role of the user")
    full_name: str = Field(..., description="The full name of the user")
    model_config = ConfigDict(from_attributes=True)
