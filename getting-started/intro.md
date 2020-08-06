---
title: First Contract
order: 1
---

# Your First Contract

Buckle up, we will now get first-hand experience with CosmWasm,
by starting up our own CosmWasm-enabled blockchain (just one node for now), modifying
an existing contract, deploying it to our system, and executing it via the cli. If you are more *research first then get your hands dirty second* person, you should go ahead to [Architecture](../architecture/multichain.md) read it first and then head back here.

To make things a bit more interesting, we will demonstrate modifying the example
escrow contract and adding a backdoor to it. It exposes an identical API to the 
original one, but has one hidden command added. This also shows the importance of
verifying the source code behind any contract you run.

This is designed for programmers who are comfortable with the command-line and using
Linux or MacOS. It is helpful to have a basic understanding
of Rust and Go, but we will lead you through, so fast learners need no prior knowledge.
The [next tutorial, name service](../tutorials/name-service/intro) will assume knowledge of these basics.
If you know Rust and have worked on a Cosmos SDK app before, you can skip right to name service.
For others, best to go through this one first.

## Sections

[Smart Contracts](./smart-contracts) to read about design of the smart contract engine provided by CosmWasm. You will understand the architecture and how to design your contracts, as well as the security design of the system.

[Using the SDK](./using-the-sdk) for those who have no prior experience with the Cosmos SDK will get you up and running with the basics of using a Cosmos SDK based blockchain. By the end, You will be able to compile a chain from source and launch a local devnet.

[Rust Basics](./rust-basics) is for those with little to no prior experience with Rust. It is no crash-course in the language, but enough to get you compiling (and editing) the example contracts and pointers on where to dig deeper into the language.

[Editing a Contract](./editing-escrow-contract) will apply your (newly acquired) Rust skills to make some changes to a sample contract.

[Deploying to Testnet](./first-demo) is a simple demo that builds on the above sections and walks you through, step by step, taking your custom contract, deploying it to a testnet, and executing it. This will show you not just the internals of the contract, but how to use it from the outside.

[Verifying Contracts](./verify.md) shows how to verify smart contracts you pulled cryptographically, in a decentralised manner.

[Reviewing Contracts](./reviews.md) takes the section above to one more level further: review, audit contracts and publish signatures that enables contract verification and contribute to the security and trustability of CW contracts.

## Video Version

The coding sections for smart contracts are also available as a [series of videos, leading you through the code structure](https://vimeo.com/showcase/6671477).
