from fastapi import FastAPI
from sp_backend.routers import (
    health_router,
    user_router,
    forum_router,
    announcement_router,
)
from sp_backend.middlewares.db_middleware import DBMiddleware


def initialize_routers(app: FastAPI) -> FastAPI:
    app.include_router(health_router.router)
    app.include_router(user_router.router)
    app.include_router(forum_router.router)
    app.include_router(announcement_router.router)
    return app


def initialize_middlewares(app: FastAPI) -> FastAPI:
    app.add_middleware(DBMiddleware)
    return app


def initialize_app(app: FastAPI = None) -> FastAPI:
    app = initialize_routers(app)
    app = initialize_middlewares(app)
    return app
