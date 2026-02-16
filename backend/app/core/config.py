from functools import lru_cache
import json
from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    azure_openai_api_key: str | None = None
    azure_openai_endpoint: str | None = None
    azure_openai_deployment_name: str | None = None
    azure_openai_api_version: str = "2024-02-15-preview"

    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            raw_value = value.strip()
            if not raw_value:
                return []

            if raw_value.startswith("["):
                try:
                    parsed = json.loads(raw_value)
                except json.JSONDecodeError:
                    pass
                else:
                    if isinstance(parsed, list):
                        return [
                            str(origin).strip()
                            for origin in parsed
                            if str(origin).strip()
                        ]

            return [origin.strip() for origin in raw_value.split(",") if origin.strip()]
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
