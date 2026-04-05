from fastapi import FastAPI
from sp_backend.routers import health_router


def initialize_routers(app: FastAPI) -> FastAPI:
    app.include_router(health_router.router)
    return app


def initialize_middlewares(app: FastAPI) -> FastAPI:
    return app


def initialize_app(app: FastAPI = None) -> FastAPI:
    app = initialize_routers(app)
    app = initialize_middlewares(app)
    return app
