---
sidebar_position: 1
---

# What are Smart Contracts?

:::note Wikipedia
A smart contract is a computer program or a transaction protocol which is intended to automatically execute, control
or document legally relevant events and actions according to the terms of a contract or an agreement.
The objectives of smart contracts are the reduction of need in trusted intermediators, arbitrations and enforcement
costs, fraud losses, as well as the reduction of malicious and accidental exceptions.
:::

In short: smart contracts are executable logic run on chain. On chain and decentralized execution makes the logic
unstoppable, unbreakable and irreversible. This makes the execution trusted thus validity secured by cryptography.

Smart contracts can represent generalized logic ranging from financial applications to organisational structures.

Here is a great video explanation:

<iframe width="560" height="315" src="https://www.youtube.com/embed/ZE2HxTmxfrI" title="YouTube video player"
frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
allowfullscreen></iframe>

This channel is a first stop for blockchain learners. I highly recommend you explore other videos.

In our context, CosmWasm is the framework that provides code and tooling to develop smart contracts and infrastructure to
run it on chain. For now smart contracts are written using Rust.

Here is a short code snippet showing the smart contract execution logic to help to understand.

```rust
/// This logic is used to transfer tokens/cash from one account to another
pub fn execute_transfer(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    recipient: String,
    amount: Uint128,
) -> Result<Response, ContractError> {
    // here is a validation of amount
    if amount == Uint128::zero() {
        return Err(ContractError::InvalidZeroAmount {});
    }

    let rcpt_addr = deps.api.addr_validate(&recipient)?;

    // balances updated in store
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

    // response returned back to indicate execution is successful and further execution
    let res = Response::new()
        .add_attribute("action", "transfer")
        .add_attribute("from", info.sender)
        .add_attribute("to", recipient)
        .add_attribute("amount", amount);
    Ok(res)
}
```

As you can see smart contracts are not magic. They are very similar to any other programmed logic.

Differences from any backend development are new concepts from cryptography and other disciplines:
  - [hash](https://www.investopedia.com/terms/h/hash.asp)
  - [address](https://www.techslang.com/definition/what-is-a-blockchain-address/)
  - [merkle root](https://www.investopedia.com/terms/m/merkle-root-cryptocurrency.asp)
  - [key-value database](https://www.wikiwand.com/en/Key%E2%80%93value_database)

Of course, there are other concepts: consensus, network security, message
propagation. But these are advanced topics and will not be covered here.
