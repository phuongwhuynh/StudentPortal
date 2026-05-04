from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sp_backend.models.user import User
from sp_backend.db.base import Base
from sqlalchemy import Integer, String, Text, ForeignKey, Enum, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from sp_backend.constants.embedding import EMBEDDING_DIM
from datetime import datetime
from sp_backend.constants.question import QuestionCategory, QuestionStatus


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    body_embedding: Mapped[list[float]] = mapped_column(
        Vector(EMBEDDING_DIM),
        nullable=False,
    )
    category: Mapped[QuestionCategory] = mapped_column(
        Enum(QuestionCategory), nullable=False, index=True
    )
    status: Mapped[QuestionStatus] = mapped_column(
        Enum(QuestionStatus), nullable=False, index=True
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
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    completed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    cancelled_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    poster: Mapped[User] = relationship(
        "User",
        back_populates="questions_posted",
        foreign_keys=[posted_by],
    )
    completer: Mapped[User | None] = relationship(
        "User",
        back_populates="questions_completed",
        foreign_keys=[completed_by],
    )
    canceller: Mapped[User | None] = relationship(
        "User",
        back_populates="questions_cancelled",
        foreign_keys=[cancelled_by],
    )
    __table_args__ = (
        Index(
            "ix_questions_body_embedding_hnsw",
            "body_embedding",
            postgresql_using="hnsw",
            postgresql_ops={"body_embedding": "vector_cosine_ops"},
        ),
    )
