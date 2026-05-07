from sp_backend.models.announcement import Announcement
from sp_backend.models.reaction import Reaction
from sp_backend.models.content_daily_view import ContentDailyView
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, Query, joinedload
from sp_backend.schemas.announcement.get_announcement_schema import (
    AnnouncementPoster,
    GetAnnouncementResponse,
    ListAnnouncementsResponse,
)
from sp_backend.constants.announcement import (
    SortOptions,
    AnnouncementCategory,
    AnnouncementPriority,
)
from sp_backend.constants.content_type import ContentType
from typing import Optional
from sp_backend.services.announcement.exception import InvalidQueryParameterException
from datetime import timezone, timedelta, datetime, date
from sp_backend.services.embedding.embedding_service import EmbeddingService


class ListAnnouncementService:
    def __init__(
        self,
        db_session: Session,
        sort_by: SortOptions,
        category: Optional[AnnouncementCategory],
        priority: Optional[AnnouncementPriority],
        has_expired: Optional[bool],
        search: Optional[str],
        limit: int,
        offset: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.sort_by: SortOptions = sort_by
        self.category: Optional[AnnouncementCategory] = category
        self.priority: Optional[AnnouncementPriority] = priority
        self.has_expired: Optional[bool] = has_expired
        self.search: Optional[str] = search
        self.limit: int = limit
        self.offset: int = offset
        self.user_id: Optional[int] = user_id
        self.query: Optional[Query] = None
        self.announcement_list_response: Optional[ListAnnouncementsResponse] = None

    def validate_request(self):
        if not self.search and self.sort_by == SortOptions.RELEVANT:
            raise InvalidQueryParameterException(
                parameter_name="search",
                message="Search query is required when sorting by relevance",
            )

    def sanitize_search_query(self):
        if self.search:
            self.search = self.search.strip()

    def sort_by_recent_query(self) -> Query:
        # search here would be keyword search
        announcement_query: Query = self.db_session.query(Announcement)
        if self.category:
            announcement_query = announcement_query.filter(
                Announcement.category == self.category
            )
        if self.priority:
            announcement_query = announcement_query.filter(
                Announcement.priority == self.priority
            )
        if self.has_expired is not None:
            now = datetime.now(tz=timezone.utc)
            if self.has_expired:
                announcement_query = announcement_query.filter(
                    Announcement.expired_at < now
                )
            else:
                announcement_query = announcement_query.filter(
                    or_(
                        Announcement.expired_at == None,
                        Announcement.expired_at >= now,
                    )
                )
        if self.search:
            search_pattern = f"%{self.search}%"
            announcement_query = announcement_query.filter(
                or_(
                    Announcement.title.ilike(search_pattern),
                    Announcement.body.ilike(search_pattern),
                )
            )

        announcement_query = announcement_query.order_by(Announcement.created_at.desc())
        announcement_query = announcement_query.offset(self.offset).limit(self.limit)
        return announcement_query

    def sort_by_trending_query(self) -> Query:
        # search here would be keyword search
        today = date.today()
        week_ago = today - timedelta(days=7)
        views_subq = (
            self.db_session.query(
                ContentDailyView.content_id.label("announcement_id"),
                func.coalesce(func.sum(ContentDailyView.views_count), 0).label(
                    "total_views"
                ),
            )
            .filter(
                ContentDailyView.content_type == ContentType.ANNOUNCEMENT,
                ContentDailyView.content_date >= week_ago,
                ContentDailyView.content_date <= today,
            )
            .group_by(ContentDailyView.content_id)
            .subquery()
        )
        total_views_col = func.coalesce(views_subq.c.total_views, 0).label(
            "total_views"
        )
        announcement_query = self.db_session.query(Announcement).outerjoin(
            views_subq, Announcement.id == views_subq.c.announcement_id
        )
        if self.category:
            announcement_query = announcement_query.filter(
                Announcement.category == self.category
            )
        if self.priority:
            announcement_query = announcement_query.filter(
                Announcement.priority == self.priority
            )
        if self.has_expired is not None:
            now = datetime.now(tz=timezone.utc)
            if self.has_expired:
                announcement_query = announcement_query.filter(
                    Announcement.expired_at < now
                )
            else:
                announcement_query = announcement_query.filter(
                    or_(
                        Announcement.expired_at == None,
                        Announcement.expired_at >= now,
                    )
                )
        if self.search:
            search_pattern = f"%{self.search}%"
            announcement_query = announcement_query.filter(
                or_(
                    Announcement.title.ilike(search_pattern),
                    Announcement.body.ilike(search_pattern),
                )
            )
        announcement_query = announcement_query.order_by(
            total_views_col.desc(), Announcement.created_at.desc()
        )
        announcement_query = announcement_query.offset(self.offset).limit(self.limit)
        return announcement_query

    def sort_by_relevant_query(self) -> Query:
        # semantic search here
        announcement_query: Query = self.db_session.query(Announcement)
        if self.category:
            announcement_query = announcement_query.filter(
                Announcement.category == self.category
            )
        if self.priority:
            announcement_query = announcement_query.filter(
                Announcement.priority == self.priority
            )
        if self.has_expired is not None:
            now = datetime.now(tz=timezone.utc)
            if self.has_expired:
                announcement_query = announcement_query.filter(
                    Announcement.expired_at < now
                )
            else:
                announcement_query = announcement_query.filter(
                    or_(
                        Announcement.expired_at == None,
                        Announcement.expired_at >= now,
                    )
                )
        search_embedding = EmbeddingService.get_embedding(self.search)
        distance = Announcement.embedding.op("<=>")(search_embedding).label("distance")
        announcement_query = announcement_query.order_by(
            distance.asc(), Announcement.created_at.desc()
        )
        announcement_query = announcement_query.offset(self.offset).limit(self.limit)
        return announcement_query

    def build_query(self):
        if self.sort_by == SortOptions.RECENT:
            query = self.sort_by_recent_query()
        elif self.sort_by == SortOptions.TRENDING:
            query = self.sort_by_trending_query()
        elif self.sort_by == SortOptions.RELEVANT:
            query = self.sort_by_relevant_query()

        self.query = query.options(joinedload(Announcement.poster))

    def get_announcements(self):
        announcements: list[Announcement] = self.query.all()
        announcement_ids = [announcement.id for announcement in announcements]
        liked_announcement_ids = []
        if self.user_id is not None and announcement_ids:
            reactions = (
                self.db_session.query(Reaction.content_id)
                .filter(
                    Reaction.content_type == ContentType.ANNOUNCEMENT,
                    Reaction.content_id.in_(announcement_ids),
                    Reaction.user_id == self.user_id,
                )
                .all()
            )
            liked_announcement_ids = [r.content_id for r in reactions]
        now = datetime.now(tz=timezone.utc)
        self.announcement_list_response = ListAnnouncementsResponse(
            announcements=[
                GetAnnouncementResponse(
                    id=announcement.id,
                    title=announcement.title,
                    body=announcement.body,
                    category=announcement.category,
                    priority=announcement.priority,
                    created_at=announcement.created_at,
                    expired_at=announcement.expired_at,
                    has_expired=(
                        announcement.expired_at < now
                        if announcement.expired_at
                        else False
                    ),
                    views_count=announcement.views_count,
                    likes_count=announcement.likes_count,
                    comments_count=announcement.comments_count,
                    posted_by=AnnouncementPoster(
                        id=announcement.poster.id,
                        name=announcement.poster.full_name,
                        role=announcement.poster.role,
                    ),
                    has_liked=announcement.id in liked_announcement_ids,
                )
                for announcement in announcements
            ]
        )

    def invoke(self) -> ListAnnouncementsResponse:
        self.validate_request()
        self.sanitize_search_query()
        self.build_query()
        self.get_announcements()
        return self.announcement_list_response
