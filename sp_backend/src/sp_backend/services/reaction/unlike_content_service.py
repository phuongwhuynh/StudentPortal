from sqlalchemy.orm import Session
from sp_backend.constants.content_type import ContentType
from sp_backend.models.reaction import Reaction
from sp_backend.models.user import User
from sp_backend.models.forum import Forum
from sp_backend.models.question import Question
from sp_backend.models.announcement import Announcement
from sp_backend.services.user.exception import UserNotFoundException
from sp_backend.services.reaction.exception import (
    ContentNotFoundException,
    ReactionNotFoundException,
)
from sp_backend.schemas.reaction.reaction_schema import ReactionResponse


class UnlikeContentService:
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

    def validate_request(self):
        # Validate that the user exists
        user = self.db_session.query(User).filter(User.id == self.user_id).first()
        if not user:
            raise UserNotFoundException()
        # validate that the reaction exists based on content_type and content_id
        reaction = (
            self.db_session.query(Reaction)
            .filter(
                Reaction.user_id == self.user_id,
                Reaction.content_type == self.content_type,
                Reaction.content_id == self.content_id,
            )
            .first()
        )
        if not reaction:
            raise ReactionNotFoundException(
                self.user_id, self.content_type, self.content_id
            )
        self.reaction = reaction

    def delete_reaction(self):
        try:
            self.db_session.delete(self.reaction)
            self.db_session.commit()
        except Exception as e:
            self.db_session.rollback()
            raise e

    def invoke(self) -> None:
        self.validate_request()
        self.delete_reaction()
