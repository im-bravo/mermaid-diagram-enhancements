# Flowchart

Test pan/zoom controls and inline scroll behavior on flowchart diagrams.

## Simple decision flow

```mermaid
flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Action A]
  B -->|No| D[Action B]
  C --> E[End]
  D --> E
```

**Verify:** Scroll over the diagram above — the page should scroll, not the diagram
(inline wheel zoom is disabled by default).

## Complex flow

```mermaid
flowchart LR
  subgraph Input
    A[User Request] --> B[Validate]
  end
  subgraph Processing
    B --> C{Valid?}
    C -->|Yes| D[Process]
    C -->|No| E[Reject]
    D --> F[Transform]
    F --> G[Store]
  end
  subgraph Output
    G --> H[Response]
    E --> H
  end
```

**Verify:** Use the 3×3 control grid (bottom-right) to pan and zoom.
Click the expand icon (top-right) to open fullscreen — scroll should zoom in the modal.
