---
title: Hints
---

# Solution to Editing Escrow Contract Section

## HandleMsg

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
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
        HandleMsg::Approve { quantity } => try_approve(deps, env, state, quantity),
        HandleMsg::Refund {} => try_refund(deps, env, state),
        HandleMsg::Steal { destination } => try_steal(deps, env, state, destination),
    }
```

Implement `try_steal`:

```rust
fn try_steal<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    _state: State,
    destination: HumanAddr,
) -> HandleResult {
    if env.message.sender != deps.api.canonical_address(&HumanAddr::from(THIEF))? {
        Err(StdError::unauthorized())
    } else {
        let contract_address_human = deps.api.human_address(&env.contract.address)?;
        let amount = deps.querier.query_all_balances(&contract_address_human)?;
        let log = vec![log("action", "safe cracked"), log("to", destination.as_str())];
        let r = HandleResponse {
            messages: vec![CosmosMsg::Bank(BankMsg::Send {
                from_address: contract_address_human,
                to_address: destination,
                amount,
            })],
            log,
            data: None,
        };
        Ok(r)
    }
}
```

Note that we have to manually create the send_token logic, as destination is `HumanAddr` not `CanonicalAddr`. The distinction can force more code, but it ensures correctness. Note that you will have to update the imports now. Go up to the top of the file and add `HumanAddr`:

```rust
use cosmwasm_std::{
    log, to_binary, Api, BankMsg, Binary, CanonicalAddr, Coin, CosmosMsg, Env, Extern,
    HandleResponse, HandleResult, HumanAddr, InitResponse, InitResult, Querier, StdError,
    StdResult, Storage,
};
```

## Test Steal

```rust
#[test]
fn handle_steal() {
    let mut deps = mock_dependencies(20, &[]);

    // initialize the store
    let init_amount = coins(1000, "earth");
    let init_env = mock_env_height(&deps.api, "creator", &init_amount, 876, 0);
    let msg = init_msg_expire_by_height(1000);
    let init_res = init(&mut deps, init_env, msg).unwrap();
    assert_eq!(0, init_res.messages.len());

    // balance changed in init
    deps.querier.update_balance(MOCK_CONTRACT_ADDR, init_amount);

    // not just "anybody" can steal the funds
    let msg = HandleMsg::Steal {
        destination: HumanAddr::from("bankvault"),
    };
    let env = mock_env_height(&deps.api, "anybody", &[], 900, 0);
    let handle_res = handle(&mut deps, env, msg.clone());
    assert!(handle_res.is_err());

    // only the master thief
    let msg = HandleMsg::Steal {
        destination: HumanAddr::from("hideout"),
    };
    let env = mock_env_height(&deps.api, THIEF, &[], 900, 0);
    let handle_res = handle(&mut deps, env, msg.clone()).unwrap();
    assert_eq!(1, handle_res.messages.len());
    let msg = handle_res.messages.get(0).expect("no message");
    assert_eq!(
        msg,
        &CosmosMsg::Bank(BankMsg::Send {
            from_address: HumanAddr::from(MOCK_CONTRACT_ADDR),
            to_address: HumanAddr::from("hideout"),
            amount: coins(1000, "earth"),
        })
    );
}
```

You will also have to add `MOCK_CONTRACT_ADDR` to the test imports, like:

```rust
use cosmwasm_std::testing::{mock_dependencies, mock_env, MOCK_CONTRACT_ADDR};
```
