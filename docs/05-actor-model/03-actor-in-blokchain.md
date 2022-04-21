---
title: Smart contract as an actor
---

# Smart contract as an actor

In previous chapters, we were talking about actor model and how is it
implemented in blockchain. Now it is time to look closer into typical
contract structure to understand how different features of actor model
are mapping to it.

This will not be step-by-step guide on contract creation, as it is topic
for series itself. It would be going through contract elements roughly to
visualise how to handle architecture in actor model.

## The state {#state}

As before we would start with the state. Previously we were working with
the `tg4-group` contract, so let's start by looking at its code. Go to
`cw-plus/contracts/cw4-group/src`. The folder structure should look like
this:

```bash
  src
├──  contract.rs
├──  error.rs
├──  helpers.rs
├──  lib.rs
├──  msg.rs
└──  state.rs
```

As you may already figure out, we want to check the `state.rs` first.

The most important thing here are couple constants: `ADMIN`, `HOOKS`,
`TOTAL`, and `MEMBERS`. Every one of such constant represents single
portion of contract state - as tables in databases. The types of
those constants represents what kind of table is this. The most
basic ones are `Item<T>`, which keeps zero or one element of given
type, and `Map<K, T>` which is key-value map.

You can see `Item` being used to keep an admin, and some other data:
`HOOKS`, and `TOTAL`. `HOOKS` is used by the `cw4-group` to allow
subscription to any changes to group - contract can be added as
a hook, so when group changes, message is send to it. The `TOTAL`
is just a sum of all members weights.

The `MEMBERS` in group contract is the `SnapshotMap` - as you can
imagine it is a `Map`, with some steroids - this particular one,
gives us access to state of the map at some point of history,
accessing it by the blockchain `height`. `height` is a number
of block created since the begging of blockchain, and it is
the most atomic time representation in smart contracts. There
is a way to access the clock time in them, but every thing happening
in single block is considered happening in the sime exact moment.

Another type of storage objects not used in group contract are:
* `IndexedMap` - another map type, which allow to access values
  by variety of keys
* `IndexedSnapshotMap` - `IndexedMap` and `SnapshotMap` married

What is very important - every state type in the contract is created
with some name. It is because to be fully precise, all of those
types are not containers in any meaning. They are just accessors
to state. Do you remember that I told you before, that blockchain is
our database? And that is correct! All those types are just ORM to
this database - when we will use them to get actual data from it,
we would pass special `State` object to them, so they can retrieve
items from it.

You may ask - why all those data for a contract are not auto-fetched
by whatever is running it? That is a good question. The reason is,
that we want contracts to be lazy with fetching. Copying data is
very expensive operation, and for everything happening on it, someone
has to pay - it is realized by gas cost. I told you before, that as
contract developer you don't need to worry about gas at all, but it
was only partially true. You don't need to know exactly how gas is
calculated, but by lowering your gas cost, you would may execution
of your contracts cheaper which is typically a good thing. One good
practice to achieve that, is to avoid fetching data you will not use
in particular call.

## Messages {#messages}

In blockchain contracts communicate with each other by some JSON
messages. They are defined in most contract in `msg.rs` file. Take
a look at it.

There are three types on it, let's go through them one by one.
First one is an `InstantiateMsg`. This is the one, which is send
on contract instantiation. It typically contains some data which
are needed to properly initialize it. In most cases it is just a
simple structure.

Then there are two enums: `ExecuteMsg`, and `QueryMsg`. They are
enums, because every single variant of them represents different
message which can be send. For example the `ExecuteMsg::UpdateAdmin`
corresponds to `update_admin` message we was sending previously.

Note, that all the messages are attributed with
`#[derive(Serialize, Deserialize)]`, and
`#[serde(rename_all="snake_case")]`. Those attributes comes from
the [serde](https://serde.rs/) create, and they help us with
deserialization of them (and serialization in case of sending
them to other contracts). The second one is not required,
but it allows us to keep camel case style in our Rust code,
and yet still have JSONs encoded with snake case style more
typical to this format.

I encourage you to take a closer look to the serde documentation,
as every thing it is there, can be used with the messages.

One important think to notice - empty variants of those enums,
tends to use the empty brackets, like `Admin {}` instead of
more Rusty `Admin`. It is on purpose, to make JSONs cleaner,
and it is related to how serde serializes enum.

Also worth noting, that those message types are not set in stone,
they can be anything. This is just a convention, but sometimes
you would see things like `ExecuteCw4Msg`, or similar. Just keep
in mind, to keep your messages name obvious in terms of their
purpose - sticking to `ExecuteMsg`/`QueryMsg` is generally good
idea.

## Entry points {#entry-points}

So now, when we have our contract message, we need a way to handle
them. They are send to our contract via entry points. There are
three entry points in the `cw4-group` contract:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    // ...
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    // ..
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    // ..
}
```

Those functions are called by the CosmWasm virtual machine, when
message is to be handled by contract. You can think about them
as the `main` function of normal programs, except they have signature
better describing the blockchain itself.

What is very important, is that names of those entry points (similarly to
the `main` function) are fixed - it is relevant, so virtual machine knows
exactly what to call.

So let's start for the first line. Every entry point is attributed with
`#[cfg_attr(not(feature = "library"), entry_point)]`. It may look a bit
scary, but it is just a conditional equivalent of `#[entry_point]` - the
attribute would be there if and only if the "library" feature is not set.
We do this, to be able to use our contracts as dependencies for other
contract - the final binary can contain only one copy of each entry point,
so we make sure, that only the top level one is compiled without this
feature.

The `entry_point` attribute is a macro witch generates some boiler plate.
As the binary is run by WASM virtual machine, it doesn't know much about
Rust types - the actual entry point signatures are very incinvenient to
use. To overcome this issue, there is a macro created, which generates
entry points for us, and those entry points are just calling our functions.

Now take a look at functions arguments. Every single entry point takes as
a last argument a message which triggered execution of it (with the exception
of `reply` - I would explain it later). In addition to that, there are
additional arguments provided by blockchain:

* `Deps` or `DepsMut` object is the gateway to external world. It allows
  accessing the contract state, as well as query other contracts, and
  also delivers an `Api` object with couple useful utility functions.
  The difference is, that `DepsMut` allows to update state, while `Deps`
  allows only to look at it.
* `Env` object delivers information about blockchain state in the
  moment of execution - its height, and the timestamp of execution.
* `MessageInfo` object is information about the contract call - it
  contains address which send the message, and address of contract
  executing message itself.

Keep in mind, that the signatures of those functions are fixed (except of
the messages type), so you cannot interchange `Deps` with `DepsMut` to
update contract state in the query call.

The last portion of entry points is obviously the return type. Every
entry point returns a `Result` type, with any error which can be turned
into string - in case of contract failure, the returned error is just
logged. In most cases, the error type is defined for a contract itself,
typically using a [thiserror](https://docs.rs/thiserror/latest/thiserror/)
crate. `Thiserror` is not required here, but strongly recommended - using
it makes error deifinition very straight forward, and also improves
testability of contract.

The important thing is the `Ok` part of `Result`. Let start with the
`query`, because this one is the simplest. Query always return the `Binary`
object on `Ok` state, which would contain just serialized response.
The common way to create it, is just calling a `to_binary` method
on a object implementing `serde::Serialize`, and they are typically
defined in `msg.rs` next to messages types.

Slightly more complex is return type returned by any other entry
point - the `cosmwasm_std::Response` type. This one keeps everything
needed to complete contract execution. There are three chunks of
information in that.

The first one is an `events` field. It contain all events, which would
be emitted to blockchain as a result of the execution. Events have
really simple structure: they have a type, which is just a string,
and list of attributes which are just string-string key-value pairs.

You can notice that there is another `attributes` field on the `Response`
This is actually just for convenience - most executions would return
only single event, and to make it a bit easier to operate one, there
is set of attributes directly on response. All of them would be converted
to a single `wasm` event which would be emitted. Because of that, I consider
`events` and `attributes` to be actually the same chunk of data.

Then we have the messages field, of `SubMsg` type. This one is the clue
of cross-contract communication. Those messages would be send to the
contracts after processing. What is important - the whole execution is
not finished, unless processing of all sub messages scheduled by the contract
finishes. So if group contract sends some messages as a result of
`update_members` execution, the execution would be considered done only if
all the messages send by it would also be handled (even if they failed).

So when all the sub messages send by contract are processed, then all
the attributes generated by all sub calls and top level call are collected,
and reported to blockchain. But there is one additional information -
the `data`. So this is another `Binary` field, just like result of a query
call, and just like it, it typically contains serialized JSON. Every
contract call can return some additional information in any format,
You may ask - in this case, why do we even bother returning attributes?
It is because of completely different way of emitting events and
data. Any attributes emitted by contract would be visible on blockchain
eventually (unless the whole message handling fails). So if your contract
emitted some event as a result of being sub call of some bigger use case,
the event would always be there visible to everyone. This is not true for
data. Every contract call would return only single `data` chunk, and it
has to decide, if it would just forward the `data` field of one of the
subc alls, or maybe it would construct something by itself. I would
explain it in a bit more detail in a while.

## Sending submessages  {#sending-submessages}

I don't want to go into details of the `Response` API, as it can be
read directly from documentation, but I want to take a bit closer look
to the part about sending messages.

The first function to use here is `add_message`, which take as an argument
the `CosmosMsg` (or rather anything convertible to it). Message added
to response this way, would be send and processed, and its execution
would not affect the result of the contract at all.

The other function to use is `add_submessage`, taking a `SubMsg` argument.
It doesn't differ much from `add_message` - `SubMsg` just wraps the
`CosmosMsg`, adding some info to it: the `id` field, and `reply_on`.
There is also a `gas_limit` thing, but it is not so important - it just
causes submessage processing to fail early if gas treshold is reached.

The simple thing is `reply_on` - it describes if the `reply` message
should be send on processing success, on failure, or both.

The `id` field is an equivalent of order id in our KFC example from
very beginnign. If you send multiple different sub messages, it would
be impossible to distinguish them without that field. It would not
be event possible to figure out, what type of original message is reply
actually handling! This is why the `id` field is there - sending sub
message you can set it to any value, and then on the reply you can
figure out what is happening basing on this field.

Important note here - you don't need to worry about some sophisticated
way of generating ids. Remember, that whole processing is atomic,
and it is impossible that there are multiple different executions of
your contract happening in parallel. In most cases, your contract
send fixed number of sub messages on very concrete executions. Because
of that you can hardcode most of those id while sending (preferably
using some constant).

To easily create sub messages, instead of setting all the fields
separately, you would typically use helper constructors:
`SubMsg::reply_on_success`, `SubMsg::reply_on_error` and
`SubMsg::reply_always`.

## CosmosMsg {#cosmos-msg}

If you took a look at the `CosmosMsg` type, you could be very surprised -
there are so many variants of them, and it is not obvious how do they
relate to communication with other contracts.

The message you are looking for this, is the `WasmMsg` (`CosmosMsg::Wasm`
variant). This one is very much similar to what we already know -
it has couple variants of operation to be performed by contracts:
`Execute`, but also `Instantiate` (so we can create new contracts
in contract executions), and also `Migrate`, `UpdateAdmin`, and
`ClearAdmin` - those are used to manage migrations (will tell a bit
about them at the end of this chapter).

Another interesting message is the `BankMsg` (`CosmosMsg::Bank`). This
one allows contract to transfer native tokens to another contracts
(or burn them - equivalent to transferring them to some black whole
contract). I like to think about it as sending a message to very
special contract responsible for handling native tokens - this is
actually not a true contract, as it is handled by blockchain itself,
but at least to me it simplifies things.

Another variants of `CosmosMsg` are not very interesting for now.
The `Custom` one is there to allow other CosmWasm-based blockchain
to add some blokchcain-handled variant of the message. This is
actually a reason why most message related typest in CosmWasm are
generic over some `T` - this is just blockchain-specific type of
message. We will never use it in `wasmd`. All other messages are
related to advanced CosmWasm features, and I will not describe them
here.

## Reply handling {#reply}

So now when we know how to send sub message, it is time to talk about
handling the reply. When sub message processing finished, and it is
requested to reply, the contract is called with an entry point:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(&self, deps: DepsMut, env: Env, msg: Reply) -> Result<Response, ContractError> {
    // ...
}
```

The `DepsMut`, and `Env` arguments are already familiar, but there is
new one, substituting the typical message argument: the
`cosmwasm_std::Reply`.

This is obviously a type representing the execution status of sub
message. It is slightly processed `cosmwasm_std::Response`. First
important think it contains, is obviously an `id` - the same, which
you set sending sub message, so now you can identify your response.
The other one is the `ContractResult`, which is very similar
to rust `Result<T, String>` type, except it is there for serialization
purposes. You can easily convert it into a `Result` with an `into_result`
function.

On the error case of `ContracResult` there is a string - as I mentioned
before, error are converted to string right after execution. The
`Ok` case contains `SubMsgExecutionResponse` with two fields:
`events` emitted by sub-call, and the `data` field embedded on response.

As said before, you never need to worry about forwarding events -
CosmWasm would do it anyway. The `data` however is another story.
As mentioned before, every call would return only single data object.
In the case of sending sub messages and do not capturing reply, it would
always be whatever is returned by top level message. But it is not a case
when `reply` is called. If reply is called, then it is a function deciding
about the final `data`. It can decide to either forward the data from
sub message (by return `None`), or to overwrite it. It cannot choose,
to return data from the original execution processing - if contract
sends sub messages waiting for replies, it is supposed to not return
any data, unless replies are called.

But what happens, if multiplie sub messages are send? What would the
final `data` contain? Rule is - the last non-None. All submessages
are always called in the order of adding them to the `Response`. As
the order is determistic and well defined, it is always easy to predict
which reply would be used.

## Migrations {#migration}

I mentioned migrations earlier, when describing the `WasmMsg`. So migration
is another action possible to be performed by contracts, which is kind
of similar to instantiate. In software engineering it is common thing, to
release updated version of applications. It is also a case in blockchain -
SmartContract can be updated with some new features. In such cases, new
code is updloaded, and the contract is migrated - so it knows, that from
this point, its messages are handled by another, updated contract code.

However it may be, that the contract state used by older version of the
contract differs from the new one. It is not a problem, if some info was
added (for example some additional map - it would be just empty right
after migration). But the problem is, when the state actually changed,
for example field is renamed. In such case, every contract execution
would fail because of (de)serialization problems. Or even more subtle
cases, like adding map, but one which should be synchronized with whole
contract state, not empty.

This is the purpose of the `migration` entry point. It looks like this:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(&self, deps: DepsMut, env: Env, msg: MigrateMsg) -> Result<Response<T>, ContracError> {
    // ..
}
```

`MigrateMsg` is the type defined by the contract in `msg.rs`.
The `migrate` entry point would be called at the moment of performing
migration, and it is responsible for making sure, the state is correct
after the migration. It is very similar to schema migrations in traditional
database applications. And it is also kind of difficult, because of version
management involved - you can never assume, that you are migrating contract
from the previous version - it can be migrated from any version, released
anytime - even later that version we are migrating to!

It is worth binging back one issue from past - the contract admin. Do you
remember the `--no-admin` flag we set previously on every contract instantiation?
It basically made our contract unmigrateable. Migrations can be performed only
by contract admin. To be able to use it, you should pass `--admin address` flag
instead, with `address` being address which would be able to perform migrations.

## Sudo {#sudo}

Sudo is the last possible entry point in `CosmWasm`, and it is the one we would
never use in `wasmd`. It is equivalent of `CosmosMsg::Custom`, but instead of
being special blokchain-specific message to be send and handled by blokchcain
itself, it is now special blokchcain-specific message send by blokchain to
contract in some conditions. There are many uses of those, but I will not
cover of them, because it is not related to `CosmWasm` itself. The signature
of sudo looks like:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn sudo(&self, deps: DepsMut, env: Env, msg: SudoMsg) -> Result<Response, ContractError> {
    // ..
}
```

The important difference is, that because sudo messages are blokckchain
specific, the `SudoMsg` type is typically defined by some blockchain helper
crate, not the contract itself.
