---
title: CosmWasm Documentation
description: CosmWasm is a new smart contracting platform built for the cosmos ecosystem.
footer:
  newsletter: false
aside: true
---

# CosmWasm Documentation

CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard of it, please [check out this intro](https://blog.cosmos.network/announcing-the-launch-of-cosmwasm-cc426ab88e12). The purpose of this documentation is to give a deep dive into the technology for developers who wish to try it out or integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos-SDK, as well as Rust developers looking for a blockchain platform. {synopsis}

CosmWasm was originally [prototyped by Team Gaians](https://github.com/cosmos-gaians/cosmos-sdk/tree/hackatom/x/contract) at the [Berlin Hackatom 2019](https://blog.cosmos.network/cosmos-hackatom-berlin-recap-4722882e7623). In particular, [Aaron Craelius](https://github.com/aaronc) came up with the architecture, especially avoiding reentrancy, [Jehan Tremback](https://github.com/jtremback) led the rust coding, and [Ethan Frey](https://github.com/ethanfrey) led the go side of the implementation. After the successful prototype, the [Interchain Foundation](https://interchain.io/) provided a grant to [Confio](http://confio.tech) to implement a robust version that would work in an adversarial environment. This article introduces developers to the output of that grant work, and lays out possible future directions.

## Aside Title

To demonstrate that headers can add title to `ON THIS PAGE`. 👉