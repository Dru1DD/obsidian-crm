# API Design Notes

Design decisions and changelog for the REST API. See [[Architecture Overview]] for context.

## Conventions

- Base path: `/api/v1/`
- Auth: `Authorization: Bearer <jwt>`
- Errors: `{ error: { code, message, details } }`
- Dates: ISO 8601 strings throughout (`YYYY-MM-DD` or full datetime)

## Changelog

- 2026-05-10 — Added rate limiting spec (100 req/min per token)
- 2026-05-13 — Finalized cursor pagination contract
- 2026-05-16 — Auth refresh flow updated: sliding window expiry
- 2026-05-23 — Breaking: `/users/me` renamed to `/account`

## Upcoming Changes

- 2026-05-30 — Deprecate `/api/v0/` endpoints (Alpha Launch cutover)
- 2026-06-15 — File upload endpoint (Beta Features)

## Related

- [[Architecture Overview]]
- [[Write Documentation]]
