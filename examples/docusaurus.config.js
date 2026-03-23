/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'mermaid-diagram-pan-zoom',
  tagline: 'SDK Feature Verification',
  url: 'http://localhost',
  baseUrl: '/',
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
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'mermaid-diagram-pan-zoom',
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
