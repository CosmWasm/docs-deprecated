---
title: Overview
order: 1
---

# CosmWasm

CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard of it, please [check out this intro](https://blog.cosmos.network/announcing-the-launch-of-cosmwasm-cc426ab88e12). The purpose of this documentation is to give a deep dive into the technology for developers who wish to try it out or integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos-SDK, as well as Rust developers looking for a blockchain platform.

CosmWasm was originally [prototyped by Team Gaians](https://github.com/cosmos-gaians/cosmos-sdk/tree/hackatom/x/contract) at the [Berlin Hackatom 2019](https://blog.cosmos.network/cosmos-hackatom-berlin-recap-4722882e7623). In particular, [Aaron Craelius](https://github.com/aaronc) came up with the architecture, especially avoiding reentrancy, [Jehan Tremback](https://github.com/jtremback) led the rust coding, and [Ethan Frey](https://github.com/ethanfrey) led the go side of the implementation. After the successful prototype, the [Interchain Foundation](https://interchain.io/) provided a grant to [Confio](http://confio.tech) to implement a robust version that would work in an adversarial environment. This article introduces developers to the output of that grant work, and lays out possible future directions.

## How to use CosmWasm

CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain, without adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the `gaiad` binary, called [`wasmd`](https://github.com/CosmWasm/wasmd), so you can launch a new smart-contract enabled blockchain out of the box, using documented and tested tooling and the same security model as the Cosmos Hub.

You will need a running blockchain to host your contracts and use them from an app. We will explain how to [set up a local "dev net"](../getting-started/using-the-sdk.md) in a later section. And plan to soon release a hosted testnet, to which all developers can simply upload their contracts, in order to easy run a demo and to share their contract with others.

## Sections

[The rest of this section](./multichain) explains much of the high-level design and architecture of CosmWasm. Before you start designing systems, it is good to understand the mental model and capabilities of the system. If you just want to get your hands dirty with working code, you can skip this section for now and come back later when you are ready to ponder design.

[Getting Started](../getting-started/intro) will transition into hands-on training. It gently leads you through modifying, deploying, and executing a smart contract on a local blockchain. It is the ideal place to go through and get acquainted with all the aspects of the system, without too much hard work coding.

[Name Service](../name-service/intro) is a simple tutorial modeled after the [SDK tutorial of the same name]((https://tutorials.cosmos.network/nameservice/tutorial/00-intro.html)), that will show you how to build your own contract from scratch. It will also show you how to connect to contracts, enabling the escrow contract to resolve the beneficiary by name, not just address. Unless you are already skilled with Rust and the Cosmos SDK, please start with [the first tutorial](../getting-started/intro)