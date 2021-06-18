# CosmWasm Docs Website

CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard of it, please check out this intro. The purpose of this documentation is to give a deep dive into the technology for developers who wish to try it out or integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos SDK, as well as Rust developers looking for a blockchain platform.

> This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Installation

```console
yarn install
```

## Local Development

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live
 without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Auto Deployment

Merges to `main` branch will automatically be deployed to https://docs.cosmwasm.com
