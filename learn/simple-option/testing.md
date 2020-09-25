---
order: 4
---

# Testing

<iframe src="https://player.vimeo.com/video/457705991" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

At this point your code should be compling, altough we did not test if it works. You can deploy the code to the chain everytime when you make a change. But come on, your time is more valuable than that. Also good to keep the contract break-free and tested for future changes.

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, MOCK_CONTRACT_ADDR};
    use cosmwasm_std::{coins, log, CosmosMsg};
```

This is how testing in Rust begins. [Code reference](https://github.com/CosmWasm/cosmwasm-examples/blob/master/simple-option/src/contract.rs). You can keep test and code in the same or separate files.

## Test Initialization

::: tip
Timecode [https://vimeo.com/457705991#t=3m34s](https://vimeo.com/457705991#t=3m34s)
:::

For each test, test specific variables such as block time, state must be mocked. Write a function for easy setup.

```rust
#[test]
fn proper_initialization() {
    /*
     * mock dependencies
     * first input is canonical address length
     * and the second is the initial fund in the contract
     */
    let mut deps = mock_dependencies(20, &[]);
    let msg = InitMsg {
        counter_offer: coins(40, "ETH"),
        expires: 100_000,
    };

    /*
     * mock execution environment
     * first sender address, second is the funds sent in the message
     */

    let env = mock_env("creator", &coins(1, "BTC"));

    // we can just call .unwrap() to assert this was a success
    let res = init(&mut deps, env, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // it worked, let's query the state
    let res = query_config(&deps).unwrap();
    assert_eq!(100_000, res.expires);
    assert_eq!("creator", res.owner.as_str());
    assert_eq!("creator", res.creator.as_str());
    assert_eq!(coins(1, "BTC"), res.collateral);
    assert_eq!(coins(40, "ETH"), res.counter_offer);
}
```

Good we now have a test environment initializer. This is a very simple one, you can pass in variables to the function and do different tweaks. Check cosmwasm-plus for more.

### Mock Dependencies and Environment

There are two important mocking tools we should improve on:
```rust
/// All external requirements that can be injected for unit tests.
/// It sets the given balance for the contract itself, nothing else
pub fn mock_dependencies(
    canonical_length: usize,
    contract_balance: &[Coin],
) -> Extern<MockStorage, MockApi, MockQuerier> {
    let contract_addr = HumanAddr::from(MOCK_CONTRACT_ADDR);
    Extern {
        storage: MockStorage::default(),
        api: MockApi::new(canonical_length),
        querier: MockQuerier::new(&[(&contract_addr, contract_balance)]),
    }
}
```

This sets up dependencies for testing such as storage, api, and querier.

```rust
/// Just set sender and sent funds for the message. The rest uses defaults.
/// The sender will be canonicalized internally to allow developers pasing in human readable senders.
/// This is intended for use in test code only.
pub fn mock_env<U: Into<HumanAddr>>(sender: U, sent: &[Coin]) -> Env {
    Env {
        block: BlockInfo {
            height: 12_345,
            time: 1_571_797_419,
            chain_id: "cosmos-testnet-14002".to_string(),
        },
        message: MessageInfo {
            sender: sender.into(),
            sent_funds: sent.to_vec(),
        },
        contract: ContractInfo {
            address: HumanAddr::from(MOCK_CONTRACT_ADDR),
        },
    }
}
```

`mock_env` is for mocking transaction, block, and contract environment

## Test Handler

::: tip
Timecode [https://vimeo.com/457705991#t=7m34s](https://vimeo.com/457705991#t=7m34s)
:::

### Test Transfer Handler

```rust
#[test]
fn transfer() {
    let mut deps = mock_dependencies(20, &[]);

    let msg = InitMsg {
        counter_offer: coins(40, "ETH"),
        expires: 100_000,
    };
    let env = mock_env("creator", &coins(1, "BTC"));

    // we can just call .unwrap() to assert this was a success
    let res = init(&mut deps, env, msg).unwrap();
    assert_eq!(0, res.messages.len());

    // random cannot transfer
    let env = mock_env("anyone", &[]);
    let err = handle_transfer(&mut deps, env, HumanAddr::from("anyone")).unwrap_err();
    match err {
        StdError::Unauthorized { .. } => {}
        e => panic!("unexpected error: {}", e),
    }

    // owner can transfer
    let env = mock_env("creator", &[]);
    let res = handle_transfer(&mut deps, env, HumanAddr::from("someone")).unwrap();
    assert_eq!(res.log.len(), 2);
    assert_eq!(res.log[0], log("action", "transfer");

    // check updated properly
    let res = query_config(&deps).unwrap();
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
    let mut deps = mock_dependencies(20, &[]);

    let counter_offer = coins(40, "ETH");
    let collateral = coins(1, "BTC");
    let msg = InitMsg {
        counter_offer: counter_offer.clone(),
        expires: 100_000,
    };
    let env = mock_env("creator", &collateral);

    // we can just call .unwrap() to assert this was a success
    let _ = init(&mut deps, env, msg).unwrap();

    // set new owner
    let env = mock_env("creator", &[]);
    let _ = handle_transfer(&mut deps, env, HumanAddr::from("owner")).unwrap();

    // random cannot execute
    let env = mock_env("creator", &counter_offer);
    let err = handle_execute(&mut deps, env).unwrap_err();
    match err {
        StdError::Unauthorized { .. } => {}
        e => panic!("unexpected error: {}", e),
    }

    // expired cannot execute
    let mut env = mock_env("owner", &counter_offer);
    env.block.height = 200_000;
    let err = handle_execute(&mut deps, env).unwrap_err();
    match err {
        StdError::GenericErr { msg, .. } => assert_eq!("option expired", msg.as_str()),
        e => panic!("unexpected error: {}", e),
    }

    // bad counter_offer cannot execute
    let env = mock_env("owner", &coins(39, "ETH"));
    let err = handle_execute(&mut deps, env).unwrap_err();
    match err {
        StdError::GenericErr { msg, .. } => assert!(msg.contains("counter offer")),
        e => panic!("unexpected error: {}", e),
    }

    // proper execution
    let env = mock_env("owner", &counter_offer);
    let res = handle_execute(&mut deps, env).unwrap();
    assert_eq!(res.messages.len(), 2);
    assert_eq!(
        res.messages[0],
        CosmosMsg::Bank(BankMsg::Send {
            from_address: MOCK_CONTRACT_ADDR.into(),
            to_address: "creator".into(),
            amount: counter_offer,
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
    let _ = query_config(&deps).unwrap_err();
}
```

Now run the tests:

```shell
cargo test
```

If all green, the code will run work on chain.
