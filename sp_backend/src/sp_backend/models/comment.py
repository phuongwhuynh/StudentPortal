from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Enum

if TYPE_CHECKING:
    from sp_backend.models.user import User
from sp_backend.db.base import Base
from sp_backend.constants.content_type import ContentType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, ForeignKey, DateTime, func
from datetime import datetime


# tàm tạm, tính sau, refactor dựa vào UI
class Comment(Base):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    content_type: Mapped[ContentType] = mapped_column(
        Enum(ContentType, name="contenttype"), nullable=False
    )
    content_id: Mapped[int] = mapped_column(Integer, nullable=False)
    parent_comment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("comments.id"), nullable=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    posted_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    parent_comment: Mapped[Comment] = relationship(
        "Comment",
        back_populates="children_comments",
        remote_side=[id],
        foreign_keys=[parent_comment_id],
        lazy="joined",
    )
    children_comments: Mapped[list[Comment]] = relationship(
        "Comment", back_populates="parent_comment", cascade="all, delete-orphan"
    )
