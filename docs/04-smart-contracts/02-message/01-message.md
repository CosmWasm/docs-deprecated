---
sidebar_position: 1
---

# Messages

Messages are how you interact with a CosmWasm smart contract. If you look inside most contracts, there will be a
`msg.rs` file that defines the messages.

An instantiate message is usually different in that it is defined separately in `msg.rs` as `InstantiateMsg` and then
handled by a `instantiate` fn in the main `contract.rs`.

The examples we are using here are very simple, however if you are confused about what arguments can be passed, you can
look in the contract's `schema` folder. In here you will see at least two relevant files:

- `instantiate_msg.json` - the expected shape and and types for the instantiate message
- `execute_msg.json` - the expected shape and types for each of the messages that the contract can use to execute an
  action

Some contracts with large API areas have many more schema files, so explore them to find the message or command you're
looking for.

In the nameservice example contract, there are only two valid messages once the contract has been instantiated:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
  Register { name: String },
  Transfer { name: String, to: String },
}
```

The context of this code is
[here](https://github.com/InterWasm/cw-contracts/blob/main/contracts/nameservice/src/msg.rs#L13).

This can then be worked with in `contract.rs`. Each of these will be handled in the `execute` function like so:

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  msg: ExecuteMsg,
) -> Result<Response, ContractError> {
  match msg {
    ExecuteMsg::Register { name } => execute_register(deps, env, info, name),
    ExecuteMsg::Transfer { name, to } => execute_transfer(deps, env, info, name, to),
  }
}
```

The source code for
the [execute function](https://github.com/InterWasm/cw-contracts/blob/main/contracts/nameservice/src/contract.rs#L31).
