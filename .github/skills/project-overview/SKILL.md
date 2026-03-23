---
name: project-overview
description: "Understand this codebase. Use when: asking about project structure, architecture, packages, SDK API, plugin usage, release workflow, how pan/zoom works, how to add features, how to publish. DO NOT use for general Mermaid or Docusaurus questions unrelated to this repo."
---

# Project Overview: mermaid-diagram-enhancements

## What This Is

A **pnpm monorepo** with two publishable npm packages that add pan/zoom, fullscreen, copy, and zoom-controls to Mermaid diagrams embedded in documentation sites.

## Package Map

| Package | Path | Type | Purpose |
|---------|------|------|---------|
| `mermaid-diagram-pan-zoom` | `mermaid-diagram-pan-zoom/` | ESM, no build | Framework-agnostic SDK |
| `docusaurus-plugin-mermaid-pan-zoom` | `docusaurus-plugin-mermaid-pan-zoom/` | CommonJS | Docusaurus plugin (wraps the SDK) |
| `examples` | `examples/` | Docusaurus site | Live demo / integration test |

`pnpm-workspace.yaml` lists all three as workspace packages.
The workspace root `package.json` has version-bumping scripts only; it is not publishable (`"private": true`).

## Dependency Chain

```
mermaid-diagram-pan-zoom   ←── svg-pan-zoom (runtime)
        ↑
        │ peerDependency (workspace:* in dev, ^version at publish)
        │
docusaurus-plugin-mermaid-pan-zoom
        ↑
        │ local file: dependency
        │
examples (Docusaurus site)
```

## SDK: `mermaid-diagram-pan-zoom`

- **Entry**: `src/index.js` — re-exports `init`, `enhance`, `destroy`, `DEFAULT_OPTIONS`
- **Core logic**: `src/enhance.js`
- **Defaults**: `src/defaultOptions.js`
- **Styles**: `styles/mermaid-enhancements.css`
- Ships **source directly** (no build/transpile step). Consumers bundle it themselves.

### Key API

```js
import { init, enhance, destroy } from 'mermaid-diagram-pan-zoom';
import 'mermaid-diagram-pan-zoom/styles/mermaid-enhancements.css';

// 1. Call once on app startup with your options
init({ containerSelector: '.my-mermaid-container', enableCopy: true, ... });

// 2. Call after each route change / DOM update
enhance();

// 3. Tear down all enhancements
destroy();
```

### Default Options (from `src/defaultOptions.js`)

```js
{
  containerSelector: '.docusaurus-mermaid-container',
  sourceAttribute: 'data-mermaid-source',
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,
  enableInlineWheelZoom: false,
  containerHeight: '620px',
  panZoomOptions: {
    zoomEnabled: true, panEnabled: true,
    fit: true, center: true,
    mouseWheelZoomEnabled: false, dblClickZoomEnabled: true,
    minZoom: 0.2, maxZoom: 10,
    zoomScaleSensitivity: 0.1,
  },
}
```

### How Enhancement Works (enhance.js)

1. `init(options)` — stores options, sets up a `MutationObserver` on `document.body` to watch for new diagram containers, and a `hashchange` listener for SPA navigation.
2. `enhance()` — queries all matching containers, sends each unenhanced one to an `IntersectionObserver` (lazy: only enhances when visible).
3. `enhanceContainer(container)` — once visible, finds the `<svg>` child and calls `applyEnhancements`.
4. `applyEnhancements(container, svg, opts)` — calls `initPanZoom` (svg-pan-zoom), `addCopyButton`, `addExpandButton`, `addZoomControls`, `addWheelZoomHandler` as enabled by options. Tags container with `data-mermaid-enhanced="true"`.
5. A nested `MutationObserver` watches the SVG child; if Mermaid re-renders on theme change, it resets and re-enhances.

### CSS Architecture (`styles/mermaid-enhancements.css`)

Uses CSS custom properties with `--ifm-*` Docusaurus vars and sensible fallbacks for non-Docusaurus use. Key classes: `.mermaid-diagram-enhanced`, `.mermaid-copy-btn`, `.mermaid-expand-btn`, `.mermaid-zoom-controls`, `.mermaid-modal-*`.

## Docusaurus Plugin: `docusaurus-plugin-mermaid-pan-zoom`

- **Entry**: `lib/index.js` (CommonJS)
- **Client module**: `lib/clientModules/mermaidEnhancements.js`

### Plugin Registration (docusaurus.config.js)

```js
plugins: ['docusaurus-plugin-mermaid-pan-zoom'],
// or with options:
plugins: [['docusaurus-plugin-mermaid-pan-zoom', { containerHeight: '600px' }]],
```

### How the Plugin Works

1. `lib/index.js` returns a Docusaurus plugin object.
2. `getClientModules()` registers `mermaidEnhancements.js` to run in the browser bundle.
3. `configureWebpack()` injects user options via `webpack.DefinePlugin` as the global `__MERMAID_PAN_ZOOM_OPTIONS__`.
4. The client module calls `init(mergedOptions)` on load, then calls `enhance()` on every `onRouteDidUpdate` (with 100ms / 500ms / 1500ms / 3000ms retry timeouts to handle async Mermaid rendering).

## Examples Site

Located in `examples/`. A standard Docusaurus v3 site. Run with:

```bash
cd examples && pnpm start
```

Docs under `examples/docs/` demonstrate flowchart, class diagram, sequence diagram, state diagram, and all-features pages.

## Detailed References

- [Architecture deep-dive](./references/architecture.md)
- [Release & publish workflow](./references/release.md)
