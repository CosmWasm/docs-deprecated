---
sidebar_position: 2
---

# Hack the Contract

Now that you can [compile and run tests](https://docs.cosmwasm.com/1.0/getting-started/compile-contract#compiling-and-testing-contract), let's try to make some changes to the code and you can see if they work. If you didn't do this already in the last section, it is time to clone the examples repo and check out the escrow code:

```shell
git clone https://github.com/InterWasm/cw-contracts
cd cw-contracts
cd contracts/escrow
```
## A Walk-Through of the Escrow Contract {#a-walk-through-of-the-escrow-contract}

### Data Structures {#data-structures}

There are four key data structures used in the contract. Three of them are defined in `src/msg.rs` for encoding the instantiation, execution and query messages. The fourth one is the `Config` (or `State`) struct for storing contract data. The `Config` struct is used to express the current state/configuration of a contract and is often defined in `state.rs`. If they are brief enough, the definitions inside `state.rs` can also be inlined into `contract.rs`.

All of the structure definitions must be preceded by a long `derive` line to add various functionality. The `Config` and `InitMsg` structs will provide the initial data to configure said contract. Please note that `Config` (or `State`) is the *only information* persisted between multiple contract calls.

Purpose of the `derive` directives:

* `Serialize`, `Deserialize` generate methods so the [`serde-json`](https://github.com/serde-rs/json) library can
  de(serialize) the structs (there is no [reflection](https://en.wikipedia.org/wiki/Reflection_(computer_programming)) in rust)
* `Clone` allows you to make a copy of the object (e.g., `msg.clone()`)
* `Debug` and `PartialEq` are very useful for testing. In particular they allow the use of `assert_eq!(expected, msg);`
* `JsonSchema` is needed by [`schemars`](https://docs.rs/schemars/latest/schemars/index.html), so we can
  use [`schema_for!`](https://docs.rs/schemars/latest/schemars/macro.schema_for.html) to generate the json schema
  objects (in `schema/*.json`)

From `state.rs`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
  pub struct Config {
    pub arbiter: Addr,
    pub recipient: Addr,
    pub source: Addr,
    pub expiration: Option<Expiration>,
  }
```

From `msg.rs`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
  pub arbiter: String,
  pub recipient: String,
  /// When expiration height is set and block height exceeds this value, the escrow is expired.
  /// Once an escrow is expired, it can be returned to the original funder (via "refund").
  ///
  /// When expiration time (in nanoseconds since epoch 00:00:00 UTC on 1 January 1970) is set and
  /// block time exceeds this value, the escrow is expired.
  /// Once an escrow is expired, it can be returned to the original funder (via "refund").
  pub expiration: Option<Expiration>,
}
```

Note that we use the type `Addr`, which is a validated address wrapper with some helper functions, for addresses stored inside the `Config`, while we use invalidated `String` addresses which should be validated by the contract, for messages sent and received through user interaction. There is [more info on addresses here](https://docs.cosmwasm.com/1.0/architecture/addresses).

`Option<Expiration>` is a way of telling rust this field may be missing. It may either have a value, like `Some(at_height: 1230405)` or be `None`. This means the init message may omit those fields (or pass them as `null`) and we don't need to use some special value like `0` to signify they are disabled.

Moving to the `ExecuteMsg` and `QueryMsg` types, which define the different contract methods, we make use of a slightly more complex rust construction, the [`enum`](https://doc.rust-lang.org/stable/rust-by-example/custom_types/enum.html). This is also known as [a tagged union or sum type](https://en.wikipedia.org/wiki/Tagged_union), and contains a fixed set of defined possible data types, or `variants`, *exactly one of which must be set*. We use each `variant` to encode a different method. For example `Execute::Refund{}` is a serializable request to refund the escrow, which can only be valid after a timeout.
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
You can see another directive here (`#[serde(rename_all = "snake_case")]`). This ensures the json looks
like: `{"approve": {"quantity": ...}}` instead of `{"Approve": {"quantity": ...}}` and controls the code generated with `Serialize` and `Deserialize`. You see how compile-time codegen (via derive and macros) is a corner-stone of rust, and provides much of the functionality provided by runtime reflection in other, more dynamic, languages.

### JSON Format {#json-format}

When a `ExecuteMsg` instance is encoded, it will end up looking
like `{"approve": {"quantity": [{"amount": "10", "denom": "ATOM"}]}}` or `{"refund": {}}`. This is also the format we
should use client side, when submitting a message body to later be processed by `execute()` in `src/contract.rs`.

### Instantiation Logic {#instantiation-logic}

The `instantiate` function will be called exactly once, before the contract is executed. It is a "privileged" function in that it can set configuration that can never be modified by any other method call. If you look at this example, the first line parses the input from raw bytes into our contract-defined message. We then create the initial config, and check if the contract is expired already. If expired, we return a generic contract error, otherwise, we store the config and return a success code:

```rust
pub fn instantiate(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  msg: InstantiateMsg,
) -> Result<Response, ContractError> {
  let config = Config {
    arbiter: deps.api.addr_validate(&msg.arbiter)?,
    recipient: deps.api.addr_validate(&msg.recipient)?,
    source: info.sender,
    expiration: msg.expiration,
  };

  if let Some(expiration) = msg.expiration {
    if expiration.is_expired(&env.block) {
      return Err(ContractError::Expired { expiration });
    }
  }
  CONFIG.save(deps.storage, &config)?;
  Ok(Response::default())
}
```

`CONFIG` is the `storage` defined in `state.rs` which implements helper functions for automatically serializing and deserializing the stored data, removing some boilerplate.

```rust
pub const CONFIG_KEY: &str = "config";
pub const CONFIG: Item<Config> = Item::new(CONFIG_KEY);
//Item stores one typed item at the given key. This is an analog of Singleton.
```

### Execution Logic {#execution-logic}

Just as `instantiate` is the entry point for instantiating a new contract, `execute` is the entry point for executing the code. CosmWasm parses the incoming JSON-encoded message into a contract-specific `ExecuteMsg` automatically before calling the `execute()` function.

Since `execute` takes an `enum` with multiple `variants`, we can't just jump into the business logic, but first [match](https://doc.rust-lang.org/1.30.0/book/2018-edition/ch06-02-match.html) the received `ExecuteMsg` before dispatching the right handler function. `match` is another nice Rust idiom, and allows you to `switch` over multiple patterns. Here we check the multiple variants of the `ExecuteMsg` enum. Note that if you don't cover all cases, the compiler will refuse to proceed. 
```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  msg: ExecuteMsg,
) -> Result<Response, ContractError> {
  match msg {
    ExecuteMsg::Approve { quantity } => execute_approve(deps, env, info, quantity),
    ExecuteMsg::Refund {} => execute_refund(deps, env, info),
  }
}
```
In both cases, we pass in `deps` to give the handler functions access to runtime callbacks, which provide blockchain-specific logic. In particular, we currently use `deps.api` to validate `String` to `Addr` in a blockchain-specific manner, or verify cryptographic signatures with `secp256k1_verify, ed25519_verify`. We also use `deps.querier` to query the current balance of the contract.

If we now look into the `execute_approve` function, we will see how we can respond to a message. 

* We first see the use of `CONFIG.load` to load the storage without any boilerplate. Note the trailing `?`. This
works on `Result` types, meaning: "If this is an error, return the underlying error. If this is a success, give me the value". It is a very useful shorthand found all over Rust and replaces the `if err != nil { return err }` boilerplate in Go.

* We can return an `Unauthorized` error if the `signer` of the message is not what we expect, and a `ContractError` if our business logic rejects the message. The `let amount =` line shows how we can use pattern matching to use the number of coins present in the msg if provided, or default to the entire balance of the contract.

* Note that `Env` encodes a lot of information from the blockchain, essentially providing the `Context` if you are coming from Cosmos SDK. This is validated data and can be trusted to compare any messages against. Refer
to [the standard `cosmwasm` types](https://github.com/CosmWasm/cosmwasm/blob/v0.10.0/packages/std/src/types.rs#L7-L41) for references to all the available types in the environment.

```rust
fn execute_approve(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  quantity: Option<Vec<Coin>>,
) -> Result<Response, ContractError> {
  let config = CONFIG.load(deps.storage)?;
  if info.sender != config.arbiter {
    return Err(ContractError::Unauthorized {});
  }

  // throws error if the contract is expired
  if let Some(expiration) = config.expiration {
    if expiration.is_expired(&env.block) {
        return Err(ContractError::Expired { expiration });
    }
  }

  let amount = if let Some(quantity) = quantity {
    quantity
  } else {
    // release everything
    // Querier guarantees to return up-to-date data, including funds sent in this handle message
    // https://github.com/CosmWasm/wasmd/blob/master/x/wasm/internal/keeper/keeper.go#L185-L192
    deps.querier.query_all_balances(&env.contract.address)?
  };
  Ok(send_tokens(config.recipient, amount, "approve"))
}
```
At the end, on success, we want to send some tokens. Cosmwasm contracts cannot call other contracts directly, instead, we create a message to represent our request (`BankMsg::Send`) and return it as our contract ends.

This will be parsed by the `wasm` module in go and it will execute and define actions *in the same transaction*. This means, that while we will not get access to the return value, we can be ensured that if the send fails (e.g., user specified more coins than were in the escrow), all state changes in this contract would be reverted... just as if we returned an `Unauthorized` error. This is moved into a helper function to make the code clearer:
```rust
// this is a helper to send the tokens so the business logic is easy to read
fn send_tokens(to_address: Addr, amount: Vec<Coin>, action: &str) -> Response {
  Response::new()
    .add_message(BankMsg::Send {
      to_address: to_address.clone().into(),
      amount,
    })
    .add_attribute("action", action)
    .add_attribute("to", to_address)
}
```
## Adding a New Message {#adding-a-new-message}
Now that we have a better understanding about the structure, we will modify the contract to add some more functionality. In particular, we will add a backdoor to the contract in the form of a `ExecuteMsg::Steal` variant that must be signed by some hard coded `THIEF` address which in turn will release the entire contract balance to the address of the `THIEF` that's included in the message.

Note that this also demonstrates the need to verify the code behind a contract rather than just rely on raw wasm. Since we have a reproducible compilation step, if you are represented some code claimed to belong to a certain contract, you can compile it and compare the resulting hash to the current hash stored on the blockchain, to verify that this really is the original Rust code.
### Adding the Handler {#adding-the-handler}

Open up the file `src/msg.rs` in your [editor of choice](https://docs.cosmwasm.com/docs/1.0/getting-started/installation#setting-up-your-ide) and add another variant to
the `ExecuteMsg` enum, called `Steal`. Remember, it must have a destination address.

[Need a hint?](edit-escrow-hints.md#executemsg)

Now, you can add the message handler. As a quick check, try running `cargo wasm` and look for the compile error in your IDE warning you about non-exhaustive `match` patterns in the `execute()` function. Now, let us add the `ExecuteMsg::Steal` variant to the execute() function and implement the handler function to process incoming "steal" messages. For the top level `THIEF`, you can use a placeholder address in `src/contract.rs` (we will set this to an address you own before deploying).

[Need a hint?](edit-escrow-hints.md#adding-handler)

Once you are done, check that it compiles:

```shell
cargo wasm
```

### Writing a Test {#writing-a-test}

We have a number of tests inside of `contracts.rs` that serve as templates, so let's make use of them. You can copy
the `handle_refund` test and rename it to `handle_steal`. Remember to include the `#[test]` declaration on top. Now, go in and edit it to test that the THIEF can indeed steal the funds, and no one else can. Make sure our backdoor is working properly before we try to use it.

Now, try running `cargo unit-test` and see if your code works as planned. If it fails, try `RUST_BACKTRACE=1 cargo unit-test` to get a full stack trace. 

[See solution here](./edit-escrow-hints#test-steal)
