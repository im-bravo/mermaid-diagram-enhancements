/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: '🏠 Home',
    },
    {
      type: 'category',
      label: '📐 Diagram Demos',
      collapsible: false,
      items: [
        'flowchart',
        'sequence-diagram',
        'class-diagram',
        'state-diagram',
      ],
    },
    {
      type: 'category',
      label: '🔬 Testing',
      collapsible: false,
      items: [
        'all-features',
        'large-sequence-diagram',
      ],
    },
  ],
};

export default sidebars;
