const docsVersions = require('./versions.json');
const cwplusVersions = require('./cw_plus_versions.json');

const lastReleasedDocsVersion = docsVersions[0];
const lastReleasedCWPlusVersion = cwplusVersions[0];

(module.exports = {
  title: 'CosmWasm Documentation',
  tagline: 'CosmWasm documentation',
  url: 'https://docs.cosmwasm.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
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
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
          docsPluginId: 'docs',
        },
        {
          type: 'doc',
          docId: 'hijack-escrow/intro',
          position: 'left',
          label: 'Tutorials',
          docsPluginId: 'tutorials',
        },
        {
          label: 'dApps',
          position: 'left',
          items: [
            {
              to: `cw-plus/${lastReleasedCWPlusVersion}/overview`,
              label: 'cw-plus',
            },
          ],
        },
        {
          type: 'doc',
          docId: 'overview',
          position: 'left',
          label: 'Ecosystem',
          docsPluginId: 'ecosystem',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
          docsPluginId: 'docs',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
          docsPluginId: 'cw-plus',
        },
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
      copyright: `Copyright © ${new Date().getFullYear()} CosmWasm`,
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
        debug: true,
        docs: {
          editUrl: 'https://github.com/CosmWasm/docs/edit/main',
          id: 'docs',
          lastVersion: "current",
          routeBasePath: '/docs',
          sidebarPath: require.resolve('./sidebars/sidebars.js'),
          versions: {
            current: {
              label: lastReleasedDocsVersion,
              path: lastReleasedDocsVersion
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
            to: `/docs/${lastReleasedDocsVersion}/`,
          },
          {
            from: `/docs/${lastReleasedDocsVersion}/introduction/intro`,
            to: `/docs/${lastReleasedDocsVersion}/`,
          },
        ],
        createRedirects: function (existingPath) {
          let paths = []

          /*
           * DOCS REDIRECTIONS
           */
          if (existingPath.includes(`/docs/${lastReleasedDocsVersion}`)) {
            paths.push(existingPath.replace(`/docs/${lastReleasedDocsVersion}`,'/docs'));
          }
          if (existingPath.includes(`/docs`)) {
            paths.push(existingPath.replace('/docs',''));
          }

          /*
           * CW PLUS REDIRECTIONS
           */
          if (existingPath.includes(`/cw-plus/${lastReleasedCWPlusVersion}`)) {
            paths.push(existingPath.replace(`/cw-plus/${lastReleasedCWPlusVersion}`,'/cw-plus'));
          }

          /*
           * TESTNET REDIRECTIONS
           */
          if (existingPath.includes('/testnets')) {
            let old_testnet = existingPath.split("/testnets")
            let url = old_testnet.pop()
            paths.push(`/docs/0.14/testnets/${url}`);
            paths.push(`/docs/0.13/testnets/${url}`);
            paths.push(`/0.14/testnets/${url}`);
            paths.push(`/0.13/testnets/${url}`);
          }

          return paths;
        },
      },
    ],
    'docusaurus-plugin-sass',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ecosystem',
        path: 'ecosystem',
        routeBasePath: 'ecosystem',
        sidebarPath: require.resolve('./sidebars/sidebarsCommunity.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'tutorials',
        path: 'tutorials',
        routeBasePath: 'tutorials',
        sidebarPath: require.resolve('./sidebars/sidebarsTutorials.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'cw-plus',
        path: 'cw-plus',
        routeBasePath: 'cw-plus',
        sidebarPath: require.resolve('./sidebars/sidebarsCwPlus.js'),
        lastVersion: "current",
        versions: {
          current: {
            label: lastReleasedCWPlusVersion,
            path: lastReleasedCWPlusVersion
          }
        }
      },
    ],
  ],
});
