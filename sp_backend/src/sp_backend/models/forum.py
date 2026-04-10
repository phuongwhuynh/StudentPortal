from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sp_backend.models.user import User
    from sp_backend.models.content_daily_view import ForumDailyView
from sqlalchemy import (
    Integer,
    String,
    Text,
    ForeignKey,
    Enum,
    DateTime,
    func,
    Index,
)
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from sp_backend.db.base import Base
from sp_backend.constants.forum import ForumCategory
from sp_backend.constants.embedding import EMBEDDING_DIM


class Forum(Base):
    __tablename__ = "forums"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    body_embedding: Mapped[list[float]] = mapped_column(
        Vector(EMBEDDING_DIM),
        nullable=False,
    )
    category: Mapped[ForumCategory] = mapped_column(
        Enum(ForumCategory),
        nullable=False,
        default=ForumCategory.GENERAL,
        index=True,
    )
    posted_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    views_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    likes_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True,
    )

    poster: Mapped[User] = relationship(
        "User",
        back_populates="forums_posted",
        lazy="joined",
    )

    __table_args__ = (
        Index(
            "ix_forums_body_embedding_hnsw",
            "body_embedding",
            postgresql_using="hnsw",
            postgresql_ops={"body_embedding": "vector_cosine_ops"},
        ),
    )
