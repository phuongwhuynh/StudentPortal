from pydantic import BaseModel, Field, ConfigDict, EmailStr
from sp_backend.constants.user import UserRole


class UserClaims(BaseModel):
    id: int = Field(..., description="The unique identifier of the user")
    email: EmailStr = Field(..., description="The user's email address")
    role: UserRole = Field(..., description="The role of the user")
    full_name: str = Field(..., description="The full name of the user")
    model_config = ConfigDict(from_attributes=True)
