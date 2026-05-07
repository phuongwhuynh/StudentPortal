from sp_backend.models.question import Question
from sp_backend.models.reaction import Reaction
from sp_backend.models.content_daily_view import ContentDailyView
from sqlalchemy import or_, func
from sqlalchemy.orm import Session, Query, joinedload
from sp_backend.schemas.question.get_question_schema import (
    QuestionAnswerer,
    QuestionPoster,
    GetQuestionWithLatestCommentResponse,
    ListQuestionsResponse,
    LatestComment,
    CommentPoster,
)
from sp_backend.constants.question import SortOptions, QuestionCategory, QuestionStatus
from sp_backend.constants.content_type import ContentType
from typing import Optional
from sp_backend.services.question.exception import InvalidQueryParameterException
from datetime import date, timedelta
from sp_backend.services.embedding.embedding_service import EmbeddingService
from sp_backend.models.comment import Comment


class ListQuestionService:
    def __init__(
        self,
        db_session: Session,
        sort_by: SortOptions,
        category: Optional[QuestionCategory],
        status: Optional[QuestionStatus],
        search: Optional[str],
        limit: int,
        offset: int,
        user_id: Optional[int] = None,
    ):
        self.db_session: Session = db_session
        self.sort_by: SortOptions = sort_by
        self.category: Optional[QuestionCategory] = category
        self.status: Optional[QuestionStatus] = status
        self.search: Optional[str] = search
        self.limit: int = limit
        self.offset: int = offset
        self.query: Optional[Query] = None
        self.question_list_response: Optional[ListQuestionsResponse] = None
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
        question_query: Query = self.db_session.query(Question)
        if self.category:
            question_query = question_query.filter(Question.category == self.category)
        if self.status:
            question_query = question_query.filter(Question.status == self.status)
        if self.search:
            search_pattern = f"%{self.search}%"
            question_query = question_query.filter(
                or_(
                    Question.title.ilike(search_pattern),
                    Question.body.ilike(search_pattern),
                )
            )
        question_query = question_query.order_by(Question.created_at.desc())
        question_query = question_query.offset(self.offset).limit(self.limit)
        return question_query

    def sort_by_trending_query(self) -> Query:
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
                ContentDailyView.content_type == ContentType.QUESTION,
                ContentDailyView.content_date >= week_ago,
                ContentDailyView.content_date <= today,
            )
            .group_by(ContentDailyView.content_id)
            .subquery()
        )
        total_views_col = func.coalesce(views_subq.c.total_views, 0).label(
            "total_views"
        )
        question_query = self.db_session.query(Question).outerjoin(
            views_subq, Question.id == views_subq.c.forum_id
        )
        if self.category:
            question_query = question_query.filter(Question.category == self.category)
        if self.status:
            question_query = question_query.filter(Question.status == self.status)
        if self.search:
            search_pattern = f"%{self.search}%"
            question_query = question_query.filter(
                or_(
                    Question.title.ilike(search_pattern),
                    Question.body.ilike(search_pattern),
                )
            )
        question_query = question_query.order_by(
            total_views_col.desc(), Question.created_at.desc()
        )
        question_query = question_query.offset(self.offset).limit(self.limit)
        return question_query

    def sort_by_relevant_query(self) -> Query:
        question_query: Query = self.db_session.query(Question)
        if self.category:
            question_query = question_query.filter(Question.category == self.category)
        if self.status:
            question_query = question_query.filter(Question.status == self.status)
        search_embedding = EmbeddingService.get_embedding(self.search)
        distance = Question.embedding.op("<=>")(search_embedding).label("distance")
        question_query = question_query.order_by(distance.asc())
        question_query = question_query.offset(self.offset).limit(self.limit)
        return question_query

    def build_query(self):
        if self.sort_by == SortOptions.RECENT:
            query: Query = self.sort_by_recent_query()
        elif self.sort_by == SortOptions.TRENDING:
            query: Query = self.sort_by_trending_query()
        else:
            query: Query = self.sort_by_relevant_query()
        self.query = query.options(joinedload(Question.poster))

    def get_questions(self):
        questions: list[Question] = self.query.all()
        question_ids = [question.id for question in questions]
        liked_question_ids = []
        if self.user_id is not None and question_ids:
            reactions = (
                self.db_session.query(Reaction.content_id)
                .filter(
                    Reaction.content_type == ContentType.FORUM,
                    Reaction.content_id.in_(question_ids),
                    Reaction.user_id == self.user_id,
                )
                .all()
            )
            liked_question_ids = [r.content_id for r in reactions]
        # Get latest comment for each question
        latest_comments_subq = (
            self.db_session.query(
                Comment.content_id, func.max(Comment.created_at).label("max_created_at")
            )
            .filter(
                Comment.content_type == ContentType.QUESTION,
                Comment.content_id.in_(question_ids),
            )
            .group_by(Comment.content_id)
            .subquery()
        )
        latest_comments = (
            self.db_session.query(Comment)
            .options(joinedload(Comment.poster))
            .join(
                latest_comments_subq,
                (Comment.content_id == latest_comments_subq.c.content_id)
                & (Comment.created_at == latest_comments_subq.c.max_created_at),
            )
            .all()
        )
        latest_comment_map = {c.content_id: c for c in latest_comments}

        self.question_list_response = ListQuestionsResponse(
            questions=[
                GetQuestionWithLatestCommentResponse(
                    id=question.id,
                    title=question.title,
                    body=question.body,
                    category=question.category,
                    status=question.status,
                    posted_by=QuestionPoster(
                        id=question.poster.id,
                        name=question.poster.full_name,
                        role=question.poster.role,
                    ),
                    answerer=(
                        QuestionAnswerer(
                            id=question.completer.id,
                            name=question.completer.full_name,
                            role=question.completer.role,
                        )
                        if question.completer
                        else None
                    ),
                    completed_at=question.completed_at,
                    created_at=question.created_at,
                    views_count=question.views_count,
                    likes_count=question.likes_count,
                    comments_count=question.comments_count,
                    has_liked=question.id in liked_question_ids,
                    latest_comment=(
                        LatestComment(
                            id=latest_comment_map[question.id].id,
                            content=latest_comment_map[question.id].body,
                            posted_by=CommentPoster(
                                id=latest_comment_map[question.id].poster.id,
                                name=latest_comment_map[question.id].poster.full_name,
                                role=latest_comment_map[question.id].poster.role,
                            ),
                            created_at=latest_comment_map[question.id].created_at,
                        )
                        if question.id in latest_comment_map
                        else None
                    ),
                )
                for question in questions
            ]
        )

    def invoke(self):
        self.validate_request()
        self.sanitize_search_query()
        self.build_query()
        self.get_questions()
        return self.question_list_response
