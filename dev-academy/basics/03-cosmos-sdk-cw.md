---
sidebar_position: 3
---

# Basics of Cosmos SDK and CosmWasm

## Cosmos SDK {#cosmos-sdk}

> From [Cosmos SDK docs](https://docs.cosmos.network/v0.44/intro/overview.html)

:::info
What is the SDK?
The Cosmos-SDK is an open-source framework for building multi-asset public Proof-of-Stake (PoS)
blockchains, like the Cosmos Hub, as well as permissioned Proof-Of-Authority (PoA) blockchains. Blockchains built with
the Cosmos SDK are generally referred to as application-specific blockchains.
The goal of the Cosmos SDK is to allow developers to easily create custom blockchains from scratch that can natively
interoperate with other blockchains. We envision the SDK as the npm-like framework to build secure blockchain
applications on top of Tendermint. SDK-based blockchains are built out of composable modules,
most of which are open source and readily available for any developers to use. Anyone can create a module for the
Cosmos-SDK, and integrating already-built modules is as simple as importing them into your blockchain application.
What's more, the Cosmos SDK is a capabilities-based system, which allows developers to better reason about the security
of interactions between modules.
:::

In short, Cosmos SDK is an easy-to-use blockchain framework that enables developers to build application-specific blockchains without delving into the implementation details of low-level blockchain infrastructure (e.g., Byzantine fault tolerance).

You can read through Cosmos SDK documentation for more information:

- [Cosmos SDK Intro](https://docs.cosmos.network/main/intro/) gives a great introduction to the framework.
- [Cosmos SDK Basics](https://docs.cosmos.network/main/basics) covers the basics of Cosmos SDK concepts that are required for developing on CosmWasm with minimal Cosmos SDK knowledge.

## CosmWasm {#cosmwasm}

:::info
CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a
blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain,
without adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the gaiad binary,
called `wasmd`, so you can launch a new smart-contract enabled blockchain out of the box, using documented and tested
tooling and the same security model as the Cosmos Hub.
:::

In short, CosmWasm is a smart contract module that can be used with Cosmos SDK.
It runs the [Web Assembly](https://webassembly.org/) (or Wasm) virtual machine, allowing
developers to create smart contracts in various languages. Currently, it supports
smart contracts written in Rust.

## How do the Cosmos SDK, CosmWasm, and Tendermint fit together?


```

                ^  +-------------------------------+  ^
                |  |                               |  |
                |  |  State-machine = Application  |  |
                |  |                               |  |   Built with Cosmos SDK
                |  |            ^      +           |  |
                |  +----------- | ABCI | ----------+  v
                |  |            +      v           |  ^
                |  |                               |  |
Blockchain Node |  |           Consensus           |  |
                |  |                               |  |
                |  +-------------------------------+  |   Tendermint Core
                |  |                               |  |
                |  |           Networking          |  |
                |  |                               |  |
                v  +-------------------------------+  v

```

The Cosmos SDK is built on top of [Tendermint
Core](https://docs.tendermint.com/), which handles the low-level infrastructure
of maintaining a blockchain (e.g., transacting, consensus). It interacts with the
Cosmos SDK via the ABCI, or Application Blockchain Interface. Blockchain
full-nodes run this entire Cosmos SDK and Tendermint "stack" to replicate the
blockchain and validate transactions.

```

                                      +
                                      |
                                      |  Transaction relayed from the full-node's
                                      |  Tendermint engine to the node's application
                                      |  via DeliverTx
                                      |
                                      |
                +---------------------v--------------------------+
                |                 APPLICATION                    |
                |                                                |
                |     Using baseapp's methods: Decode the Tx,    |
                |     extract and route the message(s)           |
                |                                                |
                +---------------------+--------------------------+
                                      |
                                      |
                                      |
                                      +---------------------------+
                                                                  |
                                                                  |
                                                                  |  Message routed to
                                                                  |  the correct module
                                                                  |  to be processed
                                                                  |
                                                                  |
+----------------+  +---------------+  +----------------+  +------v----------+
|                |  |               |  |                |  |                 |
|  AUTH MODULE   |  |  BANK MODULE  |  | STAKING MODULE |  |   CosmWasm      |
|                |  |               |  |                |  |                 |
|                |  |               |  |                |  | Executes smart  |
|                |  |               |  |                |  | contract code   |
|                |  |               |  |                |  |                 |
+----------------+  +---------------+  +----------------+  +------+----------+
                                                                  |
                                                                  |
                                                                  |
                                                                  |
                                       +--------------------------+
                                       |
                                       | Return result to Tendermint
                                       | (0=Ok, 1=Err)
                                       v


```

Transactions are passed from the ABCI to the application, which in turn routes them to *modules* responsible for performing application logic. CosmWasm is a module running the WebAssembly virtual machine.

Compared to CosmWasm smart contracts, Cosmos SDK native modules are slightly
faster due to the lack of virtualization. However, virtualization comes with its
own benefits. Smart contracts can be swapped when the chain is running, whereas
restarts are required for native modules. Also, thanks to the flexible Wasm
virtual machine, CosmWasm contracts can be written in Rust (and someday other
languages as well).

