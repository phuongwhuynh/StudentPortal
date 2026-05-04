# sp_backend Overview

This folder contains a FastAPI backend for the University Information Hub. It currently focuses on:

- user authentication (sign in/sign out/current user claims)
- health check endpoint
- PostgreSQL + pgvector data layer
- Alembic-managed schema migrations

## Tech Stack

- Python 3.12+
- FastAPI + Uvicorn
- SQLAlchemy 2.x (ORM)
- Alembic (migrations)
- PostgreSQL with `pgvector`
- JWT (`pyjwt`) + password hashing (`bcrypt`)

Main dependency file: `sp_backend/pyproject.toml`

## High-Level Structure

```text
sp_backend/
	src/sp_backend/
		main.py                # FastAPI app entry point
		web_app.py             # Router + middleware registration
		routers/               # API routers (health, user)
		middlewares/           # Request-scoped DB session middleware
		dependencies/          # Auth dependency (cookie JWT validation)
		db/                    # SQLAlchemy base + engine/session setup
		models/                # ORM entities
		schemas/               # Request/response Pydantic schemas
		services/              # Business logic (signin, password service)
		constants/             # Domain enums/constants
		utils/                 # Utility helpers (JWT)
	alembic/                # Migration environment + versions
	scripts/seed.py         # Seed users
	docker/docker-compose.yml
	Makefile
```

## Application Flow

1. `main.py` creates `FastAPI(title="Student Portal API", version="1.0.0", root_path="/api/v1")`.
2. `web_app.py` wires routers and middlewares.
3. `DBMiddleware` (`middlewares/db_middleware.py`) opens one SQLAlchemy session per request and closes it after response.
4. Routers use `request.state.db` for DB access.

## API Surface (Current)

- `GET /health` -> health check
- `POST /signin` -> verify user credentials and set `access_token` cookie
- `POST /signout` -> clear auth cookie
- `GET /` -> return current user claims (requires valid `access_token` cookie)

Note: Because `root_path` is `/api/v1`, the app is intended to be mounted behind that base path (for example, `/api/v1/signin`).

## Database Setup

Docker database service (`docker/docker-compose.yml`):

- image: `ankane/pgvector:latest`
- host port: `5433` -> container `5432`
- default DB: `student_portal`
- default user: `student_portal_user`

Default app DB settings come from `core/config.py` (overridable via `.env`):

- `DB_HOST=localhost`
- `DB_PORT=5433`
- `DB_NAME=student_portal`
- `DB_USER=student_portal_user`
- `DB_PASSWORD=student_portal_password`

Connection URL is built in `db/session.py` as `postgresql+psycopg2://...`.

## Schema and Migrations

Alembic is configured in `alembic/env.py`, and uses metadata from `db/base.py`.

Current migrations:

1. `a304333c3fe1_create_table_user.py`
2. `24cfbecf5bed_create_table_forum.py`

### Tables Created by Migrations

`users`

- `id` (PK, int)
- `role` (`userrole`: `STUDENT` or `STAFF`)
- `hashed_password`
- `full_name`
- `email` (unique index)
- `created_at`, `updated_at`

`forums`

- `id` (PK, int)
- `title`, `body`
- `body_embedding` (`vector(1536)`)
- `category` (`forumcategory` enum)
- `posted_by` (FK -> `users.id`)
- `views_count`, `likes_count`, `comments_count`
- `created_at`, `updated_at`
- HNSW vector index on `body_embedding` for cosine similarity

The forum migration creates the `vector` extension if needed.

## ORM Model Status

Implemented and imported into metadata:

- `User` (`models/user.py`)
- `Forum` (`models/forum.py`)

Present in code but not yet covered by migrations:

- `Comment`
- `Reaction`
- `ContentView`
- `ContentDailyView`

Placeholder (empty) model files:

- `Announcement`
- `Question`

This means the live DB schema is currently aligned mainly with `User` and `Forum`.

## Auth and Security Notes

- Sign-in validates email/password against `users` table via `UserSignInService`.
- Passwords are hashed with `bcrypt` (`services/password/password_service.py`).
- JWT token is stored in HttpOnly cookie `access_token`.
- Current local-dev cookie config in `user_router.py` sets `secure=False` and `max_age=3600`.

## Seed Data

`scripts/seed.py` inserts 4 demo users (2 staff, 2 students) with hashed passwords.

## Common Commands

From `sp_backend/Makefile`:

- `make docker-up` -> start pgvector database
- `make docker-down` -> stop database
- `make migrate` -> run Alembic migrations
- `make seed` -> seed demo users
- `make run-backend` -> start FastAPI with reload
- `make setup` -> reset DB, migrate, and seed

## Quick Start

```bash
cd sp_backend
poetry install
make docker-up
make migrate
make seed
make run-backend
```

## Practical Next Backend Steps

- Add migrations for `comments`, `reactions`, `content_views`, and `content_daily_views`.
- Implement `announcements` and `questions` models + routers.
- Prefix user routes (for example `/users`) to avoid root-level collisions.
- Move JWT/cookie settings to environment-driven config for production hardening.
