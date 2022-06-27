---
id: cw20-escrow
sidebar_position: 3
title: CW20 Escrow
---

# CW20 Escrow

Source code is at [cw20-escrow](https://github.com/CosmWasm/cw-tokens/tree/main/contracts/cw20-escrow).


This is an escrow meta-contract that allows multiple users to create independent escrows. Each escrow has a sender,
recipient, and arbiter. It also has a unique id (for future calls to reference it)
and an optional timeout.

The basic function is the sender creates an escrow with funds. The arbiter may at any time decide to release the funds
to either the intended recipient or the original sender (but no one else), and if it passes with optional timeout,
anyone can refund the locked tokens to the original sender.

We also add a function called "top_up", which allows anyone to add more funds to the contract at any time.

## Token types {#token-types}

This contract is meant not just to be functional, but also to work as a simple example of an cw20 "Receiver". And
demonstrate how the same calls can be fed native tokens (via typical `ExecuteMsg` route), or cw20 tokens (via `Receiver`
interface).

Both `create` and `top_up` can be called directly (with a payload of native tokens), or from a cw20 contract using
the `Receiver` interface. This means we can load the escrow with any number of native or cw20 tokens (or a mix), allow of which get released when the arbiter decides.
