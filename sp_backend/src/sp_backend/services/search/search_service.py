from sqlalchemy import Float, cast, Enum, literal
from sqlalchemy.orm import Session, Query

from sp_backend.constants.content_type import ContentType
from typing import Optional
from sp_backend.constants.forum import ForumCategory
from sp_backend.constants.question import QuestionCategory, QuestionStatus
from sp_backend.constants.announcement import AnnouncementCategory, AnnouncementPriority
from sp_backend.services.embedding.embedding_service import EmbeddingService
from sp_backend.models.forum import Forum
from sp_backend.models.user import User
from sp_backend.models.announcement import Announcement
from sp_backend.models.question import Question
from sp_backend.schemas.search.search_schema import (
    SearchResponse,
    ContentResult,
    PosterInfo,
)
from sp_backend.constants.content_type import ContentType
from sp_backend.models.reaction import Reaction


class SearchService:
    def __init__(
        self,
        db_session: Session,
        search: str,
        limit: int,
        offset: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.search: str = search
        self.limit: int = limit
        self.offset: int = offset
        self.user_id: Optional[int] = user_id
        self.final_query: Optional[Query] = None
        self.search_response: Optional[SearchResponse] = None

    def sanitize_search_query(self):
        if self.search:
            self.search = self.search.strip()

    def build_query(self):

        search_embedding = EmbeddingService.get_embedding(self.search)

        forum_category_enum = Enum(ForumCategory, name="forumcategory")
        question_category_enum = Enum(QuestionCategory, name="questioncategory")
        question_status_enum = Enum(QuestionStatus, name="questionstatus")
        announcement_category_enum = Enum(
            AnnouncementCategory, name="announcementcategory"
        )
        announcement_priority_enum = Enum(
            AnnouncementPriority, name="announcementpriority"
        )
        # Forum query
        forum_query = self.db_session.query(
            Forum.id.label("id"),
            Forum.title.label("title"),
            Forum.body.label("body"),
            Forum.category.label("forum_category"),
            cast(None, question_category_enum).label("question_category"),
            cast(None, question_status_enum).label("question_status"),
            cast(None, announcement_category_enum).label("announcement_category"),
            cast(None, announcement_priority_enum).label("announcement_priority"),
            literal(ContentType.FORUM.value).label("content_type"),
            cast(Forum.embedding.op("<=>")(search_embedding), Float).label("distance"),
            Forum.posted_by.label("posted_by_id"),
            Forum.views_count.label("views_count"),
            Forum.likes_count.label("likes_count"),
            Forum.comments_count.label("comments_count"),
        )

        # Announcement query
        announcement_query = self.db_session.query(
            Announcement.id.label("id"),
            Announcement.title.label("title"),
            Announcement.body.label("body"),
            cast(None, forum_category_enum).label("forum_category"),
            cast(None, question_category_enum).label("question_category"),
            cast(None, question_status_enum).label("question_status"),
            Announcement.category.label("announcement_category"),
            Announcement.priority.label("announcement_priority"),
            literal(ContentType.ANNOUNCEMENT.value).label("content_type"),
            cast(Announcement.embedding.op("<=>")(search_embedding), Float).label(
                "distance"
            ),
            Announcement.posted_by.label("posted_by_id"),
            Announcement.views_count.label("views_count"),
            Announcement.likes_count.label("likes_count"),
            Announcement.comments_count.label("comments_count"),
        )
        question_query = self.db_session.query(
            Question.id.label("id"),
            Question.title.label("title"),
            Question.body.label("body"),
            cast(None, forum_category_enum).label("forum_category"),
            Question.category.label("question_category"),
            Question.status.label("question_status"),
            cast(None, announcement_category_enum).label("announcement_category"),
            cast(None, announcement_priority_enum).label("announcement_priority"),
            literal(ContentType.QUESTION.value).label("content_type"),
            cast(Question.embedding.op("<=>")(search_embedding), Float).label(
                "distance"
            ),
            Question.posted_by.label("posted_by_id"),
            Question.views_count.label("views_count"),
            Question.likes_count.label("likes_count"),
            Question.comments_count.label("comments_count"),
        )

        # Union all queries
        union_query = forum_query.union_all(
            announcement_query, question_query
        ).subquery()

        self.final_query = (
            self.db_session.query(
                union_query.c.id,
                union_query.c.title,
                union_query.c.body,
                union_query.c.forum_category,
                union_query.c.question_category,
                union_query.c.question_status,
                union_query.c.announcement_category,
                union_query.c.announcement_priority,
                union_query.c.content_type,
                union_query.c.distance,
                union_query.c.posted_by_id,
                User.full_name.label("posted_by_full_name"),
                union_query.c.views_count,
                union_query.c.likes_count,
                union_query.c.comments_count,
            )
            .join(User, union_query.c.posted_by_id == User.id)
            .order_by(union_query.c.distance.asc())
            .offset(self.offset)
            .limit(self.limit)
        )

    def build_response(self):
        results = self.final_query.all()
        search_results = []
        ids_by_type = {
            ContentType.FORUM.value: [],
            ContentType.QUESTION.value: [],
            ContentType.ANNOUNCEMENT.value: [],
        }
        for result in results:
            ids_by_type[result.content_type].append(result.id)

        liked_ids = set()
        if self.user_id is not None:
            reactions = (
                self.db_session.query(Reaction.content_type, Reaction.content_id)
                .filter(
                    Reaction.user_id == self.user_id,
                    (
                        (Reaction.content_type == ContentType.FORUM)
                        & (
                            Reaction.content_id.in_(
                                ids_by_type[ContentType.FORUM.value]
                            )
                        )
                    )
                    | (
                        (Reaction.content_type == ContentType.QUESTION)
                        & (
                            Reaction.content_id.in_(
                                ids_by_type[ContentType.QUESTION.value]
                            )
                        )
                    )
                    | (
                        (Reaction.content_type == ContentType.ANNOUNCEMENT)
                        & (
                            Reaction.content_id.in_(
                                ids_by_type[ContentType.ANNOUNCEMENT.value]
                            )
                        )
                    ),
                )
                .all()
            )
            liked_ids = {(r.content_type.value, r.content_id) for r in reactions}

        # Collect IDs by content type
        for result in results:
            has_liked = (result.content_type, result.id) in liked_ids
            search_results.append(
                ContentResult(
                    id=result.id,
                    title=result.title,
                    body=result.body,
                    forum_category=result.forum_category,
                    question_category=result.question_category,
                    question_status=result.question_status,
                    announcement_category=result.announcement_category,
                    announcement_priority=result.announcement_priority,
                    content_type=result.content_type,
                    posted_by=PosterInfo(
                        id=result.posted_by_id,
                        full_name=result.posted_by_full_name,
                    ),
                    views_count=result.views_count,
                    likes_count=result.likes_count,
                    comments_count=result.comments_count,
                    distance=result.distance,
                    has_liked=has_liked,
                )
            )
        self.search_response = SearchResponse(results=search_results)

    def invoke(self):
        self.sanitize_search_query()
        self.build_query()
        self.build_response()
        return self.search_response
