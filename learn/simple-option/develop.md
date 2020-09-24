---
order: 3
---

# Develop Contract

<iframe src="https://player.vimeo.com/video/457702442" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

First test if the starter works, and get your eyes used to rust test results:

```sh
cargo unit-test
   Compiling proc-macro2 v1.0.21
   Compiling unicode-xid v0.2.1
   Compiling syn v1.0.40
   Compiling serde_derive v1.0.116
   Compiling serde v1.0.116
   Compiling autocfg v1.0.1
   Compiling ryu v1.0.5
   Compiling libc v0.2.77
   Compiling serde_json v1.0.57
   Compiling itoa v0.4.6
   Compiling adler v0.2.3
   Compiling doc-comment v0.3.3
   Compiling gimli v0.22.0
   Compiling schemars v0.7.6
   Compiling rustc-demangle v0.1.16
   Compiling object v0.20.0
   Compiling cfg-if v0.1.10
   Compiling base64 v0.11.0
   Compiling miniz_oxide v0.4.2
   Compiling quote v1.0.7
   Compiling addr2line v0.13.0
   Compiling backtrace v0.3.50
   Compiling serde_derive_internals v0.25.0
   Compiling schemars_derive v0.7.6
   Compiling snafu-derive v0.6.8
   Compiling snafu v0.6.8
   Compiling serde-json-wasm v0.2.1
   Compiling cosmwasm-std v0.10.1
   Compiling cosmwasm-schema v0.10.1
   Compiling cosmwasm-storage v0.10.1
   Compiling simple-option v0.1.0 (~/simple-option)
    Finished test [unoptimized + debuginfo] target(s) in 1m 19s
     Running target/debug/deps/simple_option-8ba137e113720990

running 4 tests
test contract::tests::proper_initialization ... ok
test contract::tests::transfer ... ok
test contract::tests::burn ... ok
test contract::tests::execute ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

All good.

::: tip
Timecode [https://vimeo.com/457702442#t=39s](https://vimeo.com/457702442#t=39s)
:::

[src/lib.rs](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/lib.rs) file contains wasm bindings. Wraps smart contract *(handle, init, query)* functions around rust functions. If you are not doing advanced wasm tweaking, don't touch it.

## Messages

::: tip
Timecode [https://vimeo.com/457702442#t=1m46s](https://vimeo.com/457702442#t=1m46s)
:::

Development begins in [src/msg.rs](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/msg.rs) which contains the input data structures of the smart contract.

### InitMsg

We will begin with [`InitMsg`](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/msg.rs#L7-L12). This struct has the initial values that initializes smart contract from the code and feeds in the data required for logic setup.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InitMsg {
    // owner and creator come from env
    // collateral comes from env
    pub counter_offer: Vec<Coin>,
    pub expires: u64,
}
```

`#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]` implements specified traits for this structure using macros. More read [Rust docs / Derive](https://doc.rust-lang.org/stable/rust-by-example/trait/derive.html)

::: warning
* _Owner_, _creator_ and _collateral_ comes from message transaction context, meaning owner and creator is the address signed the tx and collateral is funds sent along the message.
* _counter_offer_ is [strike price](https://www.investopedia.com/terms/s/strikeprice.asp).
:::

### HandleMsg

Contract execution is branched using `HandleMsg` enum. Each field defines a message and content of that message.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum HandleMsg {
    /// Owner can transfer to a new owner
    Transfer { recipient: HumanAddr },
    /// Owner can post counter_offer on unexpired option to execute and get the collateral
    Execute {},
    /// Burn will release collateral if expired
    Burn {},
}
```

::: tip
Canonical and Human Addresses
Canonical Addresses represent binary format of crypto addresses.
Human Addresses on the other hand are great for the UI. They are always a subset of ascii text, and often contain security checks - such as chain-prefix in Bech32, e.g. cosmos1h57760w793q6vh06jsppnqdkc4ejcuyrrjxnke

`canonicalize(humanize(canonical_addr)) == canonical_addr`

For more details: [Names and Addresses](https://docs.cosmwasm.com/architecture/addresses.html)
:::

### QueryMsg

Smart contract state querying is branched using `QueryEnum`. We will implement smart contract `Config` query later.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Config {},
}
```

## State

::: tip
Timecode [https://vimeo.com/457702442#t=7m36s](https://vimeo.com/457702442#t=7m36s)
:::

[State](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/state.rs) handles state of the database where smart contract data is stored and accessed.

You have two options when modeling state:
1. **Singleton**: contract saves only one instance of the structure using unique db key. We will use this in this tutorial.
2. **Structured store**: models can be structured and stored dynamically. You can form one-to-one, one-to-many and many-to-many relations with indexing and lookup functionality.

```rust
// configuration instance key. config object will be saved under this key.
pub static CONFIG_KEY: &[u8] = b"config";

// contract state structure, this will be saved.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub creator: HumanAddr,
    pub owner: HumanAddr,
    pub collateral: Vec<Coin>,
    pub counter_offer: Vec<Coin>,
    pub expires: u64,
}

// returns a bucket to read/write to store.
pub fn config<S: Storage>(storage: &mut S) -> Singleton<S, State> {
    singleton(storage, CONFIG_KEY)
}

// returns a readonly bucket only read store.
// Safer to use read_only when no need to write like querying.
pub fn config_read<S: Storage>(storage: &S) -> ReadonlySingleton<S, State> {
    singleton_read(storage, CONFIG_KEY)
}

// this is optional.
// ConfigResponse as returned as response structure to query_config.
// good to have aliasing.
pub type ConfigResponse = State;
```


## Contract Handlers

::: tip
Timecode [https://vimeo.com/457702442#t=11m12s](https://vimeo.com/457702442#t=11m12s)
:::

Lego bricks **msgs**, **handler** and **state** are defined. Now we need to bind them together in [contract.rs](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/contract.rs).

### Init

The init function will be called exactly once, before the contract is executed. It is a "privileged" function in that it can set configuration that can never be modified by any other method call.
the first line parses the input from raw bytes into our contract-defined message. We then check if option is expired, then create the initial state. If expired, we return a generic contract error, otherwise, we store the state and return a success code:

```rust
pub fn init<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    msg: InitMsg,
) -> StdResult<InitResponse> {
    if msg.expires <= env.block.height {
        return Err(StdError::generic_err("Cannot create expired option"));
    }

    let state = State {
        creator: env.message.sender.clone(),
        owner: env.message.sender.clone(),
        collateral: env.message.sent_funds,
        counter_offer: msg.counter_offer,
        expires: msg.expires,
    };

    config(&mut deps.storage).save(&state)?;

    Ok(InitResponse::default())
}
```

The function is simple as it looks. Option expiration date check, save the state, and return response.

```rust
pub fn init<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    msg: InitMsg,
) -> StdResult<InitResponse>
```

You will see this signature all over CosmWasm handler functions. Execution context passed in to handler using Deps, which contains Storage, API and Querier functions; Env, which contains block, message and contract info; and msg, well, no explanation needed.

`StdResult<T>` is a type that represents either success ([`Ok`]) or failure ([`Err`]). If the execution is successful returns `T` type otherwise returns `StdError`. Useful.

### Handle

::: tip
Timecode [https://vimeo.com/457702442#t=15m55s](https://vimeo.com/457702442#t=15m55s)
:::

`handle` method routes messages to functions. It is similar to Cosmos SDK handler design.

```rust
pub fn handle<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    msg: HandleMsg,
) -> StdResult<HandleResponse> {
    match msg {
        HandleMsg::Transfer { recipient } => handle_transfer(deps, env, recipient),
        HandleMsg::Execute {} => handle_execute(deps, env),
        HandleMsg::Burn {} => handle_burn(deps, env),
    }
}
```

#### Transfer

```rust
pub fn handle_transfer<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    recipient: HumanAddr,
) -> StdResult<HandleResponse> {
    // ensure msg sender is the owner
    let mut state = config(&mut deps.storage).load()?;
    /*
     * Question (?) mark at the end is a syntactic sugar.
     * If the result of load is an error, return the error.
     * Otherwise set the state to the returned value.
     */
    if env.message.sender != state.owner {
        return Err(StdError::unauthorized());
    }

    // set new owner on state
    state.owner = recipient.clone();
    config(&mut deps.storage).save(&state)?;

    let mut res = Context::new();
    res.add_log("action", "transfer");
    res.add_log("owner", recipient);
    /*
     * logs will go to the cosmos sdk event log.
     */
    Ok(res.into())
    /*
     * res.into converts Context to HandleResponse.
     */
}
```


#### Execute

You will see `handle_execute` in plus and example smart contracts, but actually it is just a naming, nothing special.
Most of the function is same with `transfer`. Just two new things: message fund check and sdk messages in return context.

```rust
pub fn handle_execute<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
) -> StdResult<HandleResponse> {
    // ensure msg sender is the owner
    let state = config(&mut deps.storage).load()?;
    if env.message.sender != state.owner {
        return Err(StdError::unauthorized());
    }

    // ensure not expired
    if env.block.height >= state.expires {
        return Err(StdError::generic_err("option expired"));
    }

    /*
     * env.message.sent_funds is the coins sent along the tx.
     */
    // ensure sending proper counter_offer
    if env.message.sent_funds != state.counter_offer {
        return Err(StdError::generic_err(format!(
            "must send exact counter offer: {:?}",
            state.counter_offer
        )));
    }

    // release counter_offer to creator
    let mut res = Context::new();

    /*
     * CosmWasm smart contract cannot execute native Cosmos SDK messages
     * such as bank send msg. Instead we return native messages in the execution context
     * to be processed by Cosmos SDK transaction runtime.
     */
    res.add_message(BankMsg::Send {
        from_address: env.contract.address.clone(),
        to_address: state.creator,
        amount: state.counter_offer,
    });

    // release collateral to sender
    res.add_message(BankMsg::Send {
        from_address: env.contract.address,
        to_address: state.owner,
        amount: state.collateral,
    });

    // delete the option
    config(&mut deps.storage).remove();

    res.add_log("action", "execute");
    Ok(res.into())
}
```

### Query

This contracts query method is very simple, only configuration query.
For more complex queries check [cosmwasm-plus](https://github.com/CosmWasm/cosmwasm-plus/) contracts.
If you are starting to learn from zero, now you have 20 minutes of cosmwasm experience. Go ahead skim plus contracts to see the simplicity.

```rust
pub fn query<S: Storage, A: Api, Q: Querier>(
    deps: &Extern<S, A, Q>,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        /*
         * Client will parse binary
         */
        QueryMsg::Config {} => to_binary(&query_config(deps)?),
    }
}

fn query_config<S: Storage, A: Api, Q: Querier>(
    deps: &Extern<S, A, Q>,
) -> StdResult<ConfigResponse> {
    let state = config_read(&deps.storage).load()?;
    Ok(state)
}
```

### Build

To simply build the code and see if it works:

```sh
cargo build
```

### Tooling

It is good to keep the same coding style across smart contracts for readability:

```sh
cargo fmt
```

Normally Rust compiler does its job great, leads you to the solution for the errors shows warnings etc.
But it is good to throw some linter to the code.

Install clippy.
```sh
rustup update
rustup component add clippy
```

```sh
cargo clippy -- -D warnings
```

### Compile

This section compiles key commands from [Compiling Contract](https://docs.cosmwasm.com/getting-started/compile-contract.html) doc. For more detailed read proceed to the documentation.

Basic compilation:

```sh
cargo wasm
```

Optimized compilation:

```sh
RUSTFLAGS='-C link-arg=-s' cargo wasm
```

Reproducible and optimized compilation:

```sh
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.10.3
```

You want to use the command above before deploying to the chain.

### Schema

We can also generate JSON Schemas that serve as a guide for anyone trying to use the contract. This is mainly for documentation purposes, but if you click on "Open TypeScript definitions" in the code explorer, you can see how we use those to generate TypeScript bindings.

```sh
cargo schema
```

You can see the generated schemas under [simple-option/schema](https://github.com/CosmWasm/cosmwasm-examples/tree/master/simple-option/schema)

```
schema
├── config_response.json
├── handle_msg.json
├── init_msg.json
└── query_msg.json
```

Go ahead and explore schemas.
