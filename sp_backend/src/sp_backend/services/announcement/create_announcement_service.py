from sqlalchemy.orm import Session
from sp_backend.schemas.announcement.create_announcement_schema import (
    CreateAnnouncementRequest,
    CreateAnnouncementResponse,
    AnnouncementPoster,
)
from sp_backend.models.user import User
from sp_backend.constants.user import UserRole
from sp_backend.models.announcement import Announcement
from sp_backend.services.user.exception import (
    UserNotFoundException,
    PermissionException,
)
from sp_backend.services.embedding.embedding_service import EmbeddingService


class CreateAnnouncementService:
    def __init__(
        self,
        db_session: Session,
        create_announcement_request: CreateAnnouncementRequest,
        user_id: int,
    ):
        self.db_session: Session = db_session
        self.create_announcement_request: CreateAnnouncementRequest = (
            create_announcement_request
        )
        self.user_id: int = user_id
        self.embedding: list[float] = []
        self.announcement: Announcement = None
        self.user: User = None

    def validate_request(self) -> None:
        self.user = self.db_session.get(User, self.user_id)
        if not self.user:
            raise UserNotFoundException()
        if not self.user.role == UserRole.STAFF:
            raise PermissionException("Only staff users can create announcements")

    def generate_embedding(self) -> None:
        self.embedding = EmbeddingService.get_embedding(
            text=self.create_announcement_request.body
        )

    def create_announcement(self) -> None:
        self.announcement = Announcement(
            title=self.create_announcement_request.title,
            body=self.create_announcement_request.body,
            body_embedding=self.embedding,
            category=self.create_announcement_request.category,
            priority=self.create_announcement_request.priority,
            posted_by=self.user_id,
        )
        try:
            self.db_session.add(self.announcement)
            self.db_session.commit()
            self.db_session.refresh(self.announcement)
        except:
            self.db_session.rollback()
            raise

    def invoke(self) -> CreateAnnouncementResponse:
        self.validate_request()
        self.generate_embedding()
        self.create_announcement()
        return CreateAnnouncementResponse(
            id=self.announcement.id,
            title=self.announcement.title,
            body=self.announcement.body,
            category=self.announcement.category,
            posted_by=AnnouncementPoster(
                id=self.user.id,
                email=self.user.email,
                full_name=self.user.full_name,
            ),
            views_count=self.announcement.views_count,
            likes_count=self.announcement.likes_count,
            comments_count=self.announcement.comments_count,
            created_at=self.announcement.created_at,
            updated_at=self.announcement.updated_at,
        )
