---
id: edit-escrow-hints
title: Solution to Editing Escrow Contract Section
sidebar_label: Hints
---

## HandleMsg

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HandleMsg {
    Approve {
        // release some coins - if quantity is None, release all coins in balance
        quantity: Option<Vec<Coin>>,
    },
    Refund {},
    Steal {
        destination: String,
    }
}
```

## Adding Handler

Add a global constant:

```rust
const THIEF: &str = "changeme";
```

Update the `match` statement in `handle`:

```rust
    match msg {
        HandleMsg::Approve { quantity } => try_approve(params, state, quantity),
        HandleMsg::Refund {} => try_refund(params, state),
        HandleMsg::Steal { destination } => try_steal(params, state, destination),
    }
```

Implement `try_steal`:

```rust
fn try_steal(params: Params, state: State, destination: String) -> Result<Response> {
    if &params.message.signer != THIEF {
        Unauthorized {}.fail()
    } else {
        let res = Response {
            messages: vec![CosmosMsg::Send {
                from_address: params.contract.address,
                to_address: destination,
                amount: params.contract.balance,
            }],
            log: Some("safe cracked".to_string()),
            data: None,
        };
        Ok(res)
    }
}
```

## Test Steal

```rust
#[test]
fn handle_steal() {
    let mut store = MockStorage::new();

    // initialize the store
    let msg = init_msg(1000, 0);
    let params = mock_params_height("creator", &coin("1000", "earth"), &[], 400, 0);
    let init_res = init(&mut store, params, msg).unwrap();
    assert_eq!(0, init_res.messages.len());

    // not just "anybody" can steal the funds
    let msg = to_vec(&HandleMsg::Steal { destination: "bankvault".to_string()}).unwrap();
    let params = mock_params("anybody", &[], &coin("1000", "earth"));
    let handle_res = handle(&mut store, params, msg.clone());
    assert!(handle_res.is_err());

    // only the master thief
    let params = mock_params(THIEF, &[], &coin("1000", "earth"));
    let handle_res = handle(&mut store, params, msg.clone()).unwrap();
    assert_eq!(1, handle_res.messages.len());
    let msg = handle_res.messages.get(0).expect("no message");
    match &msg {
        CosmosMsg::Send {
            from_address: _,
            to_address,
            amount,
        } => {
            assert_eq!("bankvault", to_address);
            assert_eq!(1, amount.len());
            let coin = amount.get(0).expect("No coin");
            assert_eq!(coin.denom, "earth");
            assert_eq!(coin.amount, "1000");
        }
        _ => panic!("Unexpected message type"),
    }
}
```
