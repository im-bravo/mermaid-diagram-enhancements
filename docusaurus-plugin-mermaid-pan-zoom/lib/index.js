/**
 * Docusaurus plugin for Mermaid diagram enhancements.
 * Install, add to plugins with optional config, get pan/zoom, fullscreen, copy, zoom controls.
 *
 * Usage in docusaurus.config.js:
 *
 *   plugins: ['docusaurus-plugin-mermaid-pan-zoom'],
 *
 *   // or with options:
 *   plugins: [
 *     ['docusaurus-plugin-mermaid-pan-zoom', {
 *       containerHeight: '600px',
 *       enableInlineWheelZoom: true,
 *     }],
 *   ],
 */

const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = function (_context, pluginOptions) {
  const { id, ...sdkOptions } = pluginOptions || {};

  return {
    name: 'docusaurus-plugin-mermaid-pan-zoom',

    getClientModules() {
      return [path.resolve(__dirname, 'clientModules/mermaidEnhancements.js')];
    },

    configureWebpack() {
      return {
        plugins: [
          new DefinePlugin({
            __MERMAID_PAN_ZOOM_OPTIONS__: JSON.stringify(sdkOptions),
          }),
        ],
      };
    },
  };
};
