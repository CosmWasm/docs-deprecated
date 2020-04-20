---
id: composition
title: Contract Composition
sidebar_label: Contract Composition
---

Given the [Actor model](./actor) of dispatching messages, and [synchronous queries](./query) implemented in CosmWasm v0.8, we have all the raw components
to enable arbitrary composition of contracts with both other contracts and native modules. Here will will explain
how the components fit together and how they can be extended.

## Terminology

For the remainder of this article, I will make a key distinction between "Contracts" and "Native Modules". "Contracts" are CosmWasm code that is
dynamically uploaded to the blockchain at a given address. This can be added after the fact and is not tied to any runtime implementation.
"Native Modules" are basically Go Cosmos-SDK modules, which are compiled into the blockchain binary. These are relatively static (requiring a
soft or hard fork to be added or modified) and will differ between different blockchains running CosmWasm.

We support composition between both types, but we must look more deeply at the integration with "Native Modules", as using those can
cause [Portability](#Portability) issues. To minimize this issue, we provide some abstractions around "Modules"

## Messages

Both `init` and `handle` can return an arbitrary number of
[`CosmosMsg`](https://github.com/CosmWasm/cosmwasm/blob/08717b4c589bbfe59f44bb8cccffb08f63696413/packages/std/src/init_handle.rs#L11-L31)
objects, which will be re-dispatched in the same transaction (and thus atomic success/rollback with the contract).
The two fundamental transactions are:

* `Contract` - This will call a given contract address with a given message (provided in serialized form).
* `Opaque` (rename to `Native`?) - This will provide a message to the native blockchain to execute. It must be encoded in the blockchain native format.

However, `Native` calls are very fragile due to issues with both [Portability](#Portability) and [Immutability](#Immutability), and should generally be avoided.
Thus, we provide some standard notations to call into native modules using well-defined *portable* and *immutable* interfaces. Currently, these are not very
*Extensible* as we need to update `cosmwasm_std`, `go-cosmwasm` and `wasmd` to enable them.

The two main uses of `Native` messages are (1) to allow a contract to "re-dispatch" a client created message. Such as enabling a multisig contract to
sign and approve any message a client can create. or (2) allow developers to test out new functionality in dev mode, before the interfaces are finalized
in a new release. In order to allow safer use of `Native` messages, we provide some standardized [Module interfaces](#Modules).

## Queries

As of CosmWasm v0.8, we now allow the contracts to make synchronous *read-only* queries to the surrounding runtime.

We support both "Contract" queries as well as calls to "Native Modules" via Module interfaces. We do not (currently) support
raw native queries, as the contract needs to make sense of these (not just re-dispatch) and this seems only useful in dev-mode.
(Simon: should we add this for completeness??)

Cross-Contract queries take the address of the contract and a serialized `QueryMsg` in the contract-specific format, and synchronously get
a binary serialized return value in the contract-specific format. It is up to the calling contract to understand the appropriate formats.
In order to simplify this, we can provide some contract-specific type-safe wrappers, much in the way we provide a simple 
[`query_balance`](https://github.com/CosmWasm/cosmwasm/blob/08717b4c589bbfe59f44bb8cccffb08f63696413/packages/std/src/traits.rs#L95-L105)
method as a wrapper around the `query` implementation provided by the Trait.

In order to allow safer use of `Native` queries, we provide some standardized [Module interfaces](#Modules).

## Modules

In order to enable better integrations with the native blockchain, we are providing a set of module interfaces. The most basic one
is to the `Bank` module, which provides access to the underlying native tokens. This gives us `CosmosMsg::Send` as well as
`QueryRequest::Balance` and `QueryRequest::AllBalances` to check balances and move tokens. Beyond this, we are working with
blockchains that have concrete use-cases.

In that sense, we are [working on a PR](https://github.com/CosmWasm/cosmwasm/pull/211) to add support for Terra's use cases.
In particular to the general `staking` module, as well as Terra-specific `swap`, `oracle` and `treasury` modules.  (TODO: update when
integration is done).

This provides a clean design, where one can develop a contract that eg. issues staking derivatives using the `staking` module interface,
and have confidence that that same contract will run on two different blockchains, even if they are both heavily customized and one is
on Cosmos SDK 0.38 and the other on Cosmos SDK 0.39 (with many breaking changes). The downside here is that every module interface must
be added to all layers of the stack, which provides some delay to supporting custom features, and we cannot easily add support for every custom
module in every Cosmos SDK-based blockchain.

That said, we highly recommend using the module interface when possible, and adding PRs to extend it when it doesn't support your case yet.

Note, that theoretically these modules can also be implemented by contracts. Eg. if the blockchain has no native `swap` module, we could upload
a UniSwap-inspired contract and register that somehow with the Go blockchain. Then the blockchain would know to take the swap message and
dispatch it to this custom contract. (Note that this is not implemented at all, just an idea of future directions).

## Design Considerations

In producing a solid design, we want the API to fulfill all these requirements (or strike a good balance if truly impossible to achieve them all):

### Portability

The same contract should run on two distinct blockchains, with differing custom modules, different versions of the Cosmos SDK, or ideally, even
based on different frameworks (eg. running on Substrate).

### Immutability

Contracts are immutable and encode the query and message formats in their bytecode. If the format of native messages change, then the contracts
break. This may mean that a staking module could never undelegate the tokens. If you think this is a theoretical issue, please note that every major
update of the Cosmos SDK has produced such breaking changes and migrations for them. Migrations that cannot be performed on immutable contracts.
We need to ensure that our design provides an immutable API to a potentially mutable runtime.

### Extensibility

We should be able to add new interfaces to a contract and blockchain without needing to update any of the intermediate layers. That is,
if you are building a custom `superd` blockchain app, which imports `x/wasm` from `wasmd`, and want to develop contracts on it that
call into your custom `superd` modules, then in an ideal world, you could add those message types to an additional `cw-superd` library
that you can import in your contracts and add the callbacks to them in `superd` Go code. *Without any changes* in `cosmwasm-std`, `cosmwasm-vm`,
`go-cosmwasm`, or `wasmd` repositories (which have a different release cycle than your app).

We are not their yet, and only raw `Native` calls are fully extensible, but we are working towards such possibilities.

## Usability

We also want to make it not just secure and *possible* to compose contracts into a larger whole, but make it simple from the developer's perspective.
This applies to both the contract authors, as well as the blockchain developers integrating CosmWasm into their custom blockchain.

### Checking for Support

If we want to call some extensions, say to `Staking` or `Swap` modules, we can compile our contract to handle that. But how do we detect if the blockchain
can support it? We want to fail on upload or instantiation of a contract, and not discover some key functionality doesn't work on this chain,
when there is value stored in the contract.

Current idea that the contract make a query call on `init` (or return in `InitResponse`) all list of module interfaces it requires to work
correctly. The runtime should return an error (and abort/rollback) the contract instantiation if it doesn't support all those module interfaces.

TODO: other ideas??

### Type-Safe Wrappers

When querying or calling into other contracts, we give up all the type-checks we get with native module interfaces.
They require the caller to know the details of the caller. This is the same as Ethereum. However, we can provide some "interface"
wrappers that a contract could export, such that other contracts can easily call into it.

For example:

```rust
pub struct NameService(CanonicalAddr);

impl NameService {
    pub fn query_name(deps: &Extern, name: &str) -> CanonicalAddr { /* .. */ }
    pub fn register(api: &Api, name: &str) -> CosmosMsg { /* .. */ }
}
```

Rather than storing just the `CanonicalAddr` of the other contract in our configuration, we could store `NameService`, which is
a zero-cost "newtype" over the original address, with the same serialization format. However, it would provide us
some type-safe helpers to make queries against the contract, as well as produce `CosmosMsg` for registration.