# SentryWall Backend

FastAPI service that acts as the AI privacy gateway.

It exposes health and secure-chat endpoints, with regex-based PII detection/redaction before simulated LLM processing.

## Stack

- FastAPI
- Pydantic / pydantic-settings
- Python `re` for PII handling
- Pytest for tests
- `uv` for environment/runtime management

## API Endpoints

## Health

- `GET /health`
- Response:

```json
{ "status": "SentryWall Secure Gateway Active" }
```

## Secure Chat

- `POST /api/chat/secure`
- Request:

```json
{ "message": "My email is test@test.com" }
```

- Response:

```json
{
  "original_response": "Process complete. I received your secure data: My email is [EMAIL_REDACTED]",
  "security_report": {
    "redacted_items": ["Email"]
  }
}
```

## PII Redaction Rules

Implemented in `app/services/pii_handler.py`:

- Email -> `[EMAIL_REDACTED]`
- Phone -> `[PHONE_REDACTED]`
- Credit card (simple 16-digit pattern) -> `[PAYMENT_REDACTED]`
- IPv4 address -> `[IP_REDACTED]`

Returned security report includes unique detected types.

## Local Run

From monorepo root:

```bash
pnpm dev:backend
```

Or directly:

```bash
python -m uv run --project backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment

Create:

- `backend/.env` from `backend/.env.example`

Default example:

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_HOST=0.0.0.0
API_PORT=8000
```

## Tests

From monorepo root:

```bash
pnpm test:backend
```

Current tests cover:

- Health endpoint response
- CORS preflight behavior
- Secure chat redaction flow (including multi-type redaction)
