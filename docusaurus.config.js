module.exports = {
  title: 'CosmWasm Documentation',
  tagline: 'CosmWasm documentation',
  url: 'https://docs.cosmwasm.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.svg',
  organizationName: 'CosmWasm',
  projectName: 'docs',
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'CosmWasm',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
        href: 'https://docs.cosmwasm.com/',
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
      hideOnScroll: true,
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
              label: 'Blog',
              href: 'https://medium.com/cosmwasm',
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
    /*
    announcementBar: {
      id: 'new_release',
      content:
        'New documentation will be released with CosmWasm 1.0, follow and contribute changes at <a href="https://docs.cosmwasm.com/next">next</a>',
      backgroundColor: '#7691FE',
      textColor: '#F5F6F7',
    },
     */
    algolia: {
      apiKey: 'abeca9781b806ca955a7e0f1ee95d003',
      indexName: 'cosmwasm_docs',
      contextualSearch: true,
      appId: 'BH4D9OD16A',
    },
    hideableSidebar: true
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          editUrl: 'https://github.com/CosmWasm/docs/edit/main',
          routeBasePath: '/',
          lastVersion: "current",
          versions: {
            current: {
              label: "0.14",
              path: "0.14"
            }
          }
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
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
          to: '/0.14/',
        },
      ],
    },
    ],
    'docusaurus-plugin-sass'
  ],
};
