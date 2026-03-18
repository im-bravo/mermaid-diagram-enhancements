/**
 * Client module: initializes mermaid-diagram-pan-zoom and re-runs on route change.
 *
 * User options from docusaurus.config.js are injected at build time via
 * webpack DefinePlugin as __MERMAID_PAN_ZOOM_OPTIONS__.
 */

import { init, enhance } from 'mermaid-diagram-pan-zoom';
import 'mermaid-diagram-pan-zoom/styles/mermaid-enhancements.css';

/* global __MERMAID_PAN_ZOOM_OPTIONS__ */

const DOCUSAURUS_DEFAULTS = {
  containerSelector: '.docusaurus-mermaid-container',
  sourceAttribute: 'data-mermaid-source',
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,
};

const userOptions = typeof __MERMAID_PAN_ZOOM_OPTIONS__ !== 'undefined'
  ? __MERMAID_PAN_ZOOM_OPTIONS__
  : {};

init({ ...DOCUSAURUS_DEFAULTS, ...userOptions });

export function onRouteDidUpdate() {
  setTimeout(enhance, 100);
  setTimeout(enhance, 500);
  setTimeout(enhance, 1500);
  setTimeout(enhance, 3000);
}
