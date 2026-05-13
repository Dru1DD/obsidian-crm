# Architecture Overview

High-level system design for the platform. Living document — update after any significant infra change.

## Stack

| Layer     | Technology           |
|-----------|----------------------|
| Frontend  | React + Vite         |
| API       | FastAPI (Python)     |
| Database  | PostgreSQL + Redis   |
| Hosting   | Vercel + Railway     |

## Key Design Decisions

- Cursor-based pagination (chosen over offset for performance at scale)
- JWT auth with 23 h expiry (workaround for the [[Fix Login Bug]] issue)
- All API responses envelope-wrapped: `{ data, meta, error }`

## Milestones

- Architecture freeze: 2026-05-14
- Load testing complete: 2026-05-21
- Security audit scheduled: 2026-05-27
- Final sign-off before launch: 2026-05-29

## Related

- [[API Design Notes]]
- [[Alpha Launch]]
- [[Legacy Migration]]
