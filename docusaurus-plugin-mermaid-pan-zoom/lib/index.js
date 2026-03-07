/**
 * Docusaurus plugin for Mermaid diagram enhancements.
 * Zero-config: install and add to plugins, get pan/zoom, fullscreen, copy, zoom controls.
 */

const path = require('path');

module.exports = function (_context, _options) {
  return {
    name: 'docusaurus-plugin-mermaid-pan-zoom',
    getClientModules() {
      return [path.resolve(__dirname, 'clientModules/mermaidEnhancements.js')];
    },
    getThemePath() {
      return path.resolve(__dirname, 'theme');
    },
  };
};
