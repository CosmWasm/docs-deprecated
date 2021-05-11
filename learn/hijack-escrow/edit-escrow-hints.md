---
order: 3
---

# Hints

**!! SPOILER ALERT !!**

This sections contains solutions to previous section's questions.

## ExecuteMsg

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Approve {
        // release some coins - if quantity is None, release all coins in balance
        quantity: Option<Vec<Coin>>,
    },
    Refund {},
}
```

## Adding Handler

Add a global constant:

```rust
// this will be the bech32-encoded address in final code
// we cannot use Addr in const as that is heap allocated... use `Addr::from() later
const THIEF: &str = "changeme";
```

Update the `match` statement in `handle`:

```rust
    match msg {
        ExecuteMsg::Approve { quantity } => try_approve(deps, env, state, quantity),
        ExecuteMsg::Refund {} => try_refund(deps, env, state),
        ExecuteMsg::Steal { destination } => try_steal(deps, env, state, destination),
    }
```

Implement `try_steal`:

```rust
fn try_steal(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    _state: State,
    destination: String,
) -> Result<Response, ContractError> {
    if info.sender != deps.api.addr_validate(THIEF)? {
        Err(StdError::unauthorized())
    } else {
        let contract_address = env.contract.address;
        let amount = deps.querier.query_all_balances(&contract_address)?;
        let attributes = vec![attr("action", "safe cracked"), log("to", destination.as_str())];
        let r = Response {
            submessages: vec![],
            messages: vec![CosmosMsg::Bank(BankMsg::Send {
                from_address: contract_address,
                to_address: destination,
                amount,
            })],
            attributes,
            data: None,
        };
        Ok(r)
    }
}
```

## Test Steal

```rust
#[test]
fn handle_steal() {
    let mut deps = mock_dependencies(20, &[]);

    // initialize the store
    let init_amount = coins(1000, "earth");
    let init_env = mock_env_height("creator", &init_amount, 876, 0);
    let msg = init_msg_expire_by_height(1000);
    let init_res = init(&mut deps, init_env, msg).unwrap();
    assert_eq!(0, init_res.messages.len());

    // balance changed in init
    deps.querier.update_balance(MOCK_CONTRACT_ADDR, init_amount);

    // not just "anybody" can steal the funds
    let msg = ExecuteMsg::Steal {
        destination: HumanAddr::from("bankvault"),
    };
    let env = mock_env_height("anybody", &[], 900, 0);
    let execute_res = execute(&mut deps, env, msg.clone());
    assert!(execute_res.is_err());

    // only the master thief
    let msg = ExecuteMsg::Steal {
        destination: HumanAddr::from("hideout"),
    };
    let env = mock_env_height(THIEF, &[], 900, 0);
    let execute_res = execute(&mut deps, env, msg.clone()).unwrap();
    assert_eq!(1, execute_res.messages.len());
    let msg = execute_res.messages.get(0).expect("no message");
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
