---
order: 1
---

# Your First Contract

Buckle up, we will now get first-hand experience with CosmWasm, by starting up our own
CosmWasm-enabled blockchain (just one node for now), modifying an existing contract, deploying it to
our system, and executing it via the cli. If you are more *research first then get your hands dirty
second* person, you should go ahead to [Architecture](../architecture/multichain.md) read it first
and then head back here.

We will not dive into smart contract development in this section to provide an easy to digest
introduction. Also, you can follow the steps here to test out smart contracts live on a testnet
without drowning in smart contract development details. We will demonstrate setting up environment,
compiling, deploying, and interacting. Then to make things a bit more interesting, we will
show modifying the example escrow contract by adding a backdoor to it in the [Hijack Escrow
tutorial](../learn/hijack-escrow/intro.md). It exposes an identical API to the original one, but has
one hidden command added. This also shows the importance of verifying the source code behind any
contract you run.

This is designed for programmers who are comfortable with the command-line and using Linux or MacOS.
It is helpful to have a basic understanding of Rust and Go, but we will lead you through, so fast
learners need no prior knowledge. The [next tutorial, name service](../learn/name-service/intro)
will assume knowledge of these basics. And it will show all the development flow from 0 to
production.

## Sections

[Installation](./installation) will show you how to setup the required software tooling for
CosmWasm.

[Setting up Environment](./setting-env) will show you how to setup the client environment,
interacting with faucet.

[Downloading and Compiling Contract](./compile-contract) will demonstrate downloading and compiling
smart contract code to wasm byte code.

[Interacting with Contracts](./interact-with-contract) will show deploying, initializing and
executing smart contracts.

[Next Steps](./next-steps.md) is the last part of the tutorial that wraps up and sails you to the
next dock, meaning new learning resources.

## Video Version

The coding sections for smart contracts are also available as a [series of videos, leading you
through the code structure](https://vimeo.com/showcase/6671477).
