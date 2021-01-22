---
order: 4
---

# Testing

<iframe src="https://player.vimeo.com/video/457705991" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

At this point your code should be compiling, although we did not test if it works.
You can deploy the code to the chain everytime when you make a change. But come on, your time is more valuable than that.
Also, good to keep the contract break-free and tested for future changes.

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info, MOCK_CONTRACT_ADDR};
    use cosmwasm_std::{attr, coins, CosmosMsg};
```

This is how testing in Rust begins. [Code reference](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/contract.rs).
You can keep test and code in the same or separate files.

## Test Initialization

::: tip
Timecode [https://vimeo.com/457705991#t=3m34s](https://vimeo.com/457705991#t=3m34s)
:::

For each test, test specific variables such as block time, state must be mocked. Write a function for easy setup.

```rust
#[test]
fn proper_initialization() {
    let mut deps = mock_dependencies(&[]);

    let msg = InitMsg {
        counter_offer: coins(40, "ETH"),
        expires: 100_000,
    };
    let info = mock_info("creator", &coins(1, "BTC"));

    // we can just call .unwrap() to assert this was a success
    let res = init(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // it worked, let's query the state
    let res = query_config(deps.as_ref()).unwrap();
    assert_eq!(100_000, res.expires);
    assert_eq!("creator", res.owner.as_str());
    assert_eq!("creator", res.creator.as_str());
    assert_eq!(coins(1, "BTC"), res.collateral);
    assert_eq!(coins(40, "ETH"), res.counter_offer);
}
```

Good we now have a test environment initializer. This is a very simple one, you can pass in variables to the function and do different tweaks.
Check cosmwasm-plus for more.

### Mock Dependencies, Environment, and Message Info

There are two three mocking tools we should improve on:

```rust
/// All external requirements that can be injected for unit tests.
/// It sets the given balance for the contract itself, nothing else
pub fn mock_dependencies(
    contract_balance: &[Coin],
) -> OwnedDeps<MockStorage, MockApi, MockQuerier> {
    let contract_addr = HumanAddr::from(MOCK_CONTRACT_ADDR);
    OwnedDeps {
        storage: MockStorage::default(),
        api: MockApi::default(),
        querier: MockQuerier::new(&[(&contract_addr, contract_balance)]),
    }
}
```

This sets up dependencies for testing such as storage, api, and querier.

```rust
/// Returns a default enviroment with height, time, chain_id, and contract address
/// You can submit as is to most contracts, or modify height/time if you want to
/// test for expiration.
///
/// This is intended for use in test code only.
pub fn mock_env() -> Env {
    Env {
        block: BlockInfo {
            height: 12_345,
            time: 1_571_797_419,
            time_nanos: 879305533,
            chain_id: "cosmos-testnet-14002".to_string(),
        },
        contract: ContractInfo {
            address: HumanAddr::from(MOCK_CONTRACT_ADDR),
        },
    }
}
```

`mock_env` is for mocking block, and contract environment.

```rust
/// Just set sender and sent funds for the message. The essential for
/// This is intended for use in test code only.
pub fn mock_info<U: Into<HumanAddr>>(sender: U, sent: &[Coin]) -> MessageInfo {
    MessageInfo {
        sender: sender.into(),
        sent_funds: sent.to_vec(),
    }
}
```

`mock_info` is for mocking transaction environment.

## Test Handler

::: tip
Timecode [https://vimeo.com/457705991#t=7m34s](https://vimeo.com/457705991#t=7m34s)
:::

### Test Transfer Handler

```rust
#[test]
fn transfer() {
    let mut deps = mock_dependencies(&[]);

    let msg = InitMsg {
        counter_offer: coins(40, "ETH"),
        expires: 100_000,
    };
    let info = mock_info("creator", &coins(1, "BTC"));

    // we can just call .unwrap() to assert this was a success
    let res = init(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // random cannot transfer
    let info = mock_info("anyone", &[]);
    let err = handle_transfer(deps.as_mut(), mock_env(), info, HumanAddr::from("anyone"))
        .unwrap_err();
    match err {
        ContractError::Unauthorized {} => {}
        e => panic!("unexpected error: {}", e),
    }

    // owner can transfer
    let info = mock_info("creator", &[]);
    let res =
        handle_transfer(deps.as_mut(), mock_env(), info, HumanAddr::from("someone")).unwrap();
    assert_eq!(res.attributes.len(), 2);
    assert_eq!(res.attributes[0], attr("action", "transfer"));

    // check updated properly
    let res = query_config(deps.as_ref()).unwrap();
    assert_eq!("someone", res.owner.as_str());
    assert_eq!("creator", res.creator.as_str());
}
```

### Test Execute

::: tip
Timecode [https://vimeo.com/457705991#t=14m21s](https://vimeo.com/457705991#t=14m21s)
:::

```rust
#[test]
fn execute() {
    let mut deps = mock_dependencies(&[]);

    let amount = coins(40, "ETH");
    let collateral = coins(1, "BTC");
    let expires = 100_000;
    let msg = InitMsg {
        counter_offer: amount.clone(),
        expires: expires,
    };
    let info = mock_info("creator", &collateral);

    // we can just call .unwrap() to assert this was a success
    let _ = init(deps.as_mut(), mock_env(), info, msg).unwrap();

    // set new owner
    let info = mock_info("creator", &[]);
    let _ = handle_transfer(deps.as_mut(), mock_env(), info, HumanAddr::from("owner")).unwrap();

    // random cannot execute
    let info = mock_info("creator", &amount);
    let err = handle_execute(deps.as_mut(), mock_env(), info).unwrap_err();
    match err {
        ContractError::Unauthorized {} => {}
        e => panic!("unexpected error: {}", e),
    }

    // expired cannot execute
    let info = mock_info("owner", &amount);
    let mut env = mock_env();
    env.block.height = 200_000;
    let err = handle_execute(deps.as_mut(), env, info).unwrap_err();
    match err {
        ContractError::OptionExpired { expired } => assert_eq!(expired, expires),
        e => panic!("unexpected error: {}", e),
    }

    // bad counter_offer cannot execute
    let msg_offer = coins(39, "ETH");
    let info = mock_info("owner", &msg_offer);
    let err = handle_execute(deps.as_mut(), mock_env(), info).unwrap_err();
    match err {
        ContractError::CounterOfferMismatch {
            offer,
            counter_offer,
        } => {
            assert_eq!(msg_offer, offer);
            assert_eq!(amount, counter_offer);
        }
        e => panic!("unexpected error: {}", e),
    }

    // proper execution
    let info = mock_info("owner", &amount);
    let res = handle_execute(deps.as_mut(), mock_env(), info).unwrap();
    assert_eq!(res.messages.len(), 2);
    assert_eq!(
        res.messages[0],
        CosmosMsg::Bank(BankMsg::Send {
            from_address: MOCK_CONTRACT_ADDR.into(),
            to_address: "creator".into(),
            amount,
        })
    );
    assert_eq!(
        res.messages[1],
        CosmosMsg::Bank(BankMsg::Send {
            from_address: MOCK_CONTRACT_ADDR.into(),
            to_address: "owner".into(),
            amount: collateral,
        })
    );

    // check deleted
    let _ = query_config(deps.as_ref()).unwrap_err();
}
```

Now run the tests:

```shell
cargo test
```

If all green, the code will run work on chain.
