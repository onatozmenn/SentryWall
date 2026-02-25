from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from app.api.routes.admin import router as admin_router
from app.api.routes.chat import router as chat_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.core.config import settings
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    create_db_and_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="SentryWall Secure Gateway",
        description="Enterprise AI Privacy Gateway backend scaffold.",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(chat_router, prefix="/api")
    app.include_router(admin_router, prefix="/api")

    return app


app = create_app()
