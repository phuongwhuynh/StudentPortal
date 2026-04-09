from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sp_backend.models.user import User
from sp_backend.db.base import Base
from sqlalchemy import (
    Integer,
    Enum,
    DateTime,
    desc,
    func,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from sp_backend.constants.content_type import ContentType


class ContentView(Base):
    __tablename__ = "content_views"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    content_type: Mapped[ContentType] = mapped_column(Enum(ContentType), nullable=False)
    content_id: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # ko gắn foreign key, application logic tự handle
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index(
            "ix_content_views_user_timestamp",
            "user_id",
            desc("timestamp"),
            postgresql_include=["content_id", "content_type"],
        ),
    )

    user: Mapped[User] = relationship("User", back_populates="content_views")
