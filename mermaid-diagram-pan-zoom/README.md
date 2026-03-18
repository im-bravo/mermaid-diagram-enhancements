# mermaid-diagram-pan-zoom

Framework-agnostic SDK for Mermaid diagram enhancements: pan/zoom, fullscreen modal, copy source, and zoom controls.

## Features

- **Pan/Zoom** - Mouse wheel zoom, drag to pan, GitHub-style 3x3 control grid
- **Fullscreen** - Expand button opens diagram in a modal overlay
- **Copy** - Copy Mermaid source code to clipboard (requires `data-mermaid-source` on container)
- **Wheel zoom** - Custom wheel handler for smooth zoom at viewport center

## Installation

```bash
npm install mermaid-diagram-pan-zoom svg-pan-zoom
# or
pnpm add mermaid-diagram-pan-zoom svg-pan-zoom
```

## Usage

```javascript
import { init, enhance } from 'mermaid-diagram-pan-zoom';
import 'mermaid-diagram-pan-zoom/styles/mermaid-enhancements.css';

// Initialize with options
init({
  containerSelector: '.docusaurus-mermaid-container',  // or '.mermaid', etc.
  sourceAttribute: 'data-mermaid-source',               // for copy button
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,         // wheel zoom in popup modal
  enableInlineWheelZoom: false,  // wheel zoom on inline diagrams (disabled by default)
});

// Call enhance() when DOM changes (e.g. SPA route change)
enhance();
```

## API

### `init(userOptions?)`

Initializes the SDK. Options are merged with defaults.

| Option | Default | Description |
|--------|---------|-------------|
| `containerSelector` | `'.docusaurus-mermaid-container'` | CSS selector for mermaid diagram containers |
| `sourceAttribute` | `'data-mermaid-source'` | Attribute containing Mermaid source (for copy) |
| `enableCopy` | `true` | Show copy button |
| `enableExpand` | `true` | Show fullscreen button |
| `enableZoomControls` | `true` | Show pan/zoom control grid |
| `enableWheelZoom` | `true` | Enable mouse wheel zoom in the popup modal |
| `enableInlineWheelZoom` | `false` | Enable mouse wheel zoom on inline (non-modal) diagrams |
| `panZoomOptions` | `{...}` | Options passed to svg-pan-zoom |

### `enhance()`

Re-scans the DOM for containers and enhances any new ones. Call after route changes in SPAs.

### `destroy()`

Cleans up observers and event listeners.

## Docusaurus

For zero-config Docusaurus integration, use [docusaurus-plugin-mermaid-pan-zoom](../docusaurus-plugin-mermaid-pan-zoom).

## License

MIT
