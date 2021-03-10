---
title: cw721-base Spec
order: 2
---

# Cw721 Basic

cw721-basic source code: [https://github.com/CosmWasm/cosmwasm-plus/blob/master/contracts/cw721-base/README.md](https://github.com/CosmWasm/cosmwasm-plus/blob/master/contracts/cw721-base/README.md)

This is a basic implementation of a cw721 NFT contract. It implements
the [CW721 spec](01-spec.md) and is designed to
be deployed as is, or imported into other contracts to easily build
cw721-compatible NFTs with custom logic.

Implements:

- [x] CW721 Base
- [x] Metadata extension
- [ ] Enumerable extension (AllTokens done, but not Tokens - requires [#81](https://github.com/CosmWasm/cosmwasm-plus/issues/81))

## Implementation

The `HandleMsg` and `QueryMsg` implementations follow the [CW721 spec](01-spec.md) and are described there.
Beyond that, we make a few additions:

* `InitMsg` takes name and symbol (for metadata), as well as a **Minter** address. This is a special address that has full
  power to mint new NFTs (but not modify existing ones)
* `HandleMsg::Mint{token_id, owner, name, description, image}` - creates a new token with given owner and metadata. It can only be called by
  the Minter set in `init`.
* `QueryMsg::Minter{}` - returns the minter address for this contract.

It requires all tokens to have defined metadata in the standard format (with no extensions). For generic NFTs this may
often be enough.

The *Minter* can either be an external actor (eg. web server, using PubKey) or another contract. If you just want to customize
the minting behavior but not other functionality, you could extend this contract (importing code and wiring it together)
or just create a custom contract as the owner and use that contract to Mint.

## Importing this contract

You can also import much of the logic of this contract to build another
CW721-compliant contract, such as tradable names, crypto kitties,
or tokenized real estate.

Basically, you just need to write your handle function and import
`cw721_base::contract::handle_transfer`, etc and dispatch to them.
This allows you to use custom `HandleMsg` and `QueryMsg` with your additional
calls, but then use the underlying implementation for the standard cw721
messages you want to support. The same with `QueryMsg`. You will most
likely want to write a custom, domain-specific `init`.

For now, you can look at [`cw20-staking`](../cw20/06-cw20-staking-spec.md)
for an example of how to "inherit" cw20 functionality and combine it with custom logic.
The process is similar for cw721.

