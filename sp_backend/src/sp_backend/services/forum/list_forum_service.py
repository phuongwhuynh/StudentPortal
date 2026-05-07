from sp_backend.models.forum import Forum
from sp_backend.models.reaction import Reaction
from sp_backend.models.content_daily_view import ContentDailyView
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, Query, joinedload
from sp_backend.schemas.forum.get_forum_schema import (
    PosterInfo,
    GetForumResponse,
    ForumListResponse,
)
from sp_backend.constants.forum import SortOptions, ForumCategory
from sp_backend.constants.content_type import ContentType
from typing import Optional
from sp_backend.services.forum.exception import InvalidQueryParameterException
from datetime import date, timedelta
from sp_backend.services.embedding.embedding_service import EmbeddingService


class ListForumService:
    def __init__(
        self,
        db_session: Session,
        sort_by: SortOptions,
        category: Optional[ForumCategory],
        search: Optional[str],
        limit: int,
        offset: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.sort_by: SortOptions = sort_by
        self.category: Optional[ForumCategory] = category
        self.search: Optional[str] = search
        self.limit: int = limit
        self.offset: int = offset
        self.query: Optional[Query] = None
        self.forum_list_response: Optional[ForumListResponse] = None
        self.user_id: Optional[int] = user_id

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
        forum_query: Query = self.db_session.query(Forum)
        if self.category:
            forum_query = forum_query.filter(Forum.category == self.category)
        if self.search:
            search_pattern = f"%{self.search}%"
            forum_query = forum_query.filter(
                or_(
                    Forum.title.ilike(search_pattern),
                    Forum.body.ilike(search_pattern),
                )
            )
        forum_query = forum_query.order_by(Forum.created_at.desc())
        forum_query = forum_query.offset(self.offset).limit(self.limit)
        return forum_query

    def sort_by_trending_query(self):
        # search here would be keyword search
        today = date.today()
        week_ago = today - timedelta(days=7)
        views_subq = (
            self.db_session.query(
                ContentDailyView.content_id.label("forum_id"),
                func.coalesce(func.sum(ContentDailyView.views_count), 0).label(
                    "total_views"
                ),
            )
            .filter(
                ContentDailyView.content_type == ContentType.FORUM,
                ContentDailyView.content_date >= week_ago,
                ContentDailyView.content_date <= today,
            )
            .group_by(ContentDailyView.content_id)
            .subquery()
        )
        total_views_col = func.coalesce(views_subq.c.total_views, 0).label(
            "total_views"
        )
        forum_query = self.db_session.query(Forum).outerjoin(
            views_subq, Forum.id == views_subq.c.forum_id
        )
        if self.category:
            forum_query = forum_query.filter(Forum.category == self.category)
        if self.search:
            search_pattern = f"%{self.search}%"
            forum_query = forum_query.filter(
                or_(
                    Forum.title.ilike(search_pattern),
                    Forum.body.ilike(search_pattern),
                )
            )
        forum_query = forum_query.order_by(
            total_views_col.desc(), Forum.created_at.desc()
        )
        forum_query = forum_query.offset(self.offset).limit(self.limit)
        return forum_query

    def sort_by_relevant_query(self):
        forum_query: Query = self.db_session.query(Forum)
        if self.category:
            forum_query = forum_query.filter(Forum.category == self.category)
        search_embedding = EmbeddingService.get_embedding(self.search)
        distance = Forum.embedding.op("<=>")(search_embedding).label("distance")
        forum_query = forum_query.order_by(distance.asc())
        forum_query = forum_query.offset(self.offset).limit(self.limit)
        return forum_query

    def build_query(self):
        if self.sort_by == SortOptions.RECENT:
            query: Query = self.sort_by_recent_query()
        elif self.sort_by == SortOptions.TRENDING:
            query: Query = self.sort_by_trending_query()
        else:
            query: Query = self.sort_by_relevant_query()
        self.query = query.options(joinedload(Forum.poster))

    def get_forums(self):
        forums: list[Forum] = self.query.all()
        forum_ids = [forum.id for forum in forums]
        liked_forum_ids = []
        if self.user_id is not None and forum_ids:
            reactions = (
                self.db_session.query(Reaction.content_id)
                .filter(
                    Reaction.content_type == ContentType.FORUM,
                    Reaction.content_id.in_(forum_ids),
                    Reaction.user_id == self.user_id,
                )
                .all()
            )
            liked_forum_ids = [r.content_id for r in reactions]

        self.forum_list_response = ForumListResponse(
            forums=[
                GetForumResponse(
                    id=forum.id,
                    title=forum.title,
                    category=forum.category,
                    posted_by=PosterInfo(
                        id=forum.poster.id,
                        full_name=forum.poster.full_name,
                    ),
                    body=forum.body,
                    created_at=forum.created_at,
                    updated_at=forum.updated_at,
                    views_count=forum.views_count,
                    likes_count=forum.likes_count,
                    comments_count=forum.comments_count,
                    has_liked=forum.id in liked_forum_ids,
                )
                for forum in forums
            ],
        )

    def invoke(self) -> ForumListResponse:
        self.validate_request()
        self.sanitize_search_query()
        self.build_query()
        self.get_forums()
        return self.forum_list_response
