---
id: edit-escrow-hints
title: Solution to Editing Escrow Contract Section
sidebar_label: Hints
---

## HandleMsg

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum HandleMsg {
    Approve {
        // release some coins - if quantity is None, release all coins in balance
        quantity: Option<Vec<Coin>>,
    },
    Refund {},
    Steal {
        destination: HumanAddr,
    },
}
```

## Adding Handler

Add a global constant:

```rust
// this will be the bech32-encoded address in final code
// we cannot use HumanAddr in const as that is heap allocated... use `HumanAddr::from() later
const THIEF: &str = "changeme";
```

Update the `match` statement in `handle`:

```rust
    match msg {
        HandleMsg::Approve { quantity } => try_approve(&deps.api, env, state, quantity),
        HandleMsg::Refund {} => try_refund(&deps.api, env, state),
        HandleMsg::Steal { destination } => try_steal(&deps.api, env, state, destination),
    }
```

Implement `try_steal`:

```rust
fn try_steal<A: Api>(
    api: &A,
    env: Env,
    _state: State,
    destination: HumanAddr,
) -> Result<Response> {
    if env.message.signer != api.canonical_address(&HumanAddr::from(THIEF))? {
        unauthorized()
    } else {
        let contract = api.human_address(&env.contract.address)?;
        let log = vec![log("action", "safe cracked"), log("to", destination.as_str())];
        let r = Response {
            messages: vec![CosmosMsg::Send {
                from_address: contract,
                to_address: destination,
                amount: env.contract.balance.unwrap_or_default(),
            }],
            log: log,
            data: None,
        };
        Ok(r)
    }
}
```

Note that we have to manually create the send_token logic, as destination is `HumanAddr` not `CanonicalAddr`. The distinction can force more code, but it ensures correctness. Note that you will have to update the imports now. Go up to the top of the file and add `HumanAddr`:

```rust
use cosmwasm::types::{log, CanonicalAddr, Coin, CosmosMsg, Env, HumanAddr, Response};
```

## Test Steal

```rust
#[test]
fn handle_steal() {
    let mut deps = dependencies(40);

    // initialize the store
    let msg = init_msg(1000, 0);
    let env = mock_env_height(&deps.api,"creator", &coin("1000", "earth"), &[], 876, 0);
    let init_res = init(&mut deps, env, msg).unwrap();
    assert_eq!(0, init_res.messages.len());

    // not just "anybody" can steal the funds
    let msg = HandleMsg::Steal { destination: HumanAddr::from("bankvault") };
    let env = mock_env(
        &deps.api,
        "anybody",
        &[],
        &coin("1000", "earth"),
    );
    let handle_res = handle(&mut deps, env, msg.clone());
    assert!(handle_res.is_err());

    // only the master thief
    let env = mock_env(
        &deps.api,
        THIEF,
        &[],
        &coin("1000", "earth")
    );
    let handle_res = handle(&mut deps, env, msg.clone()).unwrap();
    assert_eq!(1, handle_res.messages.len());
    let msg = handle_res.messages.get(0).expect("no message");
    match &msg {
        CosmosMsg::Send {
            from_address: _,
            to_address,
            amount,
        } => {
            assert_eq!(&HumanAddr::from("bankvault"), to_address);
            assert_eq!(1, amount.len());
            let coin = amount.get(0).expect("No coin");
            assert_eq!(coin.denom, "earth");
            assert_eq!(coin.amount, "1000");
        }
        _ => panic!("Unexpected message type"),
    }
}
```
