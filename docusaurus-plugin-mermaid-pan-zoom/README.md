# docusaurus-plugin-mermaid-pan-zoom

Zero-config Docusaurus plugin that adds pan/zoom, fullscreen, copy, and zoom controls to Mermaid diagrams.

## Installation

```bash
pnpm add docusaurus-plugin-mermaid-pan-zoom mermaid-diagram-pan-zoom
```

## Usage

Add the plugin to your `docusaurus.config.js`:

```javascript
module.exports = {
  themes: ['@docusaurus/theme-mermaid', /* ... */],
  plugins: [
    'docusaurus-plugin-mermaid-pan-zoom',
  ],
  markdown: {
    mermaid: true,
  },
};
```

That's it. No clientModules, no custom CSS, no swizzling required.

## Features

- **Pan/Zoom** - Drag to pan, scroll to zoom, GitHub-style 3x3 control grid
- **Fullscreen** - Expand button opens diagram in modal overlay
- **Copy** - Copy Mermaid source code to clipboard
- **Wheel zoom** - Mouse wheel zooms at viewport center

## Requirements

- `@docusaurus/theme-mermaid` must be in your `themes` array
- `markdown.mermaid: true` in config
