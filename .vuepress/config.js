module.exports = {
  theme: "cosmos",
  title: "CosmWasm Documentation",
  base: process.env.VUEPRESS_BASE || "/",
  locales: {
    "/": {
      lang: "en-US"
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/logo/SVG/CosmWasm_Favicon_Full.svg' }]
  ],
  themeConfig: {
    custom: true,
    editLinks: true,
    repo: "CosmWasm/docs",
    docsRepo: "CosmWasm/docs",
    docsDir: "/",
    logo: {
      src: "/logo/SVG/CosmWasm_Logo.svg",
    },
    algolia: {
      id: "BH4D9OD16A",
      key: "abeca9781b806ca955a7e0f1ee95d003",
      index: "cosmwasm_docs"
    },
    versions: [
      {
        "label": "0.13",
        "key": "0.13"
      },
      {
        "label": "0.14",
        "key": "0.14"
      }
    ],
    topbar: {
      banner: false
    },
    sidebar: {
      auto: false,
      nav: [
        {
          children: [
            {
              title: "Welcome",
              path: "/introduction",
              directory: true,
            },
            {
              title: "Getting Started",
              path: "/getting-started",
              directory: true,
            },
            {
              title: "Architecture",
              path: "/architecture",
              directory: true,
            },
            {
              title: "Testnets",
              path: "/testnets",
              directory: true,
            },
          ]
        },
        {
          title: "Learn",
          children: [
            {
              title: "Simple Option",
              path: "/learn/simple-option",
              directory: true,
            },
            {
              title: "Hijack Escrow",
              path: "/learn/hijack-escrow",
              directory: true,
            },
            {
              title: "Smart Contracts Over Governance",
              path: "/learn/governance",
            },
            {
              title: "Name Service",
              path: "/learn/name-service",
              directory: true,
            },
            {
              title: "Frontend dApp",
              path: "/learn/frontend-dapp",
              directory: true,
            },
            {
              title: "Videos and Workshops",
              path: "/learn/videos-workshops",
            },
            {
              title: "Migrating Contracts",
              path: "/learn/MIGRATING"
            },
            {
              title: "Changelog",
              path: "/learn/CHANGELOG"
            },
          ]
        },
        {
          title: "Community",
          children: [
            {
              title: "Hall Of Fame",
              path: "/community/hall-of-fame"
            },
          ]
        },
        {
          title: "IBC",
          children: [
            {
              title: "Overview",
              path: "/ibc/01-overview"
            },
            {
              title: "Relayer",
              path: "/ibc/01-relayer"
            },
            {
              title: "List of Active Connections",
              path: "/ibc/03-active-connections"
            },
            {
              title: "CW20 ICS20",
              path: "/ibc/03-active-connections"
            },
          ]
        },
        {
          title: "Plus Contracts",
          children: [
            {
              title: "General",
              path: "/cw-plus/general",
              directory: true,
            },
            {
              title: "CW1",
              path: "/cw-plus/cw1",
              directory: true,
            },
            {
              title: "CW2",
              path: "/cw-plus/cw2",
              directory: true,
            },
            {
              title: "CW20",
              path: "/cw-plus/cw20",
              directory: true,
            },
            {
              title: "CW3",
              path: "/cw-plus/cw3",
              directory: true,
            },
            {
              title: "CW4",
              path: "/cw-plus/cw4",
              directory: true,
            },
            {
              title: "CW721",
              path: "/cw-plus/cw721",
              directory: true,
            },
          ]
        },
        {
          title: "Resources",
          children: [
            // internal links
            {
              title: "Media",
              path: "/media",
              directory: true,
            },
            // external links
            {
              title: "Community chat",
              path: "https://docs.cosmwasm.com/chat"
            },
            {
              title: "GitHub",
              path: "https://github.com/CosmWasm"
            },
            {
              title: "Blog",
              path: "https://medium.com/confio"
            }
          ]
        }
      ]
    },
    gutter: {
      editLink: true,
      github: {
        title: "Found an Issue?",
        text: "Help us improve this page by suggesting edits on GitHub."
      }
    },
    footer: {
      logo: "/logo/SVG/CosmWasm_Logo_Clear_Black.svg",
      textLink: {
        text: "cosmwasm.com",
        url: "https://www.cosmwasm.com"
      },
      services: [
        {
          service: "medium",
          url: "https://medium.com/confio"
        },
        {
          service: "twitter",
          url: "https://twitter.com/CosmWasm"
        },
        {
          service: "discord",
          url: "https://docs.cosmwasm.com/chat"
        },
        {
          service: "telegram",
          url: "https://t.me/joinchat/AkZriEhk9qcRw5A5U2MapA"
        },
      ],
      smallprint:
        `Copyright © ${new Date().getFullYear()} Confio OÜ`,
      links: [
        {
          title: "Related Documentation",
          children: [
            {
              title: "Cosmos SDK",
              url: "https://cosmos.network/docs"
            },
            {
              title: "Cosmos Hub",
              url: "https://hub.cosmos.network/"
            },
            {
              title: "Tendermint Core",
              url: "https://docs.tendermint.com/"
            }
          ]
        },
        {
          title: "Community",
          children: [
            {
              title: "Confio blog",
              url: "https://medium.com/confio"
            },
            {
              title: "CosmWasm forum",
              url: "https://forum.cosmwasm.com"
            },
            {
              title: "Telegram",
              url: "https://t.me/joinchat/AkZriEhk9qcRw5A5U2MapA"
            }
          ]
        },
        {
          title: "Contributing",
          children: [
            {
              title: "Contributing to the docs",
              url:
                "https://github.com/CosmWasm/docs/blob/master/DOCS_README.md"
            },
            {
              title: "Source code on GitHub",
              url: "https://github.com/CosmWasm/cosmwasm"
            }
          ]
        }
      ]
    }
  },
  plugins: [
    'check-md', {
      pattern: "**/*.md"
    }
  ]
}
