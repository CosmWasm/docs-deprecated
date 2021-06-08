export default {
  "title": "CosmWasm Documentation",
  "tagline": "CosmWasm documentation",
  "url": "https://docs.cosmwasm.com",
  "baseUrl": "/",
  "onBrokenLinks": "throw",
  "onBrokenMarkdownLinks": "warn",
  "favicon": "img/favicon.svg",
  "organizationName": "CosmWasm",
  "projectName": "docs",
  "themeConfig": {
    "navbar": {
      "logo": {
        "alt": "CosmWasm",
        "src": "img/logo.svg"
      },
      "items": [
        {
          "href": "https://cosmwasm.com",
          "label": "Website",
          "position": "right"
        },
        {
          "href": "https://github.com/CosmWasm",
          "label": "GitHub",
          "position": "right"
        },
        {
          "type": "docsVersionDropdown",
          "position": "left",
          "dropdownActiveClassDisabled": true,
          "docsPluginId": "default",
          "dropdownItemsBefore": [],
          "dropdownItemsAfter": []
        }
      ],
      "hideOnScroll": false
    },
    "footer": {
      "style": "light",
      "links": [
        {
          "title": "Related Documentation",
          "items": [
            {
              "label": "Cosmos SDK",
              "href": "https://cosmos.network/docs"
            },
            {
              "label": "Cosmos Hub",
              "href": "https://hub.cosmos.network/"
            },
            {
              "label": "Tendermint Core",
              "href": "https://docs.tendermint.com/"
            }
          ]
        },
        {
          "title": "Repositories",
          "items": [
            {
              "label": "CosmWasm/cosmwasm",
              "href": "https://github.com/CosmWasm/cosmwasm"
            },
            {
              "label": "CosmWasm/wasmd",
              "href": "https://github.com/CosmWasm/wasmd"
            },
            {
              "label": "CosmWasm/cosmwasm-plus",
              "href": "https://github.com/CosmWasm/cosmwasm-plus"
            },
            {
              "label": "CosmWasm/cawesome-wasm",
              "href": "https://github.com/CosmWasm/cawesome-wasm"
            }
          ]
        },
        {
          "title": "Community",
          "items": [
            {
              "label": "Confio Blog",
              "href": "https://medium.com/confio"
            },
            {
              "label": "Discord",
              "href": "https://docs.cosmwasm.com/chat/"
            },
            {
              "label": "Twitter",
              "href": "https://twitter.com/CosmWasm"
            }
          ]
        }
      ],
      "logo": {
        "alt": "CosmWasm Logo",
        "src": "img/logo_stacked.png",
        "href": "https://cosmwasm.com"
      },
      "copyright": "Copyright © 2021 Confio OÜ"
    },
    "prism": {
      "additionalLanguages": [
        "rust"
      ]
    },
    "colorMode": {
      "defaultMode": "light",
      "disableSwitch": false,
      "respectPrefersColorScheme": false,
      "switchConfig": {
        "darkIcon": "🌜",
        "darkIconStyle": {},
        "lightIcon": "🌞",
        "lightIconStyle": {}
      }
    },
    "docs": {
      "versionPersistence": "localStorage"
    },
    "metadatas": [],
    "hideableSidebar": false
  },
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "sidebarPath": "/Users/orkunkulce/Workspace/confio/docs/sidebars.js",
          "editUrl": "https://github.com/CosmWasm/docs/edit/master",
          "routeBasePath": "/",
          "lastVersion": "current",
          "versions": {
            "current": {
              "label": "0.14",
              "path": "0.14"
            }
          }
        },
        "theme": {
          "customCss": "/Users/orkunkulce/Workspace/confio/docs/src/css/custom.css"
        }
      }
    ]
  ],
  "plugins": [
    [
      "@docusaurus/plugin-client-redirects",
      {
        "fromExtensions": [
          "html"
        ]
      }
    ]
  ],
  "baseUrlIssueBanner": true,
  "i18n": {
    "defaultLocale": "en",
    "locales": [
      "en"
    ],
    "localeConfigs": {}
  },
  "onDuplicateRoutes": "warn",
  "customFields": {},
  "themes": [],
  "titleDelimiter": "|",
  "noIndex": false
};