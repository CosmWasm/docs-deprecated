module.exports = {
  title: 'CosmWasm Documentation',
  tagline: 'CosmWasm documentation',
  url: 'https://test-docs.cosmwasm.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.svg',
  organizationName: 'orkunkl',
  projectName: 'docs',
  themeConfig: {
    navbar: {
      logo: {
        alt: 'CosmWasm',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://cosmwasm.com',
          label: 'Website',
          position: 'right',
        },
        {
          href: 'https://github.com/CosmWasm',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'docsVersionDropdown',
          position: 'left',
          dropdownActiveClassDisabled: true,
          docsPluginId: 'default',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Related Documentation',
          items: [
            {
              label: 'Cosmos SDK',
              href: 'https://cosmos.network/docs',
            },
            {
              label: 'Cosmos Hub',
              href: 'https://hub.cosmos.network/',
            },
            {
              label: 'Tendermint Core',
              href: 'https://docs.tendermint.com/',
            },
          ],
        },
        {
          title: 'Repositories',
          items: [
            {
              label: 'CosmWasm/cosmwasm',
              href: 'https://github.com/CosmWasm/cosmwasm',
            },
            {
              label: 'CosmWasm/wasmd',
              href: 'https://github.com/CosmWasm/wasmd',
            },
            {
              label: 'CosmWasm/cosmwasm-plus',
              href: 'https://github.com/CosmWasm/cosmwasm-plus',
            },
            {
              label: 'CosmWasm/cawesome-wasm',
              href: 'https://github.com/CosmWasm/cawesome-wasm',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Confio Blog',
              href: 'https://medium.com/confio',
            },
            {
              label: 'Discord',
              href: 'https://docs.cosmwasm.com/chat/',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/CosmWasm',
            },
          ],
        },
      ],
      logo: {
        alt: 'CosmWasm Logo',
        src: 'img/logo_stacked.png',
        href: 'https://cosmwasm.com',
      },
      copyright: `Copyright © ${new Date().getFullYear()} Confio OÜ`,
    },
    prism: {
      additionalLanguages: ['rust'],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          editUrl: 'https://github.com/CosmWasm/docs/edit/master',
          routeBasePath: '/',
          lastVersion: "0.14",
          versions: {
            "0.14": {
              label: "0.14",
              path: "0.14"
            },
          }
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html'],
        redirects: [
          {
            from: '/',
            to: '/0.14',
          },
        ],
      },
    ],
  ],
};
