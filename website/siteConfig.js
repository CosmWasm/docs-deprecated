// GIT_USER=ethanfrey USE_SSH=true yarn publish-gh-pages

const siteConfig = {
  title: 'Get started with multi-chain smart contracts!',
  tagline: 'CosmWasm Documentation',

  // TODO: 1. host this without /docs, then custom url
  url: "http://www.cosmwasm.com",
  baseUrl: "/",

  cname: 'www.cosmwasm.com',
  projectName: 'docs',
  organizationName: 'cosmwasm',

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
