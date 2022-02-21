---
sidebar_position: 3
---

# Complex State and Maps

Of course, for most non-trivial examples, additional data will need to be stored. You can serialise larger JSON data
structures, and use key-value lookups to access this data.

In CW20, the mapping of addresses to their CW20 balance is achieved through just such a map:

```rust
pub const BALANCES: Map<&Addr, Uint128> = Map::new("balance");
```

The code for this can be
found [here](https://github.com/CosmWasm/cw-plus/blob/main/contracts/cw20-base/src/state.rs#L35).

You can see how it is interacted with
in `contract.rs` [here](https://github.com/CosmWasm/cw-plus/blob/main/contracts/cw20-base/src/contract.rs#L303). The
relevant snippet is:

```rust
let rcpt_addr = deps.api.addr_validate( & recipient) ?;
BALANCES.update(
deps.storage,
& rcpt_addr,
| balance: Option<Uint128> | -> StdResult<_ > { Ok(balance.unwrap_or_default() + amount) },
) ?;
```

There's a bit going on here, so let's unpack it.

1. `deps.storage` is passed in. This is from the contract context. `deps` is similar to the `ctx` you will have seen in
   the Cosmos SDK.
2. `&rcpt_addr` is a borrowed reference to the validated recipient address - it is valid, or the `let` statement would
   have errored. This is the key half of the key/value pair.
3. The third statement is a lambda (anonymous function) returning `StdResult` that does some computation based on the
   current value of `balance`, where `balance` is the value half, and `&rcpt_addr` is the key.

More sophisticated contracts, such as CW1155, allow for the creation and management of multiple coins.

For more advanced usage, indexing and more, check out:

- [Indexes in CosmWasm](https://docs.cosmwasm.com/tutorials/storage/indexes)
- [Advanced State Modeling in CosmWasm](https://docs.cosmwasm.com/tutorials/storage/state-modeling)
- [How CW Storage Works](https://docs.cosmwasm.com/tutorials/storage/key-value-store)
