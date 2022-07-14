---
sidebar_position: 6
---

# Events

Most entry point functions return a type of `Result<Response, ContractError>`.

Within this, `Response` is a wrapper around [Events](https://docs.cosmos.network/main/core/events.html) in the Cosmos
SDK.

The `Response` type should be returned as the successful result of a contract entry point (i.e. `instantiate`
or `execute`). You can declare it as mutable and add to it in the function body, but a more common pattern is to
construct it at the end and return it, if all computation has succeeded. In the examples that follow, it is wrapped
by `Ok` as it is being returned as part of a function that is returning the `Result` type, with `Response` representing
the `Right` or success branch.

The exception to this is `query`, which will return `StdResult<Binary>` due to the Cosmos SDK interface.

The source for Response
can [help to understand it better](https://github.com/CosmWasm/cosmwasm/blob/main/packages/std/src/results/response.rs#L65)
.

The most simple usage of `Response` is as follows:

```rust
Ok(Response::default ())
```

This is common
in [instantiate functions](https://github.com/CosmWasm/cw-plus/blob/main/contracts/cw20-base/src/contract.rs#L151),
where no message is returned to the client.

However, in most `execute` handling cases, a `Response` should be returned:

```rust
let res = Response::new()
.add_attribute("action", "transfer")
.add_attribute("from", info.sender)
.add_attribute("to", recipient)
.add_attribute("amount", amount);
Ok(res)
```

There's a bit more going on here, so let's unpack it. You can find the
source [here](https://github.com/CosmWasm/cw-plus/blob/main/contracts/cw20-base/src/contract.rs#L239).

1. A new `Response` is created
2. Several key/value pairs are added
3. This is returned wrapped in a `Result` type using `Ok`

If you're calling your contract via the command-line interface (CLI) you will see them logged as part of the `"raw_log"`
response, alongside other SDK events.

Instead of just adding attributes, `.add_event` can be used to add an unwrapped event.

These events can be interacted with by other clients or contracts.
