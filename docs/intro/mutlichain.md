---
id: multichain
title: What are Multi-Chain Contracts?
sidebar_label: Multi-Chain
---

CosmWasm is designed from the ground-up to be a multi-chain solution for smart contracts.
As it comes from the Cosmos ecosystem, it is no surprise that this is designed for networks
of blockchains, rather than silos. But what exactly do we mean by multichain?

## Different Chain, Same Contract

Since we make little requirements of the host application, it is easy for any CosmosSDK app
to embed the `wasm` module and customize the permissioning or fees as they wish. All code
is designed to be agnostic to the details of the underlying chain, so just by writing a
CosmWasm contract, you will soon be able to run on many different chains on the Cosmos ecosystem.

[Regen Network](https://regen.network) plans to include CosmWasm support, when they launch. And a number of other chains are looking into adding this support.

## Inter Blockchain Contracts

If you have heard anything about Cosmos, it is most likely about [Inter-Blockchain Communication](https://cosmos.network/ibc/). The power of [Tendermint BFT consensus](https://tendermint.com) and their [novel bonded proof of stake algorithm](https://blog.cosmos.network/what-does-the-launch-of-cosmos-mean-for-the-blockchain-ecosystem-952e14f67d0d) are just the foundation on which they enable a revolutionary protocol to allow trustless message passing semantics between blockchains. No middleman, no timing issue, full security.

The potential means code on one chain can execute a transaction on another chain. But the code must be designed around such a message-passing idiom. CosmWasm fully embraces the [actor model](./actor) and as such naturally lends itself to such IBC. Fire and forget messages, rather than awaiting a promise and worrying about race conditions and reentrancy attacks. As IBC stabilizes, we will be adding first class support for IBC primitives into the [CosmWasm](https://github.com/confio/cosmwasm) libraries, as well as the [Cosmos SDK module](https://github.com/cosmwasm/wasmd/tree/master/x/wasm) that hosts it.

## Easy to Integrate

Another design goal of CosmWasm was to be more of a library than a framework. This means it has a small surface area of required APIs and you can opt-in to most of the code. It is there to make life easy for you, but you can easily build it your own way as well. This has two big benefits. The first is that it makes it easier to add support for multiple languages to write contracts in. So we can add support for say, [AssemblyScript](https://docs.assemblyscript.org/) or [Go](https://github.com/tinygo-org/tinygo), for those who prefer not to write in Rust.

The second benefit is that since it makes limited demands of the host system, it can be embedded in other frameworks, not just the Cosmos SDK. The core runtime logic [`cosmwasm-vm`](https://github.com/confio/cosmwasm/tree/master/lib/vm) is in rust, and [`go-cosmwasm`](https://github.com/confio/go-cosmwasm) provides a generic Go binding to it. As Go and Rust are two of the most popular languages to write blockchains, this opens the door for many integrations. Of course, unless your chain is running on top of [Tendermint](https://tendermint.com) or potentially another BFT Instant Finality Consensus algorithm like [Babble](https://babble.io/), the contracts will not be able to participate with IBC.

## Platform to Build On

CosmWasm doesn't want to lock you to one blockchain, or even one programming language. It is designed to be adaptable to many environments, and *connect* blockchains. This makes it a solid platform to build on. Even if one chain doesn't pan out well, all your smart contracts and dApps can quickly be transferred to another chain. Or if your app grows quickly, you can launch your own chain to deploy the next version of the contracts, and transfer all existing tokens to your new chain via IBC. The possibilities are only limited by your imagination.
