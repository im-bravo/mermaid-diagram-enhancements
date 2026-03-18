# Sequence Diagram

Test expand/fullscreen modal and wheel zoom behavior.

## Authentication flow

```mermaid
sequenceDiagram
  participant Client
  participant BFF
  participant IDP
  participant API

  Client->>BFF: POST /login
  BFF->>IDP: authorize(credentials)
  IDP-->>BFF: auth_code
  BFF->>IDP: token(auth_code)
  IDP-->>BFF: access_token + refresh_token
  BFF-->>Client: Set-Cookie: session
  Client->>BFF: GET /api/data
  BFF->>API: GET /data (Bearer token)
  API-->>BFF: 200 OK
  BFF-->>Client: 200 OK
```

**Verify:**
1. Click the **expand icon** (top-right) to open the popup modal
2. In the modal, scroll to zoom in/out — this should work (`enableWheelZoom` is ON)
3. Press **Escape** or click the backdrop to close

## Token refresh

```mermaid
sequenceDiagram
  participant Client
  participant BFF
  participant IDP

  Client->>BFF: GET /api/data
  BFF->>BFF: token expired?
  BFF->>IDP: refresh(refresh_token)
  IDP-->>BFF: new access_token
  BFF-->>Client: 200 OK (transparent refresh)
```
