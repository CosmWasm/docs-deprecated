// GIT_USER=ethanfrey USE_SSH=true yarn publish-gh-pages

const siteConfig = {
  title: 'CosmWasm Documentation',
  tagline: 'Get started with multi-chain smart contracts!',

  // TODO: 1. host this without /docs, then custom url
  url: "http://www.cosmwasm.com",
  baseUrl: "/",

  cname: 'www.cosmwasm.com',
  projectName: 'docs',
  organizationName: 'cosmwasm',
  repoUrl: "https://github.com/CosmWasm/docs",

  // algolia: {
  //   apiKey: 'xxx',
  //   indexName: 'xxx',
  // },

  headerLinks: [
    { doc: "intro/overview", label: "Docs" },
    { blog: true, label: "Blog" },
    { href: "https://github.com/confio/cosmwasm", label: "GitHub" },
    // { search: true },
  ],

  users: [
    {
      caption: "Regen Network (Testnet)",
      image: "/img/regen-logo.jpeg",
      infoLink: "https://medium.com/regen-network/cosmwasm-kontra%C5%ADa-testnet-plan-2756490ccdf4",
      pinned: true,
    },
    {
      caption: "Enigma (Testnet)",
      image: "/img/enigma-logo.jpg",
      infoLink: "https://forum.enigma.co/t/testnet-is-live-with-smart-contracts/1386",
      pinned: true,
    }
  ],

  disableHeaderTitle: true,

  headerIcon: 'img/cosm-wasm.png',
  footerIcon: false,
  favicon: 'img/favicon.ico',

  colors: {
    primaryColor: '#6070dd',
    // is secondaryColor ever used? if so adjust 
    secondaryColor: '#43381e',
  },

  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },

  copyright: `Copyright © ${new Date().getFullYear()} Confio UO`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'atom-one-light',
  },

  scripts: ['https://buttons.github.io/buttons.js'],

  onPageNav: 'separate',

  docsSideNavCollapsible: true,

  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',

  // Show documentation's last contributor's name.
  enableUpdateBy: true,
  enableUpdateTime: true,
};

module.exports = siteConfig;
