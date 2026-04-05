# University Information Hub

University Information Hub is a student portal UI for forums, announcements, and Q&A threads.

Main users:
- Guest
- Student
- Staff (Admin)

## Current Goal

Build a frontend-first version with:
- Role-based login/logout UI.
- Guest access without login.
- Staff-only registration UI (for test accounts).
- Mock API layer (no backend yet), with centralized URL constants.
- Complete metadata on posts and replies: comments count, views, likes, created/replied/deleted timestamps, posted/replied/deleted by.
- Full thread view for Forums, Announcements, and Q&A (Facebook-style post + comment flow).

## Authentication and Access Model

Authentication model for now:
- Use sample local accounts for testing.
- Keep flow SSO-ready by abstracting auth service in API layer.

Required UI actions:
- Login
- Logout
- Continue as Guest (no login)
- Register new account (staff role only)

Registration rule:
- Only staff registration is available in this phase.
- Student accounts are seeded test accounts.
- Guest does not have an account and can enter directly as anonymous user.

### Sample Accounts (Testing)

Use these seed accounts in mock auth:

| Role | Email | Password | Display Name |
|---|---|---|---|
| staff | `staff.admin@unihub.edu` | `Staff@123` | `Admin Office` |
| staff | `it.staff@unihub.edu` | `Staff@123` | `IT Services Staff` |
| student | `student.alex@unihub.edu` | `Student@123` | `Alex Nguyen` |
| student | `student.mai@unihub.edu` | `Student@123` | `Mai Tran` |

Guest access:
- No account needed.
- User can click `Continue as Guest` to browse/search only.

Role permissions:
- Guest: view + search only.
- Student: create + view + search + reply/comment + like.
- Staff: all student permissions + delete in all modules + set Q&A status (`completed` or `cancelled`).

## Mock API Design

Keep URLs in one file so endpoint changes happen once.

Recommended files:
- `src/app/api/constants.ts`
- `src/app/api/services/auth.service.ts`
- `src/app/api/services/forums.service.ts`
- `src/app/api/services/announcements.service.ts`
- `src/app/api/services/questions.service.ts`
- `src/app/api/mockDb.ts`
- `src/app/api/mockHandlers.ts`

`constants.ts` example:

```ts
export const API_BASE_URL = "https://api.unihub.edu/v1";

export const API_ENDPOINTS = {
  authLogin: `${API_BASE_URL}/auth/login`,
  authLogout: `${API_BASE_URL}/auth/logout`,
  authRegisterStaff: `${API_BASE_URL}/auth/register/staff`,
  forums: `${API_BASE_URL}/forums`,
  forumById: (id: string) => `${API_BASE_URL}/forums/${id}`,
  forumComments: (id: string) => `${API_BASE_URL}/forums/${id}/comments`,
  announcements: `${API_BASE_URL}/announcements`,
  announcementById: (id: string) => `${API_BASE_URL}/announcements/${id}`,
  announcementComments: (id: string) => `${API_BASE_URL}/announcements/${id}/comments`,
  questions: `${API_BASE_URL}/questions`,
  questionById: (id: string) => `${API_BASE_URL}/questions/${id}`,
  questionReplies: (id: string) => `${API_BASE_URL}/questions/${id}/replies`,
  questionStatus: (id: string) => `${API_BASE_URL}/questions/${id}/status`,
};
```

Inside each service method, keep a real URL comment:

```ts
// Real API: POST ${API_ENDPOINTS.forums}
// Example: POST https://api.unihub.edu/v1/forums
```

## PostgreSQL Database Schema

Database: `unihub`
Schema: `public`

Semantic search support:
- Use `pgvector` extension.
- Store embedding vectors in content tables.
- Create HNSW indexes for fast approximate nearest-neighbor retrieval.

```sql
-- Optional for case-insensitive email
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE user_role AS ENUM ('guest', 'student', 'staff');
CREATE TYPE content_type AS ENUM ('forum', 'announcement', 'question');
CREATE TYPE question_status AS ENUM ('open', 'completed', 'cancelled');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE forums (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  category VARCHAR(120) NOT NULL,
  posted_by UUID NOT NULL REFERENCES users(id),
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  category VARCHAR(120) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'info',
  posted_by UUID NOT NULL REFERENCES users(id),
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  category VARCHAR(120) NOT NULL,
  status question_status NOT NULL DEFAULT 'open',
  posted_by UUID NOT NULL REFERENCES users(id),
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  body_embedding VECTOR(768),
  posted_by UUID NOT NULL REFERENCES users(id),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id)
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (content_type, content_id, user_id)
);

CREATE TABLE content_views (
  id UUID PRIMARY KEY,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forums_created_at ON forums(created_at DESC);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_comments_content ON comments(content_type, content_id);
CREATE INDEX idx_reactions_content ON reactions(content_type, content_id);
CREATE INDEX idx_views_content ON content_views(content_type, content_id);

CREATE INDEX idx_forums_body_embedding_hnsw
  ON forums USING hnsw (body_embedding vector_cosine_ops);

CREATE INDEX idx_announcements_body_embedding_hnsw
  ON announcements USING hnsw (body_embedding vector_cosine_ops);

CREATE INDEX idx_questions_body_embedding_hnsw
  ON questions USING hnsw (body_embedding vector_cosine_ops);

CREATE INDEX idx_comments_body_embedding_hnsw
  ON comments USING hnsw (body_embedding vector_cosine_ops);
```

Notes:
- `comments.content_id` is polymorphic (forum/announcement/question) controlled by `content_type`.
- Soft delete is supported by `deleted_at` + `deleted_by`.
- Status audit is included for Q&A completion/cancellation.
- Embedding dimension `768` is an example. Keep this aligned with your embedding model output.

## Semantic Search Query Example

```sql
SELECT
  id,
  title,
  1 - (body_embedding <=> $1::vector) AS similarity
FROM forums
WHERE deleted_at IS NULL
ORDER BY body_embedding <=> $1::vector
LIMIT 20;
```

`$1` is the query embedding vector generated by your embedding model.

## Docker Compose (Frontend + PostgreSQL)

Files added:
- `docker-compose.yml` (repository root)
- `docker/postgres/init/01_schema.sql` (repository root)

Services:
- `frontend`: Vite app on port `5173`
- `postgres`: pgvector-enabled PostgreSQL on port `5432`

Run from repository root (`University-Information-Hub`):

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

Reset DB volume:

```bash
docker compose down -v
```

## Implementation Plan

### Phase 1: Auth and Role UI
- Add login page/dialog and logout action in header.
- Add current user badge in navigation.
- Add staff-only registration page/form.
- Seed sample accounts in mock auth DB.

### Phase 2: Centralized API and Mock Backend
- Add `api/constants.ts` for all endpoints.
- Add service files with real endpoint comments.
- Add mock handlers with Promise delay to emulate API.

### Phase 3: Feature Wiring
- Forums: create, search, view, comment/reply, like, staff delete.
- Announcements: create (staff), search, view, comment/reply, staff delete.
- Q&A: create/search/view/reply, staff complete/cancel, staff delete.

### Phase 4: Full Thread Views
- Add route pages for full post/thread:
  - `/forums/:id`
  - `/announcements/:id`
  - `/questions/:id`
- Render Facebook-style content card + comment thread + metadata row.

### Phase 5: PostgreSQL Backend Readiness
- Bring up PostgreSQL with pgvector using Docker Compose.
- Apply schema from `docker/postgres/init/01_schema.sql`.
- Keep service contracts same as mock version.
- Replace mock handlers with real HTTP calls when backend is ready.

### Phase 6: Semantic Indexing Pipeline
- Pick embedding model (dimension must match DB vector columns).
- Generate embeddings on create/update for forums, announcements, questions, comments.
- Store vectors in `body_embedding` columns.
- Add semantic search endpoint per content type (top-k similarity).
- Add hybrid search (keyword + vector rerank) for better relevance.

## Run Frontend

```bash
npm i
npm run dev
```
  