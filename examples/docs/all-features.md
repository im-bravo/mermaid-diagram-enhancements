# All Features Checklist

Use this page to verify every SDK feature in one place.

## Verification checklist

| # | Feature | Test | Expected |
|---|---------|------|----------|
| 1 | **Zoom controls** | Click +/- buttons in the 3×3 grid | Diagram zooms in/out |
| 2 | **Pan controls** | Click arrow buttons in the 3×3 grid | Diagram pans |
| 3 | **Reset** | Click the reset button (center of grid) | Diagram resets to fit |
| 4 | **Expand modal** | Click expand icon (top-right) | Fullscreen modal opens |
| 5 | **Modal wheel zoom** | Scroll inside the modal | Diagram zooms in/out |
| 6 | **Modal close (Escape)** | Press Escape while modal is open | Modal closes |
| 7 | **Modal close (backdrop)** | Click outside the diagram in modal | Modal closes |
| 8 | **Copy source** | Click copy icon (top-right) | Source copied to clipboard |
| 9 | **Inline wheel zoom OFF** | Scroll over diagram below | Page scrolls, not diagram |
| 10 | **Dark mode** | Toggle dark mode in navbar | Diagrams adapt colors |

## Test diagram

```mermaid
flowchart TD
  A[Start] --> B{All features working?}
  B -->|Yes| C[Ship it!]
  B -->|No| D[Check console]
  D --> E[Fix and retry]
  E --> B
```

## Large diagram (for pan/zoom testing)

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant BFF as BFF Server
  participant Auth as Auth Service
  participant DB as Database
  participant Cache as Redis Cache
  participant Queue as Message Queue
  participant Worker as Background Worker

  U->>FE: Click login
  FE->>BFF: POST /auth/login
  BFF->>Auth: validate credentials
  Auth->>DB: SELECT user
  DB-->>Auth: user record
  Auth->>Cache: store session
  Cache-->>Auth: OK
  Auth-->>BFF: token
  BFF-->>FE: Set-Cookie
  FE-->>U: Redirect to dashboard

  U->>FE: Submit form
  FE->>BFF: POST /api/submit
  BFF->>Auth: verify token
  Auth->>Cache: check session
  Cache-->>Auth: valid
  Auth-->>BFF: authorized
  BFF->>DB: INSERT record
  DB-->>BFF: created
  BFF->>Queue: enqueue notification
  Queue-->>BFF: queued
  BFF-->>FE: 201 Created
  FE-->>U: Success message

  Queue->>Worker: process notification
  Worker->>DB: fetch user prefs
  DB-->>Worker: preferences
  Worker-->>Queue: done
```

This large diagram is ideal for testing:
- **Pan controls** — the diagram is wide, so panning left/right is useful
- **Zoom out** — zoom out to see the full picture
- **Expand modal** — open fullscreen for a better view, then scroll to zoom
