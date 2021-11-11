---
sidebar_position: 2
---

# Result and Option

In Rust, using `Result` and `Option` types is very common. If you've used `fp-ts` in Typescript, functional features in
a language like Scala, or a strongly-typed functional language like Haskell, these should be familiar to you.

Both of these types are containers, or enum types. That is, they contain other values within variants.

If you're familiar with Algebraic Data types, it might be enough to say that these are effectively:

```rust

enum Option<T> {
  Some(T),
  // existence
  None, // non-existence
}

enum Result<T, E> {
  Ok(T),
  // success
  Err(E), // failure
}
```

## Result

`Result` is an enum type, `Result<T, E>`, where both `T` and `E` are generics, representing success and failure. These
are called like so:

- `Ok(T)` - a `Result` container which has succeeded, containing `T`
- `Err(E)` - a `Result` container which has failed, containing `E`

A result type is conceptually similar to an `Either` in other functional languages. Many contract entry points are typed
`Result<Response, ContractError>`. In this case, `Response` is the `Right` or `Success` branch, while `ContractError` is
the `Left` or failure case.

`Result` types are not just used in entry points and handlers, however.

They are often used in functions used to match enums, for example in `execute` entry points.

We can see in CW20-base that `execute` is typed `Result<Response, ContractError>`. Let's look at the function call in
the first branch, which matches `ExecuteMsg::Transfer`.

```rust
execute_transfer(deps, env, info, recipient, amount)
```

We might expect the match branches to call functions that are typed the same as the entry point.
And [they are](https://github.com/CosmWasm/cw-plus/blob/main/contracts/cw20-base/src/contract.rs#L173).

```rust
pub fn execute_transfer(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  recipient: String,
  amount: Uint128,
) -> Result<Response, ContractError> {
  if amount == Uint128::zero() {
    return Err(ContractError::InvalidZeroAmount {});
  }

  let rcpt_addr = deps.api.addr_validate(&recipient)?;

  BALANCES.update(
    deps.storage,
    &info.sender,
    |balance: Option<Uint128>| -> StdResult<_> {
      Ok(balance.unwrap_or_default().checked_sub(amount)?)
    },
  )?;
  BALANCES.update(
    deps.storage,
    &rcpt_addr,
    |balance: Option<Uint128>| -> StdResult<_> { Ok(balance.unwrap_or_default() + amount) },
  )?;

  let res = Response::new()
    .add_attribute("action", "transfer")
    .add_attribute("from", info.sender)
    .add_attribute("to", recipient)
    .add_attribute("amount", amount);
  Ok(res)
}
```

### StdResult

It's also worth being aware of `StdResult`. This is used often in `query` handlers and functions that are called from
them.

For example, in
the [nameservice contract](https://github.com/CosmWasm/cw-examples/blob/main/contracts/nameservice/src/contract.rs#L95)
you can see the
`StdResult`, which is like `Result`, except without a defined error branch:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
  match msg {
    QueryMsg::ResolveRecord { name } => query_resolver(deps, env, name),
    QueryMsg::Config {} => to_binary(&config_read(deps.storage).load()?),
  }
}
```

Let's see the implementation of `query_resolver`.

```rust
fn query_resolver(deps: Deps, _env: Env, name: String) -> StdResult<Binary> {
  let key = name.as_bytes();

  let address = match resolver_read(deps.storage).may_load(key)? {
    Some(record) => Some(String::from(&record.owner)),
    None => None,
  };
  let resp = ResolveRecordResponse { address };

  to_binary(&resp)
}
```

The key takeaway here is that generally you can ignore container types, so long as they all line up. Once all your types
are correct, your code will compile. Then you simply need to match or unwrap your container types correctly to work with
the values contained within.

## Option

In Rust, there is no concept of `nil` or `null`, unlike most other mainstream programming languages. Instead, you have
the `Option` type, which encodes the idea of existence or non-existence into a container type.

`Option<T>` is an enum type, with two variants:

- `Some(<wrapped-value>)` - `Some` wraps an inner value, which can be accessed via `.unwrap()`. You will see this, as
  well as matching, all over rust code.
- `None` - `None`

It's useful for doing things like expressing that a value might not exist for a key in a struct:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
  pub purchase_price: Option<Coin>,
  pub transfer_price: Option<Coin>,
}
```

The source is [here](https://github.com/InterWasm/cw-contracts/blob/main/contracts/nameservice/src/state.rs#L13). We can
see why this might be - these values come from
[instantiation](https://github.com/InterWasm/cw-contracts/blob/main/contracts/nameservice/src/msg.rs#L6), where the values
are also `Option`:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
  pub purchase_price: Option<Coin>,
  pub transfer_price: Option<Coin>,
}
```

In the `Result` examples above, we saw an example of `Option` usage. When we try and read the storage, there will either
be a result, or nothing. To handle situations like this, it's common to use the `match` operator to pattern match the
two cases:

```rust
let address = match resolver_read(deps.storage).may_load(key)? {
Some(record) => Some(String::from( & record.owner)),
None => None,
};
```

In cases where `None` being returned would be an error state, convention dictates you should consider throwing an error
instead of handling the `None`.
