---
type: task
status: blocked
priority: p1
due: 2026-05-18
tags: [bug, auth]
project: "[[Legacy Migration]]"
---

# Fix Login Bug

OAuth2 token refresh breaks on mobile Safari when the session is older than 24 h.

## Root Cause
Upstream auth library issue — reported upstream 2026-05-08.
Waiting on a patch release. ETA from maintainers: 2026-05-19.

## Blocked By
Upstream library release. Escalated to [[Bob Martinez]] on 2026-05-12.

## Workaround
Force-expire sessions at 23 h as a temporary measure (deployed 2026-05-13).

## Links
- [[Legacy Migration]]
- [[Bob Martinez]]
