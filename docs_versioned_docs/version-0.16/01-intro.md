---
id: intro
slug: /
sidebar_position: 1
---

# Introduction

:::note
Synopsis CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard
of it, please [check out this intro](https://blog.cosmos.network/announcing-the-launch-of-cosmwasm-cc426ab88e12). The
purpose of this documentation is to give a deep dive into the technology for developers who wish to try it out or
integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos SDK, as well
as Rust developers looking for a blockchain platform.
:::

## How to use CosmWasm {#how-to-use-cosmwasm}

CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a
blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain, without
adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the `gaiad` binary,
called [`wasmd`](https://github.com/CosmWasm/wasmd), so you can launch a new smart-contract enabled blockchain out of
the box, using documented and tested tooling and the same security model as the Cosmos Hub.

You will need a running blockchain to host your contracts and use them from an app. We will explain how
to [connect to a testnet](/02-getting-started/03-setting-env.md#setting-up-environment)
or [set up a local "dev net"](/02-getting-started/03-setting-env.md#run-local-node-optional) in a later section. And
plan to soon release a hosted testnet, to which all developers can simply upload their contracts, in order to easy run a
demo and to share their contract with others.

## Sections {#sections}

* [Getting Started](02-getting-started/01-intro.md) dives you into hands-on training. It gently leads you through
  modifying, deploying, and executing a smart contract on a local blockchain. It is the ideal place to go through and
  get acquainted with all the aspects of the system, without too much hard work coding.

* [Architecture](03-architecture/01-multichain.md) explains much of the high-level design and 03-architecture of
  CosmWasm. Before you start designing systems, it is good to understand the mental model and capabilities of the
  system. If you just want to get your hands dirty with working code, you can skip this section for now and come back
  later when you are ready to ponder design.

* [Learn](/tutorials/simple-option/intro) will demonstrate developing smart contracts from zero to production with step
  by step explanations, code snippets, scripts and more.

* [Workshops](/tutorials/videos-workshops) has great collection of demonstrations and verbal explanation of CosmWasm
  tech stack recorded by our team in various events and organisations.

* [Plus](/cw-plus/overview) is for state of art CosmWasm smart contracts.

* [IBC](05-ibc/01-overview.md) is for all the things related to CosmWasm and IBC. Relayers, Active Network Connections,
  IBC enabled smart contracts and more.

## Further Studies {#further-studies}

you can dig into our code and start writing your own contracts:

* [A set of example contracts](https://github.com/CosmWasm/cw-examples) for you to fork and experiment with
* Rustdoc for the [core contract libs](https://docs.rs/cosmwasm-std/0.13.1/cosmwasm_std/)
* Rustdoc for the [storage helpers](https://docs.rs/cosmwasm-storage/0.13.1/cosmwasm_storage/)

There are quite a few [high level articles on medium](https://medium.com/confio) that explain the various components of
our stack and where we are going.

Many thanks to the [Interchain Foundation](https://interchain.io/) for funding most of the development work to bring
CosmWasm to production.
