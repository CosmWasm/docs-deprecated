---
sidebar_position: 2
---

# Basics of Cosmos SDK and CosmWasm

## Cosmos SDK {#cosmos-sdk}

> From [Cosmos SDK docs](https://docs.cosmos.network/v0.43/intro/overview.html)

:::info
What is the SDK?
The Cosmos-SDK is an open-source framework for building multi-asset public Proof-of-Stake (PoS)
blockchains, like the Cosmos Hub, as well as permissioned Proof-Of-Authority (PoA) blockchains. Blockchains built with
the Cosmos SDK are generally referred to as application-specific blockchains.
The goal of the Cosmos SDK is to allow developers to easily create custom blockchains from scratch that can natively
interoperate with other blockchains. We envision the SDK as the npm-like framework to build secure blockchain
applications on top of Tendermint (opens new window). SDK-based blockchains are built out of composable modules,
most of which are open source and readily available for any developers to use. Anyone can create a module for the
Cosmos-SDK, and integrating already-built modules is as simple as importing them into your blockchain application.
What's more, the Cosmos SDK is a capabilities-based system, which allows developers to better reason about the security
of interactions between modules.
:::

In short, Cosmos SDK is an easy-to-use blockchain framework that enables businesses, communities and individuals to develop quickly without delving
into
blockchain details.

Please read through Cosmos SDK overview documentation:

- [Cosmos SDK Intro](https://docs.cosmos.network/master/intro) gives a great introduction to the framework.
- [Cosmos SDK Basics](https://docs.cosmos.network/master/basics) covers basic concepts of cosmos sdk that are required
  for developing on cosmwasm without much cosmos-sdk knowledge.

## CosmWasm {#cosmwasm}

:::info
CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a
blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain,
without adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the gaiad binary,
called `wasmd`, so you can launch a new smart-contract enabled blockchain out of the box, using documented and tested
tooling and the same security model as the Cosmos Hub.
:::

In short, CosmWasm is a smart contract module that can be used with Cosmos SDK. For now it supports smart contracts
written in Rust.

## Differences? {#differences}

- Cosmos SDK is the underlying native application, modules are developed using go.
- CosmWasm is an engine running on Cosmos SDK. Smart contracts are in rust for now.
- Cosmos SDK native modules are slightly faster compared to smart contracts.
- Smart contracts can be swapped when chain is running, on the other hand for making changes to native modules chain
  restarts are required. This process is done by validators coordinating on a restart procedure.

