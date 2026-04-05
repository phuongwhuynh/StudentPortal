from sp_backend.db.base import Base
from sqlalchemy import Column, Integer, String, func, DateTime
from sp_backend.constants.user import UserRole
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role = Column(String(50), nullable=False, default=UserRole.STUDENT)
    hashed_password = Column(String(128), nullable=False)
    full_name = Column(String(512), nullable=False)
    email = Column(String(512), unique=True, index=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.current_timestamp(),
    )
