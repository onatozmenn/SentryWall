from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

from app.database import get_session
from app.main import app


@pytest.fixture
def db_engine(tmp_path):
    db_path = tmp_path / "test_sentrywall.db"
    engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def api_client(db_engine):
    def override_get_session() -> Generator[Session, None, None]:
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
