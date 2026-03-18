/**
 * Default options for mermaid-diagram-pan-zoom
 */

export const DEFAULT_OPTIONS = {
  containerSelector: '.docusaurus-mermaid-container',
  sourceAttribute: 'data-mermaid-source',
  enableCopy: true,
  enableExpand: true,
  enableZoomControls: true,
  enableWheelZoom: true,
  enableInlineWheelZoom: false,
  containerHeight: '620px',
  enhancedAttr: 'data-mermaid-enhanced',
  enhancedClass: 'mermaid-diagram-enhanced',
  panZoomOptions: {
    zoomEnabled: true,
    panEnabled: true,
    controlIconsEnabled: false,
    fit: true,
    center: true,
    mouseWheelZoomEnabled: false,
    dblClickZoomEnabled: true,
    minZoom: 0.2,
    maxZoom: 10,
    zoomScaleSensitivity: 0.1,
    refreshRate: 60,
  },
};
