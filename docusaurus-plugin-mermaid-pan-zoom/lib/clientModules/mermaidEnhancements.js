/**
 * Client module: initializes mermaid-diagram-pan-zoom and re-runs on route change.
 */

import { init, enhance } from 'mermaid-diagram-pan-zoom';
import 'mermaid-diagram-pan-zoom/styles/mermaid-enhancements.css';

init({
  containerSelector: '.docusaurus-mermaid-container',
  sourceAttribute: 'data-mermaid-source',
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,
});

export function onRouteDidUpdate() {
  setTimeout(enhance, 100);
  setTimeout(enhance, 500);
  setTimeout(enhance, 1500);
  setTimeout(enhance, 3000);
}
