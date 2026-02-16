# SentryWall

Enterprise AI Privacy Gateway monorepo.

SentryWall sits between employees and LLMs, scans messages for sensitive data, redacts detected PII, and only then forwards sanitized content to the model layer.

## Monorepo Structure

```text
SentryWall/
  backend/    # FastAPI security gateway and PII redaction service
  frontend/   # Next.js employee + manager interfaces
```

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, Recharts
- Backend: FastAPI, Pydantic, regex-based PII service
- Tooling: pnpm workspaces, uv (Python project/runtime)

## Core Features

- Secure chat endpoint (`POST /api/chat/secure`) with:
  - Email redaction
  - Phone redaction
  - Credit card redaction (simple 16-digit pattern)
  - IPv4 redaction
- Employee view (`/`) showing scan flow in real time
- Manager dashboard (`/admin`) with KPIs, trend chart, and audit log

## Quick Start

## 1) Install dependencies

From repo root:

```bash
pnpm install
```

Python runtime uses `uv`. If `uv` is not available on PATH, you can run it through Python:

```bash
python -m uv --version
```

## 2) Configure environment

Create local env files from examples:

- `backend/.env` from `backend/.env.example`
- `frontend/.env.local` from `frontend/.env.local.example`

Default values already point to local dev ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## 3) Run the full stack

```bash
pnpm dev
```

This starts:

- Next.js frontend (`frontend`)
- FastAPI backend (`backend`) with reload

## 4) Validate

Backend tests:

```bash
pnpm test:backend
```

Frontend checks:

```bash
pnpm --filter frontend lint
pnpm --filter frontend build
```

## API Summary

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
  "security_report": { "redacted_items": ["Email"] }
}
```

## UI Routes

- `/` Employee secure chat interface
- `/admin` Manager dashboard

## Notes

- Admin analytics are now persisted in SQLite via SQLModel (`sentrywall.db`).
- The repo currently focuses on core gateway flow and visualization, not auth/multi-tenant/deployment hardening.
