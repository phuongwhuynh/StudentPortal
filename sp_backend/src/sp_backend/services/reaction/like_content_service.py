from sqlalchemy.orm import Session
from sp_backend.constants.content_type import ContentType
from sp_backend.models.reaction import Reaction
from sp_backend.models.user import User
from sp_backend.models.forum import Forum
from sp_backend.models.question import Question
from sp_backend.models.announcement import Announcement
from sp_backend.services.user.exception import UserNotFoundException
from sp_backend.services.reaction.exception import ContentNotFoundException
from sp_backend.schemas.reaction.reaction_schema import ReactionResponse
from typing import Optional


class LikeContentService:
    def __init__(
        self,
        db_session: Session,
        content_type: ContentType,
        content_id: int,
        user_id: int,
    ):
        self.db_session: Session = db_session
        self.content_type: ContentType = content_type
        self.content_id: int = content_id
        self.user_id: int = user_id
        self.reaction: Reaction = None
        self.content: Optional[Forum | Question | Announcement] = None

    def validate_request(self):
        # Validate that the user exists
        user = self.db_session.query(User).filter(User.id == self.user_id).first()
        if not user:
            raise UserNotFoundException()
        # validate that the content exists based on content_type and content_id
        if self.content_type == ContentType.FORUM:
            self.content = (
                self.db_session.query(Forum).filter(Forum.id == self.content_id).first()
            )
        elif self.content_type == ContentType.QUESTION:
            self.content = (
                self.db_session.query(Question)
                .filter(Question.id == self.content_id)
                .first()
            )
        elif self.content_type == ContentType.ANNOUNCEMENT:
            self.content = (
                self.db_session.query(Announcement)
                .filter(Announcement.id == self.content_id)
                .first()
            )
        if not self.content:
            raise ContentNotFoundException(self.content_type, self.content_id)

    def like_content(self):
        existing_reaction = (
            self.db_session.query(Reaction)
            .filter(
                Reaction.content_type == self.content_type,
                Reaction.content_id == self.content_id,
                Reaction.user_id == self.user_id,
            )
            .first()
        )
        if existing_reaction:
            self.reaction = existing_reaction
            return

        # Create a new reaction
        self.reaction = Reaction(
            content_type=self.content_type,
            content_id=self.content_id,
            user_id=self.user_id,
        )
        self.content.likes_count += 1
        try:
            self.db_session.add(self.reaction)
            self.db_session.add(self.content)
            self.db_session.commit()
            self.db_session.refresh(self.reaction)
            self.db_session.refresh(self.content)
        except:
            self.db_session.rollback()
            raise

    def invoke(self) -> Reaction:
        self.validate_request()
        self.like_content()
        return ReactionResponse(
            content_type=self.reaction.content_type,
            content_id=self.reaction.content_id,
            user_id=self.reaction.user_id,
        )
