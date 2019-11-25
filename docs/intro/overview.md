---
id: overview
title: CosmWasm
sidebar_label: Overview
---

CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard of it, please check out this intro (LINK to Michelle's article). The purpose of this article is to give a deep dive into the technology for developers who wish to try it out or integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos-SDK, as well as Rust developers looking for a blockchain platform.

CosmWasm was originally [prototyped by Team Gaians](https://github.com/cosmos-gaians/cosmos-sdk/tree/hackatom/x/contract) at the [Berlin Hackatom 2019](https://blog.cosmos.network/cosmos-hackatom-berlin-recap-4722882e7623). In particular, [Aaron Craelius](https://github.com/aaronc) came up with the architecture, especially avoiding reentrancy, [Jehan Tremback](https://github.com/jtremback) led the rust coding, and [Ethan Frey](https://github.com/ethanfrey) led the go side of the implementation. After the successful prototype, the [Interchain Foundation](https://interchain.io/) provided a grant to [Confio](http://confio.tech) to implement a robust version that would work in an adversarial environment. This article introduces developers to the output of that grant work, and lays out possible future directions. 

## How to use CosmWasm

CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain, without adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the `gaiad` binary, called [wasmd](https://github.com/cosmwasm/wasmd), so you can launch a new smart-contract enabled blockchain out of the box, using documented and tested tooling and the same security model as the Cosmos Hub.

To try out these commands, you should first install a local single-node testnet of `wasmd`, by [following these instructions](https://github.com/cosmwasm/wasmd/blob/master/docs/deploy-testnet.md#single-node-local-manual-testnet). Soon we aim to deploy a testnet to allow all developers to quickly test out contract development and connecting dApps.

## Where to Start

[Smart Contracts](./smart-contracts.md) to read about design of the smart contract engine provided by CosmWasm. You will understand understand the architecture and how to design your contracts, as well as the secuirity design of the system.

[Using the SDK](./using-the-sdk.md) for those who have no prior experience with the Cosmos SDK will get you up and running with the basics of using a Cosmos SDK based blockchain. By the end, You will be able to compile a chain from source and launch a local devnet.

[Rust Basics](./rust-basics.md) is for those with little to no prior experience with Rust. It is no crash-course in the language, but enough to get you compiling (and editting) the example contracts and pointers on where to dig deeper into the language.

[First Demo](./first-demo.md) is a simple demo that builds on the theory of the above sections and walks you through, step by step, deploying a pre-built contract to your local dev-net and executing some commands on it. Now that you have looked at the details, it will give you a good feel of how the system works from the outside.

[Namecoin](../namecoin) is a simple tutorial modelled after the SDK tutorial of the same name (TODO LINK). Once you have mastered the skills for going through the first demo, it will walk you through the process of building your own custom contract from scratch.

