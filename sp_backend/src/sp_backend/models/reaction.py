from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sp_backend.models.user import User
from sp_backend.db.base import Base
from sqlalchemy import (
    Integer,
    Enum,
    ForeignKey,
    DateTime,
    func,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column
from sp_backend.constants.content_type import ContentType
from datetime import datetime


# con tró ht, trên UI like chỗ nào????
class Reaction(Base):
    __tablename__ = "reactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    content_type: Mapped[ContentType] = mapped_column(Enum[ContentType], nullable=False)
    content_id: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # ko gắn foreign key, application logic tự handle
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    __table_args__ = (
        UniqueConstraint(
            "content_type", "content_id", "user_id", name="uq_reactions_content_user"
        ),
        Index(
            "ix_reactions_content_user",
            "content_type",
            "content_id",
            "user_id",
        ),
    )
