---
title: Spec
order: 1
---

# CW1 Spec: Proxy Contracts

[CW1](https://github.com/CosmWasm/cosmwasm-plus/tree/master/packages/cw1) is a specification for proxy contracts based on CosmWasm.
It is a very simple, but flexible interface designed for the case
where one contract is meant to hold assets (or rights) on behalf of
other contracts.

The simplest example is a contract that will accept messages from
the creator and resend them from it's address. Simply by making this
transferable, you can then begin to transfer non-transferable assets
(eg. staked tokens, voting power, etc).

You can imagine more complex examples, such as a "1 of N" multisig,
or conditional approval, where "sub-accounts" have the right to spend
a limited amount of funds from this account, with a "admin account"
retaining full control.

The common denominator is that they allow you to immediately
execute arbitrary `CosmosMsg` in the same transaction.
