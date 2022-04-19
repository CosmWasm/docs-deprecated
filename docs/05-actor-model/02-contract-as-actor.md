---
title: Contract as an Actor
---

# Contract as an Actor

Previously I explained an Actor model employed by CosmWasm in abstraction of any
code. Not it is time to look at some Rust to figure out how this whole idea maps
to structure of Smart Contract.

Small disclaimer - this is not a Rust tutorial, and I assume some basic Rust
knowledge. I will not introduce any high-level idioms or constructions, but
I will not explain what structure is. If you don't think confident about
reading Rust documentation, maybe you should start with some basic Rust
introduction.

On the other hand - I don't expect any knowledge about blockchain or writing
smart contracts. Everything related to Smart Contracts would be explained.

## Entry points {#entry}

Wasm smart contract is a binary. Traditionally if you write some application,
you have your main function, like this:

```rust
fn main() {
    println!("Hello world!");
}
```

This works, because your Operating System knows, that when it runs your application
it should call this function at the very beginning.

It is very similar for Smart Contracts, except there are many entry points, and
they look differently. The reason for that is, that the smart contract binary
is not executet directly by OS, but by a virtual machine, and it has it's own
rules on calling entry points. Here is a list of entry points for CosmWasm contracts:

```rust
use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Response, Binary, Reply};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, String> {
    todo!()
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, String> {
    todo!()
}

#[entry_point]
pub fn reply(
    deps: Deps,
    env: Env,
    msg: Reply,
) -> Result<Response, String> {
    todo!()
}

#[entry_point]
pub fn query(
    deps: Deps,
    env: Env,
    msg: QueryMsg,
) -> Result<Binary, String> {
    todo!()
}

#[entry_point]
pub fn migrate(
    deps: Deps,
    env: Env,
    msg: MigrateMsg,
) -> Result<Response, String> {
    todo!()
}

#[entry_point]
pub fn sudo(
    deps: Deps,
    env: Env,
    msg: SudoMsg,
) -> Result<Response, String> {
    todo!()
}
```

That seems a lot, but I have a good new - you don't need to implement all of
those. Actually most contracts are implementing only three of those: `instantiate`,
`execute`, and `query`. For now let go though them to understand what actions are
those entry points represent.

## `Execute` {#execute}

Execute is the most important entry point of CosmWasm contracts. It is one which
is called when execution message is send to the contract, and the main entry point
to invoke any actions. In context of previous part, most actions would be implemented
by this one. So when we say "Contract cw20 handles `Transfer` message", we probably
mean, that `Transfer` message is handled properly by `execute` endpoint. How different
messages are actually handled by single entry point will be explained in a moment,
when I will describe arguments to this function.

So now let's go look at elements of the signature one by one to understand what
happens here a bit better.

### Entry point attribute

```rust
#[entry_point]
```

`entry_point` attribute is not actually related to actor model, but I want to quickly
cover it to not leave empty wholes anywhere. It is seen in every single entry point,
and it is actually a procedural macro performing some magic to create bridge
between Wasm runtime, and high-level Rust code. The reson of its existence is, that
runtime executing Smart Contract has no idea about Rust typesystem or borrow checker,
so every argument is passed by a pointer. Without that, the signature of an entry
point would look like:

```rust
#[no_mangle]
extern "C" fn execute(env_ptr: u32, info_ptr: u32, msg_ptr: u32) -> u32 {
    todo!()
}
```

and all of those `u32` are actually pointers to some arbitrary structures! Not
funny at all, and implementing this would require lot of unsafety. Therefore
CosmWasm introduced this `entry_point` macro, which generates the "proper"
entry point handling all the hacky things, and calling your function at the and.
This is also a reason, why your entry points have to be public (or at least -
`pub(crate)`) so it can be called from generated submodule.

It is worth noting, that in most cases instead of just `#[entry_point]`, you will
see something like that:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
```

It looks a bit scarry, but it is actually pretty simple idea. It is
[conditional compilation](https://doc.rust-lang.org/reference/conditional-compilation.html#the-cfg_attr-attributehttps://doc.rust-lang.org/reference/conditional-compilation.html#the-cfg_attr-attribute)
attribute, and it allows us to include the `entry_point` attribute if and only
if crate is compiled without the `library`
[feature](https://doc.rust-lang.org/cargo/reference/features.html). It is needed,
because in output binary there can be only single entry point of every type
(basically because of required `#[no_mangle]` attribute on it, so if we want to
use another smart contracts in dependencies, we need a way to disable
generation of entry points.

### `DepsMut`, `Env`, and `MessageInfo`

Now take a look at arguments of our `execute` entry point. As you may notice
first three arguments are imported from
[cosmwasm-std](https://crates.io/crates/cosmwasm-std) crate, and the fourth
one is kind of misterious - I would talk about it in a minute.

The first argument is a
[DepsMut](https://docs.rs/cosmwasm-std/0.16.7/cosmwasm_std/struct.DepsMut.html)
Looking at documentation we can see, that this is actually very thin wrapper
for three other objects:
* [Storage](https://docs.rs/cosmwasm-std/0.16.7/cosmwasm_std/trait.Storage.html)
  which is used to interact (both read and write) with the contract state.
* [Api](https://docs.rs/cosmwasm-std/0.16.7/cosmwasm_std/trait.Api.html)
  which purpose is to provide some utility functionality like address
  validation or ssh verification
* [QuerierWrapper](https://docs.rs/cosmwasm-std/0.16.7/cosmwasm_std/struct.QuerierWrapper.html)
  which help us looking at another contracts state - both by querying them with
  Smart Queries, or looking directly at their storage with Raw Queries.

So the `DepsMut` object is basically utility for interact with outer world of
blockchain, and it is used by basically every single contract, as it is the
only way to update its internal state - and as we learned previously, it is
the main way to manifest its existence.

Next in the queue is the
[Env](https://docs.rs/cosmwasm-std/0.16.7/cosmwasm_std/struct.Env.html) object.
This one is the meta-info object containing information about current blockchain
execution state. Here you can take a look at timestamp of the execution, blokchain
height (number of block in it), and address of executed contract.

The last one is
[MessageInfo](https://docs.rs/cosmwasm-std/0.16.7/cosmwasm_std/struct.MessageInfo.html).
This one is also meta-info object, but this time it describes information about
message which triggered execution. The most important field here is the `sender`
which tells which contract (or non-contract user) send the message. Another one,
`funds` tells how much native tokens were send with executed message. For now
I will completely ignore the existence of this one - in practice it may be very
usefull, for example if you want to make some actions to be paid ones (you
can check if proper paiment was send with message), but handling tokens transfer
is another topic and it deserves its own tutorial.

