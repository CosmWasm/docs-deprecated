---
sidebar_position: 4
---

# Entry points

Entry points, or _handlers_ are where messages or queries are handled by the contract.

All three of the functions we will be talking about are explicitly flagged as entry points, and excluded from being
bundled in the library:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
  deps: DepsMut,
  _env: Env,
  _info: MessageInfo,
  msg: InstantiateMsg,
) -> Result<Response, StdError> {
  // ...etc
}
```

These handlers are:

1. Instantiate messages, as defined by the `InstantiateMsg` struct, are handled by `instantiate`.
2. Messages, as defined by the `ExecuteMsg` enum, are handled by the `execute` function, using a
   pattern-matching `match` statement.
3. Queries, as defined by the `QueryMsg` enum, are handled by the `query` function, using a pattern-match.

`execute` and `query` must exhaustively match every variant in the enums they handle, while `instantiate` only has to
deal with the struct it is passed.

Typically, `instantiate` and `execute` have the type `Result<Response, ContractError>`, while `query`
has `StdResult<Binary>` due to the underlying Cosmos SDK `Querier`.
