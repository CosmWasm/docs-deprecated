---
id: query
title: Querying Contract State
sidebar_label: Querying
---

There are many cases where you want to view the state of a contract. Both as an external client (using the cli), but also while executing a contract. For example, we discussed resolving names like "Alice" or "Bob" in the last section, which would require a query to another contract. We will first cover the two types of queries - raw and custom - then look at the semantics of querying both externally, as well from within a contract. We will pay special attention not only to how it works practically, but also the design and security issues of executing queries from one contract to another.

**Note**: queries are only partially implemented in v0.5.2, but this design will be valid from the v0.6 release onward

## Raw Queries

This is just loading binary value given a binary key (and the contract address). This can be handled by the `wasmd` binary as it has full access to the data storage, and no custom processing is needed.

TODO

## Custom Queries

We don't want to couple tightly to *implementation* but rather an *interface*.

TODO

Gas costs

## External Queries

TODO - how this works in abci in general

Fixed gas limit (explain) - app.yaml?

## Contract to Contract Query

Example - name lookup, check kyc

- issues with actor model (external state)
- semantics same as external -> use recent snapshot
- reentrancy
- gas cost and recursion limits

## Queries over IBC

- explain how this could be extended to IBC