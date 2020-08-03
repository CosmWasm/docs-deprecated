---
title: Contract Composition
order: 7
---

# Contract Composition

Given the [Actor model](./actor) of dispatching messages, and [synchronous queries](./query) implemented in CosmWasm v0.8, we have all the raw components
to enable arbitrary composition of contracts with both other contracts and native modules. Here we will explain how the components fit together and how they can be extended.

**Note** The text below applies to CosmWasm 0.8, release May 25, 2020. Please upgrade if you wish to take advantage of the power of composition.

## Terminology

For the remainder of this article, I will make a key distinction between "Contracts" and "Native Modules". "Contracts" are CosmWasm code that is
dynamically uploaded to the blockchain at a given address. This can be added after the fact and is not tied to any runtime implementation.
"Native Modules" are basically Go Cosmos-SDK modules, which are compiled into the blockchain binary. These are relatively static (requiring a
soft or hard fork to be added or modified) and will differ between different blockchains running CosmWasm.

We support composition between both types, but we must look more deeply at the integration with "Native Modules", as using those can
cause [Portability](#portability) issues. To minimize this issue, we provide some abstractions around "Modules"

## Messages

Both `init` and `handle` can return an arbitrary number of
[`CosmosMsg`](https://github.com/CosmWasm/cosmwasm/blob/08717b4c589bbfe59f44bb8cccffb08f63696413/packages/std/src/init_handle.rs#L11-L31)
objects, which will be re-dispatched in the same transaction (thus providing atomic success/rollback with the contract execution).
There are 3 classes of messages:

* `Contract` - This will call a given contract address with a given message (provided in serialized form). It assumes the caller has access to the API format.
* [Module interfaces](#modules) - These are standardized interfaces that can be supported by any chain to expose native modules under a *portable* interface.
* [`Custom`](#customization) - This encapsulates a chain-dependent extension to the message types to call into custom native modules. Ideally they should be *immutable* on the same chain over time, but they make no portability guarantees.

## Queries

As of CosmWasm v0.8, we now allow the contracts to make synchronous *read-only* queries to the surrounding runtime.
As with [Messages](#messages), we have three fundamental types:

* `Contract` - This will query a given contract address with a given message (provided in serialized form). It assumes the caller has access to the API format.
* [Module interfaces](#modules) - These are standardized interfaces that can be supported by any chain to expose native modules under a *portable* interface.  
* [`Custom`](#customization) - This encapsulates a chain-dependent extension to to query custom native modules. Ideally they should be *immutable* on the same chain over time, but they make no portability guarantees.

Cross-Contract queries take the address of the contract and a serialized `QueryMsg` in the contract-specific format, and synchronously get
a binary serialized return value in the contract-specific format. It is up to the calling contract to understand the appropriate formats.
In order to simplify this, we can provide some contract-specific type-safe wrappers, much in the way we provide a simple
[`query_balance`](https://github.com/CosmWasm/cosmwasm/blob/08717b4c589bbfe59f44bb8cccffb08f63696413/packages/std/src/traits.rs#L95-L105)
method as a wrapper around the `query` implementation provided by the Trait.

## Modules

In order to enable better integrations with the native blockchain, we are providing a set of standardized module interfaces
that should work consistently among all CosmWasm chain. The most basic one
is to the `Bank` module, which provides access to the underlying native tokens. This gives us `BankMsg::Send` as well as
`BankQuery::Balance` and `BankQuery::AllBalances` to check balances and move tokens. 

The second standardized module is `staking`, which provides some standardized messages for `Delegate`, `Undelegate`,
`Redelegate` and `Withdraw`, as well as querying `Validators` and `Delegations`. These interfaces are designed to support
most PoS systems and able to be supported on any PoS system, not just with the current staking module of the Cosmos SDK.
(So, if you fork that for your chain, the contracts should still work).

This provides a clean design, where one can develop a contract that eg. issues staking derivatives using the `staking` module interface,
and have confidence that that same contract will run on two different blockchains, even if they are both heavily customized and one is
on Cosmos SDK 0.38 and the other on Cosmos SDK 0.39 (with many breaking changes). The downside here is that every module interface must
be added to all layers of the stack, which provides some delay to supporting custom features, and we cannot easily add support for every custom
module in every Cosmos SDK-based blockchain.

That said, we highly recommend using the module interface when possible, and using [custom types](#customization) as a temporary measure
to keep a fast release cycle. We are happy to work with projects with concrete use cases that can be re-used between many different chains
to add new standardized module interfaces. Perhaps for governance, or for IBC/light client related features.

Note, that theoretically these module interfaces can also be implemented by contracts, not just native code.
Eg. if we made a standard `swap` interface, and your blockchain has no native `swap` module, we could upload a UniSwap-inspired contract
and register that somehow with the Go blockchain. Then the blockchain would know to take the swap message and dispatch it to this custom contract.
(Note that this is not implemented at all, just an idea of future directions).

## Customization

Many chains will want to allow contracts to execute with their custom go modules, without going through all the work to try to turn it into a standardized [Module Interface](#modules) and wait for a new CosmWasm release. For this case, we introduce the `Custom` variant on both `CosmosMsg` and `QueryRequest`.
The idea here is that the contract can define the type to be include in the `Custom` variants, and it just needs to be agreed upon by the Cosmos SDK app
(in Golang) on the other side. All the code between the contract and the blockchain codec treats it as opaque json bytes.

The demo "reflect" contract in the standard CosmWasm repo,
[shows how to use `CustomMsg` and `CustomQuery`](https://github.com/CosmWasm/cosmwasm/blob/71f643f577184a23b2f1f122531c944f0de94c34/contracts/reflect/src/msg.rs#L30-L64). You can see how the contract [uses a `CustomQuery`](https://github.com/CosmWasm/cosmwasm/blob/master/contracts/reflect/src/contract.rs#L94-L101)
to call out to some "runtime-provided" code. For unit tests, we can [mock out the runtime querier](https://github.com/CosmWasm/cosmwasm/blob/master/contracts/reflect/src/testing.rs#L20-L37), but in a deployed system, this should be provided by native Go code in your Cosmos-SDK application.

Beyond trivial cases, we are working with Terra to expose their `swap`, `oracle` and `treasury` modules to CosmWasm contracts on their chains.
These features need to be exposed in an immutable format that will work forever on their chain, but there is no need for portability.
More interesting is the ability to quickly expose new features of their native modules to contracts on their chain. In fact, this concrete use
case inspired all the refactoring to make sure custom messages and queries possible.

## Design Considerations

In producing a solid design, we want the API to fulfill all these requirements (or strike a good balance if truly impossible to achieve them all):

### Portability

The same contract should run on two distinct blockchains, with differing Golang modules, different versions of the Cosmos SDK, or ideally, even
based on different frameworks (eg. running on Substrate). This should be possible when avoiding `Custom` messages, and checking the optional features one uses.
The features are currently `staking`, which assumes a PoS system, and `iterator`, which assumes we can do prefix scans over the storage (ie. it is a Merkle **Tree**, not a Merkle **Trie**).

### Immutability

Contracts are immutable and encode the query and message formats in their bytecode. If we allowed dispatching `sdk.Msg` in the native format
(be it json, amino or protobuf), and the format of native messages change, then the contracts would break. 
This may mean that a staking module could never undelegate the tokens. If you think this is a theoretical issue, please note that every major
update of the Cosmos SDK has produced such breaking changes and has migrations for them. Migrations that cannot be performed on immutable contracts.
Thus, we need to ensure that our design provides an immutable API to a potentially mutable runtime, which is a primary design criteria when
designing the standard [module interfaces](#modules).

### Extensibility

We should be able to add new interfaces to a contract and blockchain without needing to update any of the intermediate layers. That is,
if you are building a custom `superd` blockchain app, which imports `x/wasm` from `wasmd`, and want to develop contracts on it that
call into your custom `superd` modules, then in an ideal world, you could add those message types to an additional `cw-superd` library
that you can import in your contracts and add the callbacks to them in `superd` Go code. *Without any changes* in `cosmwasm-std`, `cosmwasm-vm`,
`go-cosmwasm`, or `wasmd` repositories (which have a different release cycle than your app).

We provide the [`Custom`](#customization) variants to `CosmosMsg` and `QueryRequest` to enable such cases. They can provide immutability but not
portability.

## Usability

We also want to make it not just secure and *possible* to compose contracts into a larger whole, but make it simple from the developer's perspective.
This applies to both the contract authors, as well as the blockchain developers integrating CosmWasm into their custom blockchain.
And we want to make it easy to build client side applications using the contracts.

We are using JSON encoding for the CosmWasm messages to make this simple and export [JSON schemas](https://github.com/CosmWasm/cosmwasm-examples/tree/master/erc20/schema) for every contract to allow auto-generation of client-side codecs. We also provide [CosmJS](https://github.com/CosmWasm/cosmjs)
as a easy-to-use TypeScript client library allowing access to all contracts (and bank module) on a CosmWasm-based chain.

### Checking for Support

If we want to call some extensions, say to the `Staking` modules, we can compile our contract to handle that. But how do we detect if the blockchain
can support it? We want to fail on upload or instantiation of a contract, and not discover some key functionality doesn't work on this chain,
when there is value stored in the contract.

The design decision was to you use feature flags, exposed as wasm export functions, to configure which extra features are required by the contract.
This lets the host chain inspect compatibility before allowing an upload. To do so, we make some "ghost" exports like
`requires_staking()` or `requires_terra()`. This would only pass compatibility check if the runtime also exposed such features.
When instantiating `x/wasm.NewKeeper()` you can specify which features are supported.

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
a zero-cost ["newtype"](https://doc.rust-lang.org/stable/rust-by-example/generics/new_types.html)
over the original address, with the same serialization format. However, it would provide us
some type-safe helpers to make queries against the contract, as well as produce `CosmosMsg` for registration.

Note that these type-safe wrappers are not tied to an *implementation* of a contract, but rather the contract's *interface*.
Thus, we could create a small library with a list of standard/popular interfaces (like the ERCxxx specs) represented with such
"newtypes". A contract creator could import one of these wrappers and then easily call the contract, regardless of implementation,
as long as it supported the proper interface