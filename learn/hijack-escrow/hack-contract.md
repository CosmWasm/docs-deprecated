---
order: 2
---

# Hack the Contract

Now that you can compile and run tests, let's try to make some changes to the code and you can see if they work. If you didn't do this already in the last section, it is time to clone the examples repo and check out the escrow code:

```shell
git clone https://github.com/CosmWasm/cosmwasm-examples
cd cosmwasm-examples
git fetch --tags
git checkout escrow-0.10.0
cd contracts/escrow
```

Note: This guide is compatible with `CosmWasm v0.14.x` and `wasmd v0.16.x`.

## A Walk-Through of the Escrow Contract

### Data Structures

There are three key data structures used in the contract - for encoding the instantiation message, for encoding the execution messages, and for storing the contract data. We define all messages in `src/msg.rs`. The `State` structs are often in `state.rs`, but if only one then just inline in `contracts.rs`.

All of them must be prefixed with a long `derive` line to add various functionality. Otherwise, it should be pretty clear how the `State` defines the current condition of a contract, and `InitMsg` will provide the initial data to configure said contract. Please note that `State` is the *only information* persisted between multiple contract calls. Purpose of these `derive` directives:

* `Serialize`, `Deserialize` generate methods so the [`serde-json`](https://github.com/serde-rs/json) library can de-serialize them (there is no [reflection](https://en.wikipedia.org/wiki/Reflection_(computer_programming)) in rust)
* `Clone` allows you to make a copy of the object (`msg.clone()`)
* `Debug` and `PartialEq` are very useful for testing. In particular they allow the use of `assert_eq!(expected, msg);`
* `JsonSchema` is needed by [`schemars`](https://docs.rs/schemars/0.7.0/schemars), so we can use [`schema_for!`](https://docs.rs/schemars/0.7.0/schemars/macro.schema_for.html) to generate the json schema objects (in `schema/*.json`)

From `state.rs`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub arbiter: Addr,
    pub recipient: Addr,
    pub source: Addr,
    pub end_height: Option<u64>,
    pub end_time: Option<u64>,
}
```

From `msg.rs`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub arbiter: String,
    pub recipient: String,
    /// When end height set and block height exceeds this value, the escrow is expired.
    /// Once an escrow is expired, it can be returned to the original funder (via "refund").
    pub end_height: Option<u64>,
    /// When end time (in seconds since epoch 00:00:00 UTC on 1 January 1970) is set and
    /// block time exceeds this value, the escrow is expired.
    /// Once an escrow is expired, it can be returned to the original funder (via "refund").
    pub end_time: Option<u64>,
}
```

Note that we use `Addr`, which is a validated address wrapper with some helper functions for storage inside `State`, while we use invalidated  `String` address which should be validated by developer, for messages and anything that interacts with the user. There is [more info on addresses here](../../architecture/addresses).

`Option<u64>` is a way of telling rust this field may be missing. It may either have a value, like `Some(123456)` or
be `None`. This means the init message may omit those fields (or pass them as `null`) and we don't need to use some
special value like `0` to signify disabled.

Moving to the `ExecuteMsg` type, which defines the different contract methods, we make use of a slightly more complex rust construction, the [`enum`](https://doc.rust-lang.org/stable/rust-by-example/custom_types/enum.html). This is also known as [a tagged union or sum type](https://en.wikipedia.org/wiki/Tagged_union), and contains a fixed set of defined possible data types, or `variants`, *exactly one of which must be set*. We use each `variant` to encode a different method. For example `Execute::Refund{}` is a serializable request to refund the escrow, which is only valid after a timeout.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Approve {
        // release some coins - if quantity is None, release all coins in balance
        quantity: Option<Vec<Coin>>,
    },
    Refund {},
}
```

You can see another directive here (`#[serde(rename_all = "snake_case")]`). This ensure the json looks like: `{"approve": {"quantity": ...}}` instead of `{"Approve": {"quantity": ...}}`. This controls the code generated with `Serialize` and `Deserialize`. You see how compile-time codegen (via derive and macros) is a corner-stone of rust, and provides much of the functionality provided by runtime reflection in other, more dynamic, languages.

### JSON Format

When a `ExecuteMsg` instance is encoded, it will end up looking like `{"approve": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}` or `{"refund": {}}`. This is also the format we should use client side, when submitting a message body to later be processed by `execute`.

### Instantiation Logic

The `instantiate` function will be called exactly once, before the contract is executed. It is a "privileged" function in that it can set configuration that can never be modified by any other method call. If you look at this example, the first line parses the input from raw bytes into our contract-defined message. We then create the initial state, and check if it is expired already. If expired, we return a generic contract error, otherwise, we store the state and return a success code:

```rust
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let state = State {
        arbiter: deps.api.addr_validate(&msg.arbiter)?,
        recipient: deps.api.addr_validate(&msg.recipient)?,
        source: info.sender,
        end_height: msg.end_height,
        end_time: msg.end_time,
    };

    if state.is_expired(&env) {
        return Err(ContractError::Expired {
            end_height: msg.end_height,
            end_time: msg.end_time,
        });
    }

    config(deps.storage).save(&state)?;
    Ok(Response::default())
}
```

`config` is defined in `state.rs` and is a helper wrapper for interacting with the underlying `Storage`. It handles prefixing and de/serializing
for you automatically, removing some boilerplate. It is completely optional and you can use `Storage` directly as well. We also encourage
you to develop other shared libraries for interacting with `Storage` if you want to make certain use cases easier (eg. representing a queue):

```rust
pub fn config(storage: &mut dyn Storage) -> Singleton<State> {
    singleton(storage, CONFIG_KEY)
}
```

### Execution Logic

Just as `init` is the entry point for instantiating a new contract, `handle` is the entry point for executing the code. Since `handle` takes an `enum` with multiple `variants`, we can't just jump into the business logic, but first start with loading the state, and dispatching the message:

```rust
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    let state = config_read(deps.storage).load()?;
    match msg {
        ExecuteMsg::Approve { quantity } => try_approve(deps, env, state, info, quantity),
        ExecuteMsg::Refund {} => try_refund(deps, env, info, state),
    }
}
```

CosmWasm parses the incoming json into a contract-specific `ExecuteMsg` automatically before calling, assuming a JSON-encoding message. We also see the use of `config_read` to load without any boilerplate. Note the trailing `?`. This works on `Result` types and means, "If this is an error, return the underlying error. If this is a success, give me the value". It is a very useful shorthand all over rust and replaces the `if err != nil { return err }` boilerplate in Go.

You will also see the [`match` statement](https://doc.rust-lang.org/1.30.0/book/2018-edition/ch06-02-match.html). This is another nice Rust idiom, and allows you to `switch` over multiple patterns. Here we check the multiple variants of the `ExecuteMsg` enum. Note that if you don't cover all cases, the compiler will refuse to proceed.

We pass in `deps` to give the handlers access to runtime callbacks, which provide blockchain-specific logic. In particular, we currently use `deps.api` to validate `String` to `Addr` in a blockchain-specific manner. Or verify cryptographic signatures with `secp256k1_verify,ed25519_verify`. And we also use
`deps.querier` to query the current balance of the contract.

If we now look into the `try_approve` function, we will see how we can respond to a message. We can return an `unauthorized` error if the `signer` is not what we expect, and `ContractError` if our business logic rejects the message. The `let amount =` line shows how we can use pattern matching to use the number of coins present in the msg if provided, or default to the entire balance of the contract.

```rust
fn try_approve(
    deps: DepsMut,
    env: Env,
    state: State,
    info: MessageInfo,
    quantity: Option<Vec<Coin>>,
) -> Result<Response, ContractError> {
    if info.sender != state.arbiter {
        return Err(ContractError::Unauthorized {});
    }

    // throws error if state is expired
    if state.is_expired(&env) {
        return Err(ContractError::Expired {
            end_height: state.end_height,
            end_time: state.end_time,
        });
    }

    let amount = if let Some(quantity) = quantity {
        quantity
    } else {
        // release everything

        // Querier guarantees to returns up-to-date data, including funds sent in this handle message
        // https://github.com/CosmWasm/wasmd/blob/master/x/wasm/internal/keeper/keeper.go#L185-L192
        deps.querier.query_all_balances(&env.contract.address)?
    };

    Ok(send_tokens(state.recipient, amount, "approve"))
}
```

At the end, on success, we want to send some tokens. Cosmwasm contracts cannot call other contracts directly, instead, we create a message to represent our request (`CosmosMsg::Bank(BankMsg::Send)`) and return it as our contract ends. This will be parsed by the `wasm` module in go and it will execute and defined actions *in the same transaction*. This means, that while we will not get access to the return value, we can be ensured that if the send fails (user specified more coins than were in the escrow), all state changes in this contract would be reverted... just as if we returned `unauthorized`. This is pulled into a helper to make the code clearer:

```rust
fn send_tokens(to_address: Addr, amount: Vec<Coin>, action: &str) -> Response {
    let attributes = vec![attr("action", action), attr("to", to_address.clone())];

    Response {
        submessages: vec![],
        messages: vec![CosmosMsg::Bank(BankMsg::Send {
            to_address: to_address.into(),
            amount,
        })],
        data: None,
        attributes,
    }
}
```

Note that `Env` encodes a lot of information from the blockchain, essentially providing the `Context` if you are coming from Cosmos SDK. This is validated data and can be trusted to compare any messages against. Refer to [the standard `cosmwasm` types](https://github.com/CosmWasm/cosmwasm/blob/v0.10.0/packages/std/src/types.rs#L7-L41) for references to all the available types in the environment.

## Adding a New Message

In this example, we will modify this contract to add some more functionality. In particular, let's make a backdoor to the contract. In the form of a `ExecuteMsg::Steal` variant that must be signed by some hard coded `THIEF` address and will release the entire contract balance to an address included in the message. Simple?

Note that this also demonstrates the need to verify the code behind a contract rather than just rely on raw wasm. Since we have a reproducible compilation step (details below), if I show you code I claim to belong to the contract, you can compile it and compare the hash to the hash stored on the blockchain, to verify that this really is the original rust code. We will be adding tooling to automate this step and make it simpler in the coming months, but for now, this example serves to demonstrate why it is important.

### Adding the Handler

Open up `src/msg.rs` in your [editor of choice](./intro#setting-up-your-ide) and let's add another variant to the `ExecuteMsg` enum, called `Steal`. Remember, it must have a destination address:

[Need a hint?](./edit-escrow-hints#handlemsg)

Now, you can add the message handler. As a quick check, try running `cargo wasm` or look for the compile error in your IDE. Remember what I told you about `match`? Okay, now, add a function to process the `ExecuteMsg::Steal` variant. For the top level `THIEF`, you can use a placeholder address (we will set this to an address you own before deploying).

[Need a hint?](./edit-escrow-hints#adding-handler)

Once you are done, check that it compiles:

```shell
cargo wasm
```

### Writing a Test

We have a number of tests inside of `contracts.rs` that serve as templates, so let's make use of them. You can copy the `handle_refund` test and rename it to `handle_steal`. Remember to include the `#[test]` declaration on top. Now, go in and edit it to test that the THIEF can indeed steal the funds, and no one else can. Make sure our backdoor is working properly before we try to use it.

Now, try running `cargo unit-test` and see if your code works as planned. If it fails, try `RUST_BACKTRACE=1 cargo unit-test` to get a full stack trace. Now, isn't that nicer than trying to test Solidity contracts?

[See solution here](./edit-escrow-hints#test-steal)
