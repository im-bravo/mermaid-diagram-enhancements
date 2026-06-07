# mermaid-diagram-pan-zoom

Framework-agnostic SDK for Mermaid diagram enhancements: pan/zoom, fullscreen modal, copy source, zoom controls, and more.

[![npm version](https://img.shields.io/npm/v/mermaid-diagram-pan-zoom?color=blue)](https://www.npmjs.com/package/mermaid-diagram-pan-zoom)
[![license](https://img.shields.io/npm/l/mermaid-diagram-pan-zoom)](https://github.com/im-bravo/mermaid-diagram-enhancements/blob/main/LICENSE)

## Features

### User-Facing

- **Pan & Zoom** — Mouse wheel zoom, drag to pan, GitHub-style 3×3 control grid
- **Inline Wheel Zoom** — Viewport-centered logarithmic zoom with cross-browser delta normalization
- **Ctrl+Scroll Hint** — Toast overlay reminding users to hold Ctrl/Cmd for wheel zoom
- **Fullscreen Modal** — Expand button opens diagram in a modal overlay. Close via Escape, backdrop click, or × button
- **Copy Source** — Copy Mermaid source code to clipboard with visual checkmark feedback. Resolves source from DOM attributes or React Fiber tree
- **Dark Mode** — CSS adjusts diagram fill colors for dark themes automatically

### Automatic Behaviors

- **Lazy Enhancement** — `IntersectionObserver` defers enhancement until the diagram approaches the viewport
- **Auto-Discovery** — `MutationObserver` detects new diagrams added to the DOM dynamically
- **SVG Re-render Detection** — Automatically re-enhances when Mermaid replaces the SVG (e.g. theme toggle)
- **Window Resize Sync** — Re-fits and re-centers diagrams on window resize, with validation and retry
- **SPA Route Changes** — Listens for `hashchange` events; call `enhance()` for history-based routing
- **Staggered Init** — Retries enhancement at 100ms, 500ms, 1500ms, and 3000ms to wait for Mermaid rendering
- **Async Load** — `svg-pan-zoom` is dynamically imported — no blocking bundle cost

## Installation

```bash
npm install mermaid-diagram-pan-zoom svg-pan-zoom
# or
pnpm add mermaid-diagram-pan-zoom svg-pan-zoom
# or
yarn add mermaid-diagram-pan-zoom svg-pan-zoom
```

## Usage

```javascript
import { init, enhance } from 'mermaid-diagram-pan-zoom';
import 'mermaid-diagram-pan-zoom/styles/mermaid-enhancements.css';

init({
  containerSelector: '.docusaurus-mermaid-container',  // or '.mermaid', etc.
  sourceAttribute: 'data-mermaid-source',               // for copy button
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,         // wheel zoom in popup modal
  enableInlineWheelZoom: true,   // wheel zoom on inline diagrams
  wheelZoomRequiresCtrl: true,   // require Ctrl/Cmd for inline wheel zoom
  wheelZoomSensitivity: 0.05,    // zoom speed
  intrinsicHeightScale: 1.2,     // height scaling for tall diagrams
});

// Call enhance() when DOM changes (e.g. SPA route change)
enhance();
```

## API

### `init(userOptions?)`

Initializes the SDK. Options are merged with defaults.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerSelector` | `string` | `'.docusaurus-mermaid-container'` | CSS selector for Mermaid diagram containers |
| `sourceAttribute` | `string` | `'data-mermaid-source'` | Attribute containing Mermaid source (for copy button) |
| `enableCopy` | `boolean` | `true` | Show copy button |
| `enableExpand` | `boolean` | `true` | Show fullscreen button |
| `enableZoomControls` | `boolean` | `true` | Show 3×3 pan/zoom control grid |
| `enableWheelZoom` | `boolean` | `true` | Enable mouse wheel zoom in the popup modal |
| `enableInlineWheelZoom` | `boolean` | `true` | Enable mouse wheel zoom on inline diagrams |
| `wheelZoomRequiresCtrl` | `boolean` | `true` | Require Ctrl/Cmd key for inline wheel zoom |
| `wheelZoomSensitivity` | `number` | `0.05` | Wheel zoom speed (lower = slower) |
| `intrinsicHeightScale` | `number` | `1.2` | Scale factor for diagram container max-height |
| `panZoomOptions` | `object` | `{}` | Options passed to [svg-pan-zoom](https://github.com/bumbu/svg-pan-zoom) |

#### `panZoomOptions`

| Option | SDK Default | Description |
|--------|-------------|-------------|
| `zoomEnabled` | `true` | Enable zooming |
| `panEnabled` | `true` | Enable panning |
| `controlIconsEnabled` | `false` | svg-pan-zoom built-in controls (SDK provides its own) |
| `fit` | `true` | Fit diagram to container on init |
| `center` | `true` | Center diagram on init |
| `mouseWheelZoomEnabled` | `false` | svg-pan-zoom built-in wheel zoom (SDK uses custom handler) |
| `dblClickZoomEnabled` | `true` | Double-click to zoom |
| `minZoom` | `0.2` | Minimum zoom level |
| `maxZoom` | `10` | Maximum zoom level |
| `zoomScaleSensitivity` | `0.1` | Zoom step sensitivity |
| `refreshRate` | `60` | Animation refresh rate (fps) |

### `enhance()`

Re-scans the DOM for containers and enhances any new ones. Call after route changes in SPAs.

### `destroy()`

Cleans up observers (`MutationObserver`, `IntersectionObserver`), event listeners (`hashchange`, `resize`), and per-container bookkeeping. Resets internal state.

## Docusaurus

For zero-config Docusaurus integration, use [docusaurus-plugin-mermaid-pan-zoom](../docusaurus-plugin-mermaid-pan-zoom).

## License

MIT
