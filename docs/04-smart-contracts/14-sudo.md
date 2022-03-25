---
sidebar_position: 14
---

# Sudo Execution

One of the wonders of Cosmos SDK is [governance](https://docs.cosmos.network/v0.44/modules/gov/).
Network participants can vote on proposals to decide the future of the network, and proposals can contain messages
that will be executed based on the result of the voting.

We can define smart contract entry point to smart contract with sudo access which can not be called by users or other smart contracts
but only by trusted native Cosmos modules. So sudo is not only for governance.

First we need a msg type:

```rust
/// SudoMsg is only exposed for internal Cosmos SDK modules to call.
/// This is showing how we can expose "admin" functionality than can not be called by
/// external users or contracts, but only trusted (native/Go) code in the blockchain
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum SudoMsg {
    MoveFunds {
        recipient: String,
        amount: Vec<Coin>,
    },
}
```

Then the entry point:

```rust
#[entry_point]
pub fn sudo(_deps: DepsMut, _env: Env, msg: SudoMsg) -> Result<Response, HackError> {
    match msg {
        SudoMsg::MoveFunds { recipient, amount } => {
            let msg = BankMsg::Send {
                to_address: recipient,
                amount,
            };
            Ok(Response::new().add_message(msg))
        }
    }
}
```

## Proposal

Smart contract must be instantiated before governance execution.

Sudo execution proposal client interface is similar to any proposal.

```shell
wasmd tx gov submit-proposal sudo-contract [contract_addr_bech32] [json_encoded_migration_args] [flags]
```

`json_encoded_migration_args` accepts json encoded `SudoMsg`.

```json
{
  "move_funds": {
    "amount": "100000",
    "recipient": "wasm126kmp3ceapx2gxrju3uruxd2d440raxaz8xa90"
  }
}
```
