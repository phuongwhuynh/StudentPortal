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
  