"""add indexes to title and body

Revision ID: 504c2be2188c
Revises: 7cba3f075e8c
Create Date: 2026-05-04 10:52:05.255865

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "504c2be2188c"
down_revision: Union[str, Sequence[str], None] = "7cba3f075e8c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable extension
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

    # Forum trigram indexes
    op.execute(
        "CREATE INDEX ix_forum_title_trgm ON forums USING GIN (title gin_trgm_ops);"
    )
    op.execute(
        "CREATE INDEX ix_forum_body_trgm ON forums USING GIN (body gin_trgm_ops);"
    )

    # Announcement trigram indexes
    op.execute(
        "CREATE INDEX ix_announcement_title_trgm ON announcements USING GIN (title gin_trgm_ops);"
    )
    op.execute(
        "CREATE INDEX ix_announcement_body_trgm ON announcements USING GIN (body gin_trgm_ops);"
    )

    # Question trigram indexes
    op.execute(
        "CREATE INDEX ix_question_title_trgm ON questions USING GIN (title gin_trgm_ops);"
    )
    op.execute(
        "CREATE INDEX ix_question_body_trgm ON questions USING GIN (body gin_trgm_ops);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_forum_title_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_forum_body_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_announcement_title_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_announcement_body_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_question_title_trgm;")
    op.execute("DROP INDEX IF EXISTS ix_question_body_trgm;")
