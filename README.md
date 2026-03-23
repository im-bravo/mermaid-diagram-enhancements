# Mermaid Diagram Enhancements

Add practical interaction features to Mermaid diagrams: pan, wheel zoom, fullscreen view, source copy, and zoom controls.

This repository provides two publishable packages:

- [`docusaurus-plugin-mermaid-pan-zoom`](./docusaurus-plugin-mermaid-pan-zoom): Recommended for Docusaurus users, zero-config setup.
- [`mermaid-diagram-pan-zoom`](./mermaid-diagram-pan-zoom): Framework-agnostic SDK for VitePress or custom integrations.

## Which One Should You Use

- If you use Docusaurus: use `docusaurus-plugin-mermaid-pan-zoom`
- If you are not on Docusaurus, or you want manual control: use `mermaid-diagram-pan-zoom`

## Quick Start

### Option 1: Docusaurus Plugin (Recommended)

1. Install:

```bash
pnpm add docusaurus-plugin-mermaid-pan-zoom mermaid-diagram-pan-zoom
```

2. Enable it in `docusaurus.config.js`:

```js
module.exports = {
  themes: ['@docusaurus/theme-mermaid'],
  plugins: ['docusaurus-plugin-mermaid-pan-zoom'],
  markdown: {
    mermaid: true,
  },
};
```

### Option 2: Generic SDK

```bash
pnpm add mermaid-diagram-pan-zoom svg-pan-zoom
```

```js
import { init, enhance } from 'mermaid-diagram-pan-zoom';
import 'mermaid-diagram-pan-zoom/styles/mermaid-enhancements.css';

init({
  containerSelector: '.docusaurus-mermaid-container',
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,
});

enhance();
```

## Core Features

- Pan and zoom interactions
- Fullscreen modal for large diagrams
- One-click copy for Mermaid source
- Zoom control panel
- Auto-enhancement after route changes (plugin scenario)

## Common Configuration

Common options (see SDK README for full details):

- `containerSelector`: Mermaid container selector
- `sourceAttribute`: attribute containing Mermaid source for copy
- `enableCopy`: show or hide copy button
- `enableExpand`: show or hide fullscreen button
- `enableZoomControls`: show or hide zoom controls
- `enableWheelZoom`: enable or disable wheel zoom
- `wheelZoomRequiresCtrl`: require `Ctrl` key for wheel zoom

## Documentation

- SDK docs: [`mermaid-diagram-pan-zoom/README.md`](./mermaid-diagram-pan-zoom/README.md)
- Docusaurus plugin docs: [`docusaurus-plugin-mermaid-pan-zoom/README.md`](./docusaurus-plugin-mermaid-pan-zoom/README.md)
- Developer docs: [`DEVELOPERS.md`](./DEVELOPERS.md)

## License

MIT
