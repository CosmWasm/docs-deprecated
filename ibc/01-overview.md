---
title: IBC And CosmWasm
order: 1
---

# IBC And CosmWasm

The inter-blockchain communication protocol ([IBC](https://ibcprotocol.org/)) is an end-to-end, connection-oriented,
stateful protocol for reliable, ordered, and authenticated communication between heterogeneous blockchains arranged
in an unknown and dynamic topology. The protocol realises this by specifying a set of data structures, abstractions,
and semantics that can be implemented by any distributed ledger provided they satisfy a small set of requirements.

:::tip
For inner workings of IBC, head to [cosmos/ics](https://github.com/cosmos/ics) specifications and
start reading from [ics1](https://github.com/cosmos/ics/tree/master/spec/ics-001-ics-standard).
:::

CosmWasm supports IBC protocol **out of the box** and adds power of smart contracts on top.
CosmWasm relies on **Dynamic IBC** protocol which differs from
[Interchain standards](https://github.com/cosmos/ics#ibcapp)(currently ics20 and interchain accounts).
This term is coined and proposed by [Agoric](https://medium.com/agoric/the-road-to-dynamic-ibc-4a43bc964bca), and the
communication protocol and scheme is defined by the contracts. Contract should specify the actions taken during an
IBC handshake.

## Index

* [Relayer](02-relayer.md) section explains the relayer component of IBC and demonstrates setting up one for
  connecting CosmWasm enabled chains.

* [Active IBC Connections section](03-active-connections.md) has a list of remote testnet network connections that you
  can use for testing and learning.

* [cw20-ics](04-cw20-ics20.md) is a smart contract that is first of its kind. This is an IBC Enabled contract that
  allows us
  to send CW20 tokens from one chain over the standard ICS20 protocol to the bank module of another chain. In short,
  it let's us send our custom CW20 tokens with IBC and use them just like native tokens on other chains.
