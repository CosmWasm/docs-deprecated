module.exports = {
  theme: "cosmos",
  title: "CosmWasm Documentation",
  themeConfig: {
    custom: true,
    editLinks: true,
    repo: "CosmWasm/docs",
    docsRepo: "CosmWasm/docs",
    docsDir: "docs",
    logo: {
      src: "/logo/PNG/CosmWasm Logo.png",
    },
    sidebar: {
      auto: false,
      nav: [
        {
          children: [
            {
              title: "Intro",
              path: "/intro",
              directory: true,
            },
            {
              title: "Getting Started",
              path: "/getting-started",
              directory: true,
            },
            {
              title: "Name Service",
              path: "/name-service",
              directory: true,
            },
            {
              title: "Production Tooling",
              path: "/tooling",
              directory: true,
            },
          ]
        },
        {
          title: "Resources",
          children: [
            {
              title: "Blog",
              path: "https://www.cosmwasm.com/blog/"
            },
            {
              title: "GitHub",
              path: "https://github.com/confio/cosmwasm"
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
      logo: "/logo/PNG/CosmWasm_Logo_Stacked.png",
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
                "https://github.com/CosmWasm/docs/blob/master/docs/DOCS_README.md"
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