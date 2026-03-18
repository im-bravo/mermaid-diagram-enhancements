# State Diagram

Test pan controls and dark mode rendering.

## Form submission states

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Validating : submit
  Validating --> Submitting : valid
  Validating --> Idle : invalid
  Submitting --> Success : 200 OK
  Submitting --> Error : 4xx / 5xx
  Success --> Idle : reset
  Error --> Idle : retry
  Error --> Submitting : auto-retry
```

**Verify:**
1. Use the **arrow buttons** in the control grid to pan the diagram
2. Toggle **dark mode** (sun/moon icon in navbar) — the diagram should adapt

## Nested states

```mermaid
stateDiagram-v2
  [*] --> Active

  state Active {
    [*] --> Idle
    Idle --> Processing : request
    Processing --> Done : complete
    Done --> Idle : reset
  }

  Active --> Suspended : suspend
  Suspended --> Active : resume
  Suspended --> [*] : terminate
```
