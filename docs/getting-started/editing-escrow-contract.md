---
id: editing-escrow-contract
title: Editing the Sample Contract
sidebar_label: Editing Contracts
---

## Editing Code

Now that you can compile and run tests, let's try to make some changes to the code and you can see if they work. If you didn't do this already in the last section, it is time to clone the examples repo and check out the escrow code:

```bash
git clone https://github.com/confio/cosmwasm-examples
cd cosmwasm-examples/escrow
git checkout escrow-0.3.0
```

Note: This guide is compatible with `CosmWasm` and `wasmd` `v0.7.x`.

## A Walk-Through of the Escrow Contract

### Data Structures

There are three key data structures used in the contract - for encoding the instantiation message, for encoding the execution messages, and for storing the contract data. We define all messages in `src/msg.rs`. The `State` structs are often in `state.rs`, but if only one then just inline in `contracts.rs`.

All of them must be prefixed with a long `derive` line to add various functionality. Otherwise, it should be pretty clear how the `State` defines the current condition of a contract, and `InitMsg` will provide the initial data to configure said contract. Please note that `State` is the *only information* persisted between multiple contract calls. Purpose of these `derive` directives:

* `Serialize`, `Deserialize` generate methods so the [`serde-json`](https://github.com/serde-rs/json) library can de-serialize them (there is no [reflection](https://en.wikipedia.org/wiki/Reflection_(computer_programming)) in rust)
* `Clone` allows you to make a copy of the object (`msg.clone()`)
* `Debug` and `PartialEq` are very useful for testing. In particular they allow the use of `assert_eq!(expected, msg);`
* `JsonSchema` is needed by [`schemars`](https://docs.rs/schemars/0.5.0/schemars), so we can use [`schema_for!`](https://docs.rs/schemars/0.5.0/schemars/macro.schema_for.html) to generate the json schema objects (in `schema/*.json`)

From `contract.rs`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub arbiter: CanonicalAddr,
    pub recipient: CanonicalAddr,
    pub source: CanonicalAddr,
    pub end_height: i64,
    pub end_time: i64,
}
```

From `msg.rs`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InitMsg {
    pub arbiter: HumanAddr,
    pub recipient: HumanAddr,
    // you can set a last time or block height the contract is valid at
    // if *either* is non-zero and below current state, the contract is considered expired
    // and will be returned to the original funder
    pub end_height: i64,
    pub end_time: i64,
}
```

Note that we use `CanonicalAddr`, which is the binary representation and unchanging over the lifetime of the chain, for storage inside `State`, while we use `HumanAddr`, which is the typical cli format (eg bech32 encoding), for messages and anything that interacts with the user. There is [more info on addresses here](../intro/addresses).

Moving to the `HandleMsg` type, which defines the different contract methods, we make use of a slightly more complex rust construction, the [`enum`](https://doc.rust-lang.org/stable/rust-by-example/custom_types/enum.html). This is also known as [a tagged union or sum type](https://en.wikipedia.org/wiki/Tagged_union), and contains a fixed set of defined possible data types, or `variants`, *exactly one of which must be set*. We use each `variant` to encode a different method. For example `HandleMsg::Refund{}` is a serializable request to refund the escrow, which is only valid after a timeout.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum HandleMsg {
    Approve {
        // release some coins - if quantity is None, release all coins in balance
        quantity: Option<Vec<Coin>>,
    },
    Refund {},
}
```

You can see another directive here (`#[serde(rename_all = "lowercase")]`). This ensure the json looks like: `{"approve": {"quantity": ...}}` instead of `{"Approve": {"quantity": ...}}`. This controls the code generated with `Serialize` and `Deserialize`. You see how compile-time codegen (via derive and macros) is a corner-stone of rust, and provides much of the functionality provided by runtime reflection in other, more dynamic, languages.

### JSON Format

When a `HandleMsg` instance is encoded, it will end up looking like `{"approve": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}` or `{"refund": {}}`. This is also the format we should use client side, when submitting a message body to later be processed by `handle`. We are planning on modifying this for a stable v1 to look more like a json-rpc call format (which requires minimal code change in rust, mainly in the external format). It would then look more like: `{"method": "approve", "params": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}`. This would only affect the client-side code, and will be well documented when we start building out any client-side tooling.

### Instantiation Logic

The `init` function will be called exactly once, before the contract is executed. It is a "privileged" function in that it can set configuration that can never be modified by any other method call. If you look at this example, the first line parses the input from raw bytes into our contract-defined message. We then create the initial state, and check if it is expired already. If expired, we return a generic contract error, otherwise, we store the state and return a success code:

```rust
pub fn init<S: Storage, A: Api>(
    deps: &mut Extern<S, A>,
    env: Env,
    msg: InitMsg,
) -> Result<Response> {
    let state = State {
        arbiter: deps.api.canonical_address(&msg.arbiter)?,
        recipient: deps.api.canonical_address(&msg.recipient)?,
        source: env.message.signer.clone(),
        end_height: msg.end_height,
        end_time: msg.end_time,
    };
    if state.is_expired(&env) {
        contract_err("creating expired escrow")
    } else {
        config(&mut deps.storage).save(&state)?;
        Ok(Response::default())
    }
}
```

`config` is defined above and is a helper wrapper for interacting with the underlying `Storage`. It handles prefixing and de/serializing
for you automatically, removing some boilerplate. It is completely optional and you can use `Storage` directly as well. We also encourage
you to develop other shared libraries for interacting with `Storage` if you want to make certain use cases easier (eg. representing a queue):

```rust
pub fn config<S: Storage>(storage: &mut S) -> Singleton<S, State> {
    singleton(storage, b"config")
}
```

You may wonder about the `clone()` in `source: env.message.signer.clone()`. This has to do with rust lifetimes. If I pass in a variable, I give "ownership" to the other structure and may no longer use it in my code. Since I need to access a reference to env later to check expiration, `state.is_expired(&env)`, I must first clone the struct. If I did not reference `env` anywhere below, I would not need the `clone`.

Try to remove the `.clone()` and compile. See what your IDE or compile says.

### Execution Logic

Just as `init` is the entry point for instantiating a new contract, `handle` is the entry point for executing the code. Since `handle` takes an `enum` with multiple `variants`, we can't just jump into the business logic, but first start with loading the state, and dispatching the message:

```rust
pub fn handle<S: Storage, A: Api>(
    deps: &mut Extern<S, A>,
    env: Env,
    msg: HandleMsg,
) -> Result<Response> {
    let state = config(&mut deps.storage).load()?;
    match msg {
        HandleMsg::Approve { quantity } => try_approve(&deps.api, env, state, quantity),
        HandleMsg::Refund {} => try_refund(&deps.api, env, state),
    }
}
```

Since CosmWasm 0.6.0, we will parse the incoming json into a contract-specific `HandleMsg` automatically before calling, assuming a JSON-encoding message. We also see the use of `config` again to load without any boilerplate. Note the trailing `?`. This works on `Result` types and means, "If this is an error, return the underlying error. If this is a success, give me the value". It is a very useful shorthand all over rust and replaces the `if err != nil { return err }` boilerplate in Go.

You will also see the [`match` statement](https://doc.rust-lang.org/1.30.0/book/2018-edition/ch06-02-match.html). This is another nice Rust idiom, and allows you to `switch` over multiple patterns. Here we check the multiple variants of the `HandleMsg` enum. Note that if you don't cover all cases, the compiler will refuse to proceed.

We pass in `&deps.api` to give the handlers access to the "precompiles" from the runtime, which provide blockchain-specific logic. In particular, we currently use this to translate `CanonicalAddr` to `HumanAddr` in a blockchain-specific manner.

If we now look into the `try_approve` function, we will see how we can respond to a message. We can return an `unauthorized` error if the `signer` is not what we expect, and custom `contract_err` if our business logic rejects the message. The `let amount =` line shows how we can use pattern matching to use the number of coins present in the msg if provided, or default to the entire balance of the contract. Mastering `match` is very useful for Rust development.

```rust
fn try_approve<A: Api>(
    api: &A,
    params: Params,
    state: State,
    quantity: Option<Vec<Coin>>,
) -> Result<Response> {
    if params.message.signer != state.arbiter {
        unauthorized()
    } else if state.is_expired(&params) {
        contract_err("escrow expired")
    } else {
        #[allow(clippy::or_fun_call)]
        let amount = quantity.unwrap_or(params.contract.balance.unwrap_or_default());
        send_tokens(
            api,
            &params.contract.address,
            &state.recipient,
            amount,
            "paid out funds",
        )
    }
}
```

At the end, on success, we want to send some tokens. Cosmwasm contracts cannot call other contracts directly, instead, we create a message to represent our request (`CosmosMsg::Send`) and return it as our contract ends. This will be parsed by the `wasm` module in go and it will execute and defined actions *in the same transaction*. This means, that while we will not get access to the return value, we can be ensured that if the send fails (user specified more coins than were in the escrow), all state changes in this contract would be reverted... just as if we returned a `ContractErr`. This is pulled into a helper to make the code clearer:

```rust
// this is a helper to move the tokens, so the business logic is easy to read
fn send_tokens<A: Api>(
    api: &A,
    from_address: &CanonicalAddr,
    to_address: &CanonicalAddr,
    amount: Vec<Coin>,
    action: &str,
) -> Result<Response> {
    let from_human = api.human_address(from_address)?;
    let to_human = api.human_address(to_address)?;
    let log = vec![log("action", action), log("to", to_human.as_str())];

    let r = Response {
        messages: vec![CosmosMsg::Send {
            from_address: from_human,
            to_address: to_human,
            amount,
        }],
        log: log,
        data: None,
    };
    Ok(r)
}
```

Note that `Env` encodes a lot of information from the blockchain, essentially providing the `Context` if you are coming from `cosmos-sdk`. This is validated data and can be trusted to compare any messages against. Refer to [the standard `cosmwasm` types](https://github.com/confio/cosmwasm/blob/master/src/types.rs#L62-L89) for references to all the available types in the environment.

## Adding a New Message

In this example, we will modify this contract to add some more functionality. In particular, let's make a backdoor to the contract. In the form of a `HandleMsg::Steal` variant that must be signed by some hard coded `THIEF` address and will release the entire contract balance to an address included in the message. Simple?

Note that this also demonstrates the need to verify the code behind a contract rather than just rely on raw wasm. Since we have a reproducible compilation step (details below), if I show you code I claim to belong to the contract, you can compile it and compare the hash to the hash stored on the blockchain, to verify that this really is the original rust code. We will be adding tooling to automate this step and make it simpler in the coming months, but for now, this example serves to demonstrate why it is important.

### Adding the Handler

Open up `src/msg.rs` in your [editor of choice](./rust-basics#setting-up-your-ide) and let's add another variant to the `HandleMsg` enum, called `Steal`. Remember, it must have a destination address:

[Need a hint?](./edit-escrow-hints#handlemsg)

Now, you can add the message handler. As a quick check, try running `cargo wasm` or look for the compile error in your IDE. Remember what I told you about `match`? Okay, now, add a function to process the `HandleMsg::Steal` variant. For the top level `THIEF`, you can use a placeholder address (we will set this to an address you own before deploying).

[Need a hint?](./edit-escrow-hints#adding-handler)

Once you are done, check that it compiles:

```bash
cargo wasm
```

### Writing a Test

We have a number of tests inside of `contracts.rs` that serve as templates, so let's make use of them. You can copy the `handle_refund` test and rename it to `handle_steal`. Remember to include the `#[test]` declaration on top. Now, go in and edit it to test that the THIEF can indeed steal the funds, and no one else can. Make sure our backdoor is working properly before we try to use it.

Now, try running `cargo unit-test` and see if your code works as planned. If it fails, try `RUST_BACKTRACE=1 cargo unit-test` to get a full stack trace. Now, isn't that nicer than trying to test Solidity contracts?

[See solution here](./edit-escrow-hints#test-steal)

### Checking Gas Usage

You can port the existing test to an integration test to ensure the compiled code also works. The integration tests can also use feature flags to test gas metering with the "singlepass" backend, you need to instrument the code to only run with metering enabled, and run this with rust nightly.

Both of these cases will be explained in detail in a future tutorial. But I can promise you, any gas costs for computation will be negligible compared to the costs for reading/writing storage (including moving tokens).

## Compiling for Production

After we have our tested contract, we can run `cargo wasm`. But check out the size of the output:

```bash
$ cargo wasm
$ du -h target/wasm32-unknown-unknown/release/cw_escrow.wasm
1.8M    target/wasm32-unknown-unknown/release/cw_escrow.wasm
```

This works, but is huge for a blockchain transaction. Let's try to make it smaller. Turns out there is one flag we can add (Thanks Max):

```bash
$ RUSTFLAGS='-C link-arg=-s' cargo wasm
$ du -h target/wasm32-unknown-unknown/release/cw_escrow.wasm
112K    target/wasm32-unknown-unknown/release/cw_escrow.wasm
```

This is looking much better.

### Reproduceable builds

The typical case for production is just using the [`cosmwasm-opt`](https://github.com/confio/cosmwasm-opt). This requires `docker` to be installed on your system first. With that in, you can just follow the instructions on the [README](https://github.com/confio/cosmwasm-opt/blob/master/README.md):

```bash
docker run --rm -v $(pwd):/code \
  --mount type=volume,source=$(basename $(pwd))_cache,target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  confio/cosmwasm-opt:0.7.2
```

It will output a file called `contract.wasm` in the project directory (same directory as `Cargo.toml`, one above `contract.rs`), as well as `hash.txt` with the sha256 hash. It will also update the schemas in `schema/handle_msg.json`. To see the effect of optimization, look at the file size now:

```text
$ du -h contract.wasm
96K     contract.wasm
```

This is very similar to the build process above, but does a second pass to strip out any dead weight, including debug info and labels.
But the main goal here is to make a reproduceable build, so that if someone tries to compile the code on a different machine 6 months later, they
get the same output, byte for byte. This allows us to start proving claims of the source code behind various wasm components on chain.

If you cut-paste code from the given solutions, you should have an identical sha256sum. (And if any line is different, this should be different, but consistent over multiple runs of the docker image above):

```text
$ cat hash.txt
96babc67673eed23868622f0b89973ffc1196b758caa7b061da3f2f609d606b0  contract.wasm
```

### Schema

We can also generate JSON Schemas that serve as a guide for anyone trying to use the contract. To specify which arguments they need.
We do plan to eventually release some tooling that uses those to auto-build clients with proper type-checks, but so far it is just for
documentation purposes, if you don't want to dig into the Rust code to see the proper arguments. Go ahead and regenerate the schemas:

```bash
cargo schema
```

Now you should see the definition for the `"steal"` call added:

```bash
grep -A9 steal schema/handle_msg.json
```

### Debuggable Builds

If you want to try to inspect the output, and figure out where to optimize, you will want to only do the first step of the build process, without `wasm-opt`. This leaves in some symbol names and you can use `twilly` to get info on which functions are using up all the space. This is only needed if you find the contract is too big and you want to check which dependencies are responsible. Just add some extra flags to the normal cargo build, as we did above:

```bash
RUSTFLAGS='-C link-arg=-s' cargo wasm
du -h target/wasm32-unknown-unknown/release/escrow.wasm
```

This is 112K, slightly larger than the fully compressed build above. However, it does contain more symbols, which allow one to use
[`twiggy`](https://rustwasm.github.io/twiggy/) and other tools to inspect which functions are taking up space.
The `cosmwasm` repo also has a [longer discussion of the build process](https://github.com/confio/cosmwasm/blob/master/Building.md).

In the current build, most usage seems to be out actual business logic, as well as a contribution from `serde_json_wasm` (which is far,
far smaller than the original `serde_json` library). If you start pulling in more dependencies into your contracts and the size increases unexpectedly,
this is a good place to track down where the bloat comes from and possibly remove it. This is the technique I used to reduce the build size from 172kB
down to 68kB in an earlier version of CosmWasm (with less functionality).
These techniques may be useful for others, especially when pulling in many new libraries.