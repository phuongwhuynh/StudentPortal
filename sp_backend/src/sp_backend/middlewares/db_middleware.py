from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from sp_backend.db.session import SessionLocal


class DBMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request.state.db = SessionLocal()

        try:
            response = await call_next(request)
        finally:
            request.state.db.close()

        return response
