from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sp_backend.models.forum import Forum
from sp_backend.db.base import Base
from sqlalchemy import Integer, Date, ForeignKey, UniqueConstraint, Index, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from sp_backend.constants.content_type import ContentType


class ContentDailyView(Base):
    __tablename__ = "content_daily_views"

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    content_type: Mapped[ContentType] = mapped_column(
        Enum(ContentType, name="contenttype"), nullable=False
    )
    content_id: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # ko gắn foreign key, application logic tự handle
    content_date: Mapped[date] = mapped_column(Date, nullable=False)
    views_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint(
            "content_type", "content_id", "content_date", name="uq_content_daily_views"
        ),
        Index(
            "ix_cdv_date_content_cover",
            "content_date",
            "content_type",
            "content_id",
            postgresql_include=["views_count"],
        ),
    )
