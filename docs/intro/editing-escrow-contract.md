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

There are three key data structures used in the contract - for encoding the instantiation message, for encoding the execution messages, and for storing the contract data. All of them must be prefixed with the line `#[derive(Serialize, Deserialize)]` to allow the serde-json library to de-serialize them (there is no reflection in rust). Otherwise, it should be pretty clear how the `State` defines the current conditon of a contract, and `InitMsg` will provide the initial data to configure said contract. Please note that `State` is the *only information* persisted between multiple contract calls:

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

Moving to the `HandleMsg` type, which defines the possibilities to execute the contract, we se use of a slightly more complex rust construction, the `enum`. This is also known as a union or sum type, and must take exactly one of the embedded values. We use each `variant` to encode a different method call. For example `HandleMsg::Refund{}` is an serializable request to refund the escrow, which is only valid after a timeout.

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

When this is encoded, it will end up looking like `{"approve": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}` or `{"refund": {}}`. We are planning on modifying this for a stable v1 to look more like a json-rpc call format (which requires minimal code change in rust, mainly in the external format). It would then look more like: `{"method": "approve", "params": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}`.

### Instantiation Logic

The `init` function will be called exactly once, before the contract is every executed. It is a "privledged" function in that it can set configuration that can never be modified by any other method call. If you look at this example, the first line parses the input from raw bytes into our contract-defined message. We then create the initial state, and check if it is expired already. If expired, we return an generic `ContractErr`, otherwise, we store the state and return a success code:

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

Some points to note here... First the use of `context` on the errors to cast it to a define `cosmwasm::Error` variant. You will want to chose a reason for any error, and can look into snafu (TODO link) to learn a bit more how to use this. In general, use `ParseErr` and `SerializeErr` if this comes from the serde logic. And use `ContractErr` with a custom message for any error you raise due to the business logic.

You will also see the `match` statement at the end. This is a very nice Rust idiom, and allows you to `switch` over multiple patterns. Here we check the multiple variants of the `HandleMsg` enum. Note that if you don't cover all cases, the compile will refuse to proceed.

If we now look into the `try_approve` function, we will see how we can respond to a message. We can return a `Unauthorized` error if the `signer` is not what we expect, and custom `ContractErr` if our business logic rejects the message. The `let amount =` line shows how we can use pattern matching to use the number of coins present in the msg if provided, or default to the entire balance of the contract. Master `match` is very useful for Rust development.

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

Note that `Params` encodes much information from the blockchain direction, the `Context` in other terms. This is validated data and can be trusted, to compare any messages against. Refer to [the standard cosmwasm types](https://github.com/confio/cosmwasm/blob/master/src/types.rs#L3-L36) for any references you want to the environment. 


## Adding a New Message

In this example, we will modify this contract to add some more functionality. In particular, let's make a backdoor to the contract. In the form of a `HandleMsg::Steal` variant that must be signed by some hardcoded `THIEF` address and will release the entire contract balance to an address included in the message. Simple?

Note that this also demontrates the need to verify the code behind a contract rather than just rely on raw wasm. Since we have a reproduceable compilation step (details below), if I show you code I claim to belong to the contract, you can compile it and compare the hash to the hash stored on the blockchain, to verify this is really the original rust code. We will be adding tooling to automate this step and make it simpler in the coming months, but for now, this example serves to demonstrate why it is important. 

### Adding the Handler

Open up `src/contract.rs` in your [editor of choice](./rust-basics#setting-up-your-ide) and let's add another variant to the `HandleMsg` enum, called `Steal`. Remember, it must have a destination address:

[Need a hint?](./edit-escrow-hints#handlemsg)

Now, you can add the message handler. As a quick check, try running `cargo wasm` or look for the compile error in your IDE. Remember what I told you about `match`? Okay, now, add a function to process the `HandleMsg::Steal` variant. For the top level `THIEF`, you can use a placeholder address (we will set this to an address you own before deploying).

[Need a hint?](./edit-escrow-hints#adding-handler)

### Writing a Test

We have a number of tests that serve as a template, so let's make use of that. You can copy the `handle_refund` test and rename it to `handle_steal`. Remember to include the `#[test]` declaration on top. Now, go in an edit it to test that the THIEF can indeed steal the funds, and no one else can. Make sure our backdoor is working properly before we try to use it.

Now, try running `cargo unit-test` and see if your code works as planned. If it fails, try `RUST_BACKTRACE=1 cargo unit-test` to get a full stack trace. Now, isn't that nicer than trying to test Solidity contracts?

[See solution here](./edit-escrow-hints#test-steal)

### Checking Gas Usage

You can port the existing test to an integration test to ensure the compiled code also works. The integration tests can also use feature flags to test gas metering with singlepass, you need to instrument the code to only run with metering enabled, and run this with rust nightly. 

Both of these cases will be explained in detail in a future tutorial. But I can promise you, any gas costs for computation will be negligable compared to the costs for reading/writing storage (including moving tokens).

## Compiling for Production

After we have our tested contract, we can run `cargo wasm` and produce a valid wasm output at `target/wasm32-unknown-unknown/release/escrow.wasm`. This works, but is 1.5 MB and huge for a blockchain transaction. Let's try to make it smaller.

### Debuggable Builds

If you want to try to inspect the output, and figure out where to optimize, you will want to only do the first step of the build process, using `wasm-pack`. This leaves in some symbol names and you can use `twilly` to get info on which functions are using up all the space. This is only needed if you find the contract is too big and you want to check which dependencies are responsible.

TODO: link to docs

### Reproduceable builds

The typical case for production is just using the [`cosmwasm-opt`](https://github.com/confio/cosmwasm-opt). This requires `docker` to be installed on your system first. With that in, you can just follow the instructions on the [README](https://github.com/confio/cosmwasm-opt/blob/master/README.md):

```
docker run --rm -u $(id -u):$(id -g) -v $(pwd):/code confio/cosmwasm-opt:0.4.1
```

It will output a file called `contract.wasm` in the project directory (same directory as `Cargo.toml`, one above `contract.rs`). Look at the file size now:

```
$ du -h contract.wasm
```