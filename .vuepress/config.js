module.exports = {
  theme: "cosmos",
  title: "CosmWasm Documentation",
  head: [
    ['link', { rel: 'icon', href: '/logo/SVG/CosmWasm Favicon.svg' }]
  ],
  themeConfig: {
    custom: true,
    editLinks: true,
    repo: "CosmWasm/docs",
    docsRepo: "CosmWasm/docs",
    docsDir: "docs",
    logo: {
      src: "/logo/SVG/CosmWasm Logo.svg",
    },
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
              title: "Name Service",
              path: "/learn/name-service",
              directory: true,
            }
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
              path: "https://www.cosmwasm.com/blog/"
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
                "https://github.com/CosmWasm/docs2/blob/master/DOCS_README.md"
            },
            {
              title: "Source code on GitHub",
              url: "https://github.com/CosmWasm/cosmwasm"
            }
          ]
        }
      ]
    }
  }
}
