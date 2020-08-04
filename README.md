---
title: CosmWasm Documentation
description: CosmWasm is a new smart contracting platform built for the cosmos ecosystem.
footer:
  newsletter: false
aside: true
---

# CosmWasm Documentation

CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard of it, please [check out this intro](https://blog.cosmos.network/announcing-the-launch-of-cosmwasm-cc426ab88e12). The purpose of this documentation is to give a deep dive into the technology for developers who wish to try it out or integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos SDK, as well as Rust developers looking for a blockchain platform. {synopsis}

## How to use CosmWasm

CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain, without adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the `gaiad` binary, called [`wasmd`](https://github.com/CosmWasm/wasmd), so you can launch a new smart-contract enabled blockchain out of the box, using documented and tested tooling and the same security model as the Cosmos Hub.

You will need a running blockchain to host your contracts and use them from an app. We will explain how to [set up a local "dev net"](../getting-started/using-the-sdk.md) in a later section. And plan to soon release a hosted testnet, to which all developers can simply upload their contracts, in order to easy run a demo and to share their contract with others.

## Sections

[The intro section](/intro/multichain.html) explains much of the high-level design and architecture of CosmWasm. Before you start designing systems, it is good to understand the mental model and capabilities of the system. If you just want to get your hands dirty with working code, you can skip this section for now and come back later when you are ready to ponder design.

[Getting Started](/getting-started/intro.html) will transition into hands-on training. It gently leads you through modifying, deploying, and executing a smart contract on a local blockchain. It is the ideal place to go through and get acquainted with all the aspects of the system, without too much hard work coding.

## Further Studies

We provide a video of a [workshop explaining token contracts](https://www.youtube.com/watch?v=pm6VX5ueT2k&feature=youtu.be)
along with a live coding session that you can follow along with at home.

And after that, you can dig into our code and start writing your own contracts:

* [A set of example contracts](https://github.com/CosmWasm/cosmwasm-examples) for you to fork and experiment with
* Rustdoc for the [core contract libs](https://docs.rs/cosmwasm-std/0.9.2/cosmwasm_std/)
* Rustdoc for the [storage helpers](https://docs.rs/cosmwasm-storage/0.9.2/cosmwasm_storage/)

There are quite a few [high level articles on medium](https://medium.com/confio) that explain the various components of
our stack and where we are going.

Many thanks to the [Interchain Foundation](https://interchain.io/) for funding most of the development work to bring
CosmWasm to production.