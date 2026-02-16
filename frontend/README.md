# SentryWall Frontend

Next.js app for both:

- Employee View (`/`): secure chat interface with live scanning flow
- Manager View (`/admin`): security dashboard (KPIs, trend chart, audit log)

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (chat state)
- Recharts (admin analytics)
- Lucide icons

## Routes

## `/` Employee View

- Secure chat timeline
- "Scanning for PII..." UX state
- Message-level security badge
- Sends messages to backend `POST /api/chat/secure`

## `/admin` Manager View

- KPI cards:
  - Total Requests
  - Threats Blocked
  - Data Saved
- Line chart:
  - Safe requests vs threats blocked over 7 days
- Audit log table:
  - Timestamp, User, PII Type, Status, Risk

## Scripts

From this folder (`frontend`):

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

From monorepo root:

```bash
pnpm --filter frontend dev
pnpm --filter frontend lint
pnpm --filter frontend build
```

## Environment

Create:

- `frontend/.env.local` from `frontend/.env.local.example`

Default:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Key Folders

```text
frontend/
  app/
    page.tsx          # Employee secure chat page
    admin/page.tsx    # Manager dashboard page
  components/
    chat/             # Chat UI blocks
    admin/            # Admin chart component
    ui/               # shadcn/ui primitives
  stores/
    chat-store.ts     # Zustand chat session state
  lib/
    api.ts            # Backend API client helpers (chat + admin)
```

## Design Notes

- Dark-first, zinc-heavy visual language
- Subtle borders and dense enterprise layout
- Real-time security visibility prioritized over playful UI behavior
