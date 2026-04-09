from __future__ import annotations
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from sp_backend.models.forum import Forum
    from sp_backend.models.content_view import ContentView
from sp_backend.db.base import Base
from sqlalchemy import Integer, String, func, DateTime, Enum
from sp_backend.constants.user import UserRole
from sqlalchemy.orm import relationship, mapped_column, Mapped
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.STUDENT,
    )

    hashed_password: Mapped[str] = mapped_column(String(128), nullable=False)

    full_name: Mapped[str] = mapped_column(String(512), nullable=False)

    email: Mapped[str] = mapped_column(
        String(512),
        unique=True,
        index=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    forums_posted: Mapped[list[Forum]] = relationship("Forum", back_populates="poster")
    content_views: Mapped[list[ContentView]] = relationship(
        "ContentView", back_populates="user", cascade="all, delete-orphan"
    )
