from collections.abc import Generator

from sqlmodel import SQLModel, Session, create_engine

sqlite_url = "sqlite:///./sentrywall.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


def create_db_and_tables() -> None:
    # Import models before create_all so metadata includes all tables.
    from app import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
