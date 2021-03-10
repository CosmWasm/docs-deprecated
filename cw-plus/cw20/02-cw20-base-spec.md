---
title: cw20-base Spec
order: 2
---

# CW20 Basic

This is a basic implementation of a cw20 contract. It implements
the [CW20 spec](01-spec.md) and is designed to
be deployed as is, or imported into other contracts to easily build
cw20-compatible tokens with custom logic.

Implements:

- [x] CW20 Base
- [x] Mintable extension
- [x] Allowances extension

## Importing this contract

You can also import much of the logic of this contract to build another
ERC20-contract, such as a bonding curve, overriding or extending what you
need.

Basically, you just need to write your handle function and import
`cw20_base::contract::handle_transfer`, etc and dispatch to them.
This allows you to use custom `HandleMsg` and `QueryMsg` with your additional
calls, but then use the underlying implementation for the standard cw20
messages you want to support. The same with `QueryMsg`. You *could* reuse `init`
as it, but it is likely you will want to change it. And it is rather simple.
