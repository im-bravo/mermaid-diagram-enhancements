/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Mermaid Diagram Pan & Zoom',
  tagline: 'Pan, zoom, fullscreen, and copy for Mermaid diagrams — framework-agnostic SDK & Docusaurus plugin',
  url: process.env.DOCUSAURUS_URL || 'http://localhost',
  baseUrl: process.env.DOCUSAURUS_BASE_URL || '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',

  i18n: { defaultLocale: 'en', locales: ['en'] },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    ['docusaurus-plugin-mermaid-pan-zoom', {
      // All options from mermaid-diagram-pan-zoom are supported here.
      // These override the Docusaurus-specific defaults.
      enableInlineWheelZoom: true,
      wheelZoomRequiresCtrl: true,
      intrinsicHeightScale: 1.2,
    }],
    // Watch workspace source packages for hot-reload during development.
    function workspaceWatchPlugin(_context, _options) {
      return {
        name: 'workspace-watch-plugin',
        configureWebpack(_config, isServer, utils) {
          if (isServer || !utils.getLoaders) return {};
          // Do NOT clear managedPaths entirely — that forces webpack to watch
          // every file under node_modules, exhausting OS file-watcher limits
          // and causing dev-mode hot reload to miss markdown changes.
          // Instead, we rely on Docusaurus' built-in content-plugin chokidar
          // watchers for docs/ and keep webpack focused on source code.
          return {};
        },
      };
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Mermaid Diagram Pan & Zoom',
        items: [
          {
            href: 'https://github.com/im-bravo/mermaid-diagram-enhancements',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      docs: {
        sidebar: {
          hideable: true
        },
      },
      mermaid: {
        theme: { light: 'default', dark: 'dark' },
      },
    }),
};

export default config;
