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
                            label: 'CosmWasm/cw-plus',
                            href: 'https://github.com/CosmWasm/cw-plus',
                        },
                        {
                            label: 'CosmWasm/cw-tokens',
                            href: 'https://github.com/CosmWasm/cw-tokens',
                        },
                        {
                            label: 'InterWasm/cw-contracts',
                            href: 'https://github.com/InterWasm/cw-contracts',
                        },
                        {
                            label: 'InterWasm/cw-awesome',
                            href: 'https://github.com/InterWasm/cw-awesome',
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
                        {
                            label: 'InterWasm',
                            href: 'https://github.com/InterWasm',
                        },
                        {
                            label: 'Media',
                            href: '/media',
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
        algolia: {
            apiKey: 'abeca9781b806ca955a7e0f1ee95d003',
            indexName: 'cosmwasm_docs',
            contextualSearch: true,
            appId: 'BH4D9OD16A',
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                debug: true,
                theme: {
                    customCss: require.resolve('./src/css/custom.scss'),
                },
            },
        ],
    ],
    plugins: [
        'docusaurus-plugin-sass',
    ],
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'fr'],
    },
});
