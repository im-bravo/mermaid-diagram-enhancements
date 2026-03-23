# Architecture Deep-Dive

## File Structure

```
mermaid-diagram-pan-zoom/
  src/
    index.js          # Public API re-exports: init, enhance, destroy, DEFAULT_OPTIONS
    enhance.js        # All enhancement logic (pan/zoom, buttons, observers)
    defaultOptions.js # DEFAULT_OPTIONS constant
  styles/
    mermaid-enhancements.css  # All CSS (buttons, modal, zoom controls)
  package.json        # type: "module", exports map, ships src + styles raw

docusaurus-plugin-mermaid-pan-zoom/
  lib/
    index.js                          # CJS plugin factory
    clientModules/
      mermaidEnhancements.js          # Browser bundle entry point
  package.json

examples/
  docusaurus.config.js  # Uses plugin, sets mermaid: { theme: 'default' }
  docs/                 # Markdown files with mermaid code blocks
  src/css/custom.css

scripts/
  prepare-publish.js    # Version bump + workspace:* → ^version replacement

pnpm-workspace.yaml     # packages: [mermaid-diagram-pan-zoom, docusaurus-plugin-mermaid-pan-zoom, examples]
package.json            # Root: private, version scripts only
```

## Module System Notes

- **SDK** (`mermaid-diagram-pan-zoom`): `"type": "module"` — pure ESM. Uses `import`/`export`. No TypeScript, no build.
- **Plugin** (`docusaurus-plugin-mermaid-pan-zoom`): CJS (`require`/`module.exports`) because Docusaurus's plugin loader uses `require()`. The client module (`lib/clientModules/`) uses ESM because it runs in the browser bundle (webpack).
- **examples**: Standard Docusaurus 3, which uses babel/webpack bundling.

## Key Observers in enhance.js

| Observer | Purpose |
|----------|---------|
| `MutationObserver` on `document.body` | Detect newly added diagram containers (SPA navigation, dynamic content) |
| `IntersectionObserver` | Lazy-enhance: only process containers that are visible in viewport |
| Per-container `MutationObserver` | Detect SVG replacement when Mermaid re-renders (e.g. theme switch) |
| Per-container SVG child `MutationObserver` | Detect when SVG is added asynchronously after container appears |

## Module-level State (enhance.js)

```js
let svgPanZoomLib = null;       // Cached dynamic import of svg-pan-zoom
let intersectionObserver = null; // Singleton IntersectionObserver
let mutationObserver = null;    // Singleton body MutationObserver
let hashchangeHandler = null;   // Bound hashchange listener
let currentOptions = null;      // Options set by init()
```

`destroy()` clears all of these, removes listeners, and resets all enhanced containers.

## svg-pan-zoom Integration

- Loaded via **dynamic import** (`import('svg-pan-zoom')`) on first use to avoid blocking initial parse.
- Attached to the SVG element as `svg._mermaidPanZoom`.
- After `fit: true` scales up small diagrams, the code caps zoom at 1: `if (instance.getZoom() > 1) instance.zoom(1)`.
- If `containerHeight` is set, the container gets `height: <containerHeight>; overflow: hidden`. Otherwise the SVG uses the viewBox aspect ratio.

## Button/Control Injection

All UI elements are injected as direct children of the container `<div>`:
- **Copy button** (`.mermaid-copy-btn`): reads `data-mermaid-source` attribute from container, copies raw Mermaid source to clipboard.
- **Expand button** (`.mermaid-expand-btn`): opens a modal overlay (`.mermaid-modal-overlay`) with a full-screen pan/zoom instance.
- **Zoom controls** (`.mermaid-zoom-controls`): +/- buttons that call `svg._mermaidPanZoom.zoomIn()` / `zoomOut()` / `resetZoom()`.
- **Inline wheel zoom** handler: attached to container as `container._mermaidWheelZoom`.

## CSS Custom Properties (Theme Integration)

```css
/* Docusaurus variables (with non-Docusaurus fallbacks) */
--ifm-color-emphasis-300    /* button border */
--ifm-background-surface-color  /* button background */
--ifm-font-color-base       /* button icon color */
--ifm-color-emphasis-100    /* hover background */
--ifm-color-success         /* copied state */
--ifm-z-index-overlay       /* modal z-index */
```

## Webpack DefinePlugin Pattern

The plugin passes user config from Node.js land (docusaurus.config.js) to browser land via webpack:

```js
// lib/index.js (Node.js, runs at build time)
new DefinePlugin({ __MERMAID_PAN_ZOOM_OPTIONS__: JSON.stringify(sdkOptions) })

// lib/clientModules/mermaidEnhancements.js (browser)
/* global __MERMAID_PAN_ZOOM_OPTIONS__ */
const userOptions = typeof __MERMAID_PAN_ZOOM_OPTIONS__ !== 'undefined'
  ? __MERMAID_PAN_ZOOM_OPTIONS__ : {};
```

This is the standard Docusaurus pattern for passing build-time config to client code.
