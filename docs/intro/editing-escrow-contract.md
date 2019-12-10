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
```

## A Walk-Through of the Escrow Contract

### Data Structures

There are three key data structures used in the contract - for encoding the instantiation message, for encoding the execution messages, and for storing the contract data. All of them must be prefixed with the line `#[derive(Serialize, Deserialize)]` to allow the [`serde-json`](https://github.com/serde-rs/json) library to de-serialize them (there is no [reflection](https://en.wikipedia.org/wiki/Reflection_(computer_programming)) in rust). Otherwise, it should be pretty clear how the `State` defines the current condition of a contract, and `InitMsg` will provide the initial data to configure said contract. Please note that `State` is the *only information* persisted between multiple contract calls:

```rust
#[derive(Serialize, Deserialize)]
pub struct State {
    pub arbiter: String,
    pub recipient: String,
    pub source: String,
    pub end_height: i64,
    pub end_time: i64,
}

#[derive(Serialize, Deserialize)]
pub struct InitMsg {
    pub arbiter: String,
    pub recipient: String,
    // you can set a last time or block height the contract is valid at
    // if *either* is non-zero and below current state, the contract is considered expired
    // and will be returned to the original funder
    pub end_height: i64,
    pub end_time: i64,
}
```

Moving to the `HandleMsg` type, which defines the different contract methods, we make use of a slightly more complex rust construction, the [`enum`](https://doc.rust-lang.org/stable/rust-by-example/custom_types/enum.html). This is also known as [a tagged union or sum type](https://en.wikipedia.org/wiki/Tagged_union), and contains a fixed set of defined possible data types, or `variants`, *exactly one of which must be set*. We use each `variant` to encode a different method. For example `HandleMsg::Refund{}` is a serializable request to refund the escrow, which is only valid after a timeout.

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HandleMsg {
    Approve {
        // release some coins - if quantity is None, release all coins in balance
        quantity: Option<Vec<Coin>>,
    },
    Refund {},
}
```

### JSON Format

When a `HandleMsg` instance is encoded, it will end up looking like `{"approve": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}` or `{"refund": {}}`. This is also the format we should use client side, when submitting a message body to later be processed by `handle`. We are planning on modifying this for a stable v1 to look more like a json-rpc call format (which requires minimal code change in rust, mainly in the external format). It would then look more like: `{"method": "approve", "params": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}`. This would only affect the client-side code, and will be well documented when we start building out any client-side tooling.

### Instantiation Logic

The `init` function will be called exactly once, before the contract is executed. It is a "privileged" function in that it can set configuration that can never be modified by any other method call. If you look at this example, the first line parses the input from raw bytes into our contract-defined message. We then create the initial state, and check if it is expired already. If expired, we return a generic `ContractErr`, otherwise, we store the state and return a success code:

```rust
pub fn init<T: Storage>(store: &mut T, params: Params, msg: Vec<u8>) -> Result<Response> {
    let msg: InitMsg = from_slice(&msg).context(ParseErr {})?;
    let state = State {
        arbiter: msg.arbiter,
        recipient: msg.recipient,
        source: params.message.signer.clone(),
        end_height: msg.end_height,
        end_time: msg.end_time,
    };
    if state.is_expired(&params) {
        ContractErr {
            msg: "creating expired escrow".to_string(),
        }
        .fail()
    } else {
        store.set(CONFIG_KEY, &to_vec(&state).context(SerializeErr {})?);
        Ok(Response::default())
    }
}
```

You may wonder about the `clone()` in `source: params.message.signer.clone()`. This has to do with rust lifetimes. If I pass in a variable, I give "ownership" to the other structure and may no longer use it in my code. Since I need to access a reference to params later to check expiration, `state.is_expired(&params)`, I must first clone the struct. If I did not reference `params` anywhere below, I would not need the `clone`. 

Try to remove the `.clone()` and compile. See what your IDE or compile says.

### Execution Logic

Just as `init` is the entry point for instantiating a new contract, `handle` is the entry point for executing the code. Since `handle` takes an `enum` with multiple `variants`, we can't just jump into the business logic, but first start with parsing the message, loading the state, and dispatching the message:

```rust
pub fn handle<T: Storage>(store: &mut T, params: Params, msg: Vec<u8>) -> Result<Response> {
    let msg: HandleMsg = from_slice(&msg).context(ParseErr {})?;
    let data = store.get(CONFIG_KEY).context(ContractErr {
        msg: "uninitialized data".to_string(),
    })?;
    let state: State = from_slice(&data).context(ParseErr {})?;

    match msg {
        HandleMsg::Approve { quantity } => try_approve(params, state, quantity),
        HandleMsg::Refund {} => try_refund(params, state),
    }
}
```

Some points to note here... First the use of `context` on the errors to cast it to a pre-defined `cosmwasm::Error` variant. You will want to choose a reason for any error, and can look into [`snafu`](https://docs.rs/snafu/0.1.4/snafu/) to learn a bit more on how to use this. But the short story is that you must `use snafu::ResultExt;` in your `contract.rs` file in order to attach the `.context()` method to `Result` and make use of this shorthand.

In general, use `ParseErr` and `SerializeErr` if this comes from the serde logic. And either use a generic `Unauthorized`, or `ContractErr` / `DynContractErr` with a custom message, for any error you raise due to the business logic. You can note there is a [fixed list of pre-defined error types](https://github.com/confio/cosmwasm/blob/master/src/errors.rs) you must chose from. Those that include `source: XyzError` can only be formed from another functions returning the `XyzError`. The rest can be created by any business logic.

You will also see the [`match` statement](https://doc.rust-lang.org/1.30.0/book/2018-edition/ch06-02-match.html) at the end. This is a very nice Rust idiom, and allows you to `switch` over multiple patterns. Here we check the multiple variants of the `HandleMsg` enum. Note that if you don't cover all cases, the compile will refuse to proceed.

If we now look into the `try_approve` function, we will see how we can respond to a message. We can return an `Unauthorized` error if the `signer` is not what we expect, and custom `ContractErr` if our business logic rejects the message. The `let amount =` line shows how we can use pattern matching to use the number of coins present in the msg if provided, or default to the entire balance of the contract. Mastering `match` is very useful for Rust development.

At the end, on success, we want to send some tokens. Cosmwasm contracts cannot call other contracts directly, instead, we create a message to represent our request (`CosmosMsg::Send`) and return it as our contract ends. This will be parsed by the `wasm` module in go and it will execute and defined actions *in the same transaction*. This means, that while we will not get access to the return value, we can be ensured that if the send fails (user specified more coins than were in the escrow), all state changes in this contract would be reverted... just as if we returned a `ContractErr`.

```rust
fn try_approve(params: Params, state: State, quantity: Option<Vec<Coin>>) -> Result<Response> {
    if params.message.signer != state.arbiter {
        Unauthorized {}.fail()
    } else if state.is_expired(&params) {
        ContractErr {
            msg: "escrow expired".to_string(),
        }
        .fail()
    } else {
        let amount = match quantity {
            None => params.contract.balance,
            Some(coins) => coins,
        };
        let res = Response {
            messages: vec![CosmosMsg::Send {
                from_address: params.contract.address,
                to_address: state.recipient,
                amount,
            }],
            log: Some("paid out funds".to_string()),
            data: None,
        };
        Ok(res)
    }
}
```

Note that `Params` encodes a lot of information from the blockchain, essentially providing the `Context`. This is validated data and can be trusted to compare any messages against. Refer to [the standard `cosmwasm` types](https://github.com/confio/cosmwasm/blob/master/src/types.rs#L3-L36) for references to all the available types in the environment.

## Adding a New Message

In this example, we will modify this contract to add some more functionality. In particular, let's make a backdoor to the contract. In the form of a `HandleMsg::Steal` variant that must be signed by some hard coded `THIEF` address and will release the entire contract balance to an address included in the message. Simple?

Note that this also demonstrates the need to verify the code behind a contract rather than just rely on raw wasm. Since we have a reproducible compilation step (details below), if I show you code I claim to belong to the contract, you can compile it and compare the hash to the hash stored on the blockchain, to verify that this really is the original rust code. We will be adding tooling to automate this step and make it simpler in the coming months, but for now, this example serves to demonstrate why it is important.

### Adding the Handler

Open up `src/contract.rs` in your [editor of choice](./rust-basics#setting-up-your-ide) and let's add another variant to the `HandleMsg` enum, called `Steal`. Remember, it must have a destination address:

[Need a hint?](./edit-escrow-hints#handlemsg)

Now, you can add the message handler. As a quick check, try running `cargo wasm` or look for the compile error in your IDE. Remember what I told you about `match`? Okay, now, add a function to process the `HandleMsg::Steal` variant. For the top level `THIEF`, you can use a placeholder address (we will set this to an address you own before deploying).

[Need a hint?](./edit-escrow-hints#adding-handler)

### Writing a Test

We have a number of tests inside of `contracts.rs` that serve as templates, so let's make use of them. You can copy the `handle_refund` test and rename it to `handle_steal`. Remember to include the `#[test]` declaration on top. Now, go in and edit it to test that the THIEF can indeed steal the funds, and no one else can. Make sure our backdoor is working properly before we try to use it.

Now, try running `cargo unit-test` and see if your code works as planned. If it fails, try `RUST_BACKTRACE=1 cargo unit-test` to get a full stack trace. Now, isn't that nicer than trying to test Solidity contracts?

[See solution here](./edit-escrow-hints#test-steal)

### Checking Gas Usage

You can port the existing test to an integration test to ensure the compiled code also works. The integration tests can also use feature flags to test gas metering with the "singlepass" backend, you need to instrument the code to only run with metering enabled, and run this with rust nightly.

Both of these cases will be explained in detail in a future tutorial. But I can promise you, any gas costs for computation will be negligible compared to the costs for reading/writing storage (including moving tokens).

## Compiling for Production

After we have our tested contract, we can run `cargo wasm` and produce a valid wasm output at `target/wasm32-unknown-unknown/release/escrow.wasm`. This works, but is 1.5 MB and huge for a blockchain transaction. Let's try to make it smaller.

### Reproduceable builds

The typical case for production is just using the [`cosmwasm-opt`](https://github.com/confio/cosmwasm-opt). This requires `docker` to be installed on your system first. With that in, you can just follow the instructions on the [README](https://github.com/confio/cosmwasm-opt/blob/master/README.md):

```bash
docker run --rm -u $(id -u):$(id -g) -v $(pwd):/code confio/cosmwasm-opt:0.4.1
```

It will output a file called `contract.wasm` in the project directory (same directory as `Cargo.toml`, one above `contract.rs`). Look at the file size now:

```text
$ du -h contract.wasm
68K     contract.wasm
```

This is something you can fit in a transaction. If you cut-paste code from the given solutions, you should have an identical sha256sum. (And if any line is different, this should be different, but consistent over multiple runs of the docker image above):

```text
$ sha256sum contract.wasm 
1c447b7cedf32f3c6f4e2a32f01871f01af07e2290ec3a1795e24d8b2e67062a  contract.wasm
```

### Debuggable Builds

If you want to try to inspect the output, and figure out where to optimize, you will want to only do the first step of the build process, using `wasm-pack`. This leaves in some symbol names and you can use `twilly` to get info on which functions are using up all the space. This is only needed if you find the contract is too big and you want to check which dependencies are responsible.

First, follow the directions to [install `wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/).

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh 
```

Then you can build it and check to compiled data, which will be output to `./pkg/escrow_bg.wasm`:

```bash
wasm-pack build
du -h ./pkg/escrow_bg.wasm
```

This is 84K, slightly larger than the fully compressed build above. However, it does contain more symbols, which allow one to use [`twiggy`](https://rustwasm.github.io/twiggy/) and other tools to inspect which functions are taking up space. The `cosmwasm` repo also has a [longer discussion of the build process](https://github.com/confio/cosmwasm/blob/master/Building.md).

In the current build, most usage seems to be out actual business logic, as well as a contribution from `serde_json_wasm` (which is far, far smaller than the original `serde_json` library). If you start pulling in more dependencies into your contracts and the size increases unexpectedly, this is a good place to track down where the bloat comes from and possibly remove it. This is the technique I used to reduce the build size from 172kB down to the current 68kB, even while adding functionality. These techniques may be useful for others, especially when pulling in many new libraries.
