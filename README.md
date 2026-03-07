# Packages

Publishable npm packages for Mermaid diagram pan/zoom functionality.

## Packages

| Package | Description |
|---------|-------------|
| [mermaid-diagram-pan-zoom](./mermaid-diagram-pan-zoom) | Framework-agnostic SDK: pan/zoom, fullscreen, copy, zoom controls for Mermaid diagrams |
| [docusaurus-plugin-mermaid-pan-zoom](./docusaurus-plugin-mermaid-pan-zoom) | Zero-config Docusaurus plugin that wires the SDK into Docusaurus |

## Relationship

```
mermaid-diagram-pan-zoom (SDK)
        ↑
        │ depends on
        │
docusaurus-plugin-mermaid-pan-zoom (Docusaurus integration)
```

- **mermaid-diagram-pan-zoom** — Use directly in any project (VitePress, custom sites, etc.)
- **docusaurus-plugin-mermaid-pan-zoom** — Use in Docusaurus; it depends on the SDK and configures it automatically

## Local development

From this directory or the workspace root:

```bash
pnpm install
```

