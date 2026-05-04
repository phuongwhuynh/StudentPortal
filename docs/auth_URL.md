POST /v1/auth/login
POST /v1/auth/logout
POST /v1/auth/register/staff

Auth feature URL reference:
- `POST /v1/auth/login` for staff/student login.
- `POST /v1/auth/logout` for ending the current session.
- `POST /v1/auth/register/staff` for staff-only test account registration.

Notes:
- Guest access does not require an auth endpoint.
- Student accounts are seeded locally for testing.
- Keep these URLs centralized in `src/app/api/constants.ts` when the backend is added.
