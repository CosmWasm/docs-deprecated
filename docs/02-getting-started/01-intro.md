---
sidebar_position: 1
id: intro
---

# Your First Contract

What follows within the Getting Started section is a tour of the fundamental aspects of CosmWasm Smart Contracts. Although having a basic understanding of Rust and Go would be helpful, the content is intended for all learners, no matter their experience. The goal is to provide easy-to-follow instructions and to offer firsthand experience for first-time users by going through a step-by-step guide covering the topics below:

- Setting up environment
- Deploying a smart contract to the blockchain testnet
- Executing smart contract functions via the CLI
- Modifying an existing contract

In the case that you want to start your journey by getting an idea of what goes on behind the scenes or dive right into more detailed documentation first, you can jump straight to the [Architecture](/03-architecture/01-multichain.md) section for a quick overview before returning back here.

You might have noticed that developing smart contracts is not in the the scope of this section. The Getting Started section has deliberately been tailored to be as easy-to-follow as possible, avoiding the risk of getting tangled in the intricacies of smart contract development, which will be covered in other sections. 

Once we are finished with setting up environment, deploying a smart contract to the testnet and interacting with it, we will be modifying the example Escrow Contract by adding a backdoor in the [Hijack Escrow tutorial](/tutorials/hijack-escrow/intro) in order to make things a bit more interesting. The modification will expose an identical API to the original one, except for the addition of a single hidden command. The idea behind making such a modification is twofold; one, familiarizing ourselves with what constitutes a smart contract, and the other is to manifest the importance of verifying the source code behind any contract you interact with.

## Sections {#sections}

[Installing Prerequisites](02-installation.md) will show you how to setup the required software tooling for CosmWasm.

[Setting up Environment](03-setting-env.md) will show you how to setup the client environment, and interact with the
faucet.

[Downloading and Compiling a Contract](04-compile-contract.md) will demonstrate downloading and compiling smart contract
code into wasm byte code.

[Deployment and Interaction](05-interact-with-contract.md) will show you how to deploy a contract to the testnet, instantiate it and execute smart contract functions.

[Next Steps](06-next-steps.md) is the last part of the tutorial. It wraps up the Getting Started section and points you in the direction of further learning.

## Dev Academy

[Dev Academy](/dev-academy/intro) is a set of modular and step-by-step educational materials designed to
provide a quick start for anyone who wants to learn and get started with concepts like blockchain, smart contracts, DAOs and more. Dev Academy content can be used at workshops, university courses or at home. By the end, you will have a good understanding of many interesting topics including CosmWasm.

## Video Version {#video-version}

The coding sections for smart contracts are also available as
a [series of videos, leading you through the code structure](https://vimeo.com/showcase/6671477).
