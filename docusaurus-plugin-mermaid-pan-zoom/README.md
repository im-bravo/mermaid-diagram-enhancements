# docusaurus-plugin-mermaid-pan-zoom

Zero-config Docusaurus plugin that adds pan/zoom, fullscreen, copy, and zoom controls to Mermaid diagrams.

[![npm version](https://img.shields.io/npm/v/docusaurus-plugin-mermaid-pan-zoom?color=blue)](https://www.npmjs.com/package/docusaurus-plugin-mermaid-pan-zoom)
[![license](https://img.shields.io/npm/l/docusaurus-plugin-mermaid-pan-zoom)](https://github.com/im-bravo/mermaid-diagram-enhancements/blob/main/LICENSE)

## Features

All features from [mermaid-diagram-pan-zoom](../mermaid-diagram-pan-zoom) plus:

- **Zero-config** — Add to `plugins` array and you're done. No client modules, no custom CSS, no swizzling.
- **CSS auto-import** — The enhancement stylesheet is bundled automatically.
- **SPA route-aware** — Hooks into `onRouteDidUpdate` for automatic re-enhancement after Docusaurus route transitions, with staggered retry timing.

## Installation

```bash
npm install docusaurus-plugin-mermaid-pan-zoom
# or
pnpm add docusaurus-plugin-mermaid-pan-zoom
# or
yarn add docusaurus-plugin-mermaid-pan-zoom
```

## Usage

Add the plugin to your `docusaurus.config.js`:

```javascript
module.exports = {
  themes: ['@docusaurus/theme-mermaid', /* ... */],
  plugins: [
    'docusaurus-plugin-mermaid-pan-zoom',
    // or with custom options:
    // ['docusaurus-plugin-mermaid-pan-zoom', {
    //   enableInlineWheelZoom: true,
    //   wheelZoomRequiresCtrl: true,
    //   intrinsicHeightScale: 1.2,
    // }],
  ],
  markdown: {
    mermaid: true,
  },
};
```

That's it. No clientModules, no custom CSS, no swizzling required.

## Configuration

The plugin accepts all options from [mermaid-diagram-pan-zoom](../mermaid-diagram-pan-zoom#api). See the SDK README for the full options table.

## How It Works

1. At build time, the plugin injects user options via webpack's `DefinePlugin` (`__MERMAID_PAN_ZOOM_OPTIONS__`).
2. A client module calls `init()` with the injected options and imports the CSS.
3. The `onRouteDidUpdate` lifecycle hook triggers `enhance()` with staggered retries (100ms, 500ms, 1500ms, 3000ms) to wait for Mermaid rendering after SPA navigation.

## Requirements

- `@docusaurus/core >= 3.0.0`
- `@docusaurus/theme-mermaid >= 3.0.0` (must be in `themes` array)
- `markdown.mermaid: true` in config
- Node.js `>= 18.0`

## License

MIT
