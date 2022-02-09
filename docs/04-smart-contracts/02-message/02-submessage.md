---
sidebar_position: 2
---

# Submessages

Messages are used to interact with CosmWasm smart contracts. Since messages send information in a single direction, you do not get a response on whether the call was successful or not. Getting the result of your call can be very useful in the following cases:

1. Instantiating a new contract and getting the contract address
2. Executing an action and asserting that the result was successfully (e.g. Making sure that certain tokens are transferred to your contract)
4. Handling the error from your cross-contract call and updating the state instead of rolling back the transaction

To get the result of the message sent from your smart contract, you will need to dispatch a submessage. 

Read more about the [semantics of submessages and how submessage execution is ordered](https://github.com/CosmWasm/cosmwasm/blob/main/SEMANTICS.md#submessages).

## Creating a submessage

A submessage wraps a `CosmMsg` in a `SubMsg` struct. The `SubMsg` struct has the following fields.

```rust
pub struct SubMsg<T>
{
    pub id: u64,  // reply_id that will be used to handle the reply
    pub msg: CosmosMsg<T>, // message to be sent
    pub gas_limit: Option<u64>, // gas limit for the submessage
    pub reply_on: ReplyOn, // a flag to determine when the reply should be sent
}
```

The [source code](https://github.com/CosmWasm/cosmwasm/blob/main/packages/std/src/results/submessages.rs) for the `SubMsg` struct.

Here is an example of instantiating a `cw20` token using a submessage.

```rust
const INSTANTIATE_REPLY_ID = 1u64; 

// Creating a message to create a new cw20 token
let instantiate_message = WasmMsg::Instantiate {
    admin: None,
    code_id: msg.cw20_code_id,
    msg: to_binary(&Cw20InstantiateMsg {
        name: "new token".to_string(),
        symbol: "nToken".to_string(),
        decimals: 6,
        initial_balances: vec![],
        mint: Some(MinterResponse {
            minter: env.contract.address.to_string(),
            cap: None,
        }),
    })?,
    funds: vec![],
    label: "".to_string(),
};

// Creating a submessage that wraps the message above
let submessage = SubMsg {
    msg: instantiate_message.into(),
    gas_limit: None,
    id: INSTANTIATE_REPLY_ID,
    reply_on: ReplyOn::Success,
}

// Creating a response with the submessage
let response = Response::new().add_submessage(submessage);
```

## Handling a reply

In order to handle the reply from the other contract, the calling contract must implement a new entry point. Here are two examples of how to handle the replies:

### Instantiating a new contract

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> StdResult<Response> {
    match msg.id {
        INSTANTIATE_REPLY_ID => handle_instantiate_reply(deps, _env, msg),
        id => Err(StdError::GenericErr {
            msg: format!("Unknown reply id: {}", id),
        }),
    }
}

fn handle_instantiate_reply(deps: DepsMut, _env: Env, msg: Reply) -> StdResult<Response> {
	// handle the msg data and save the contract address
	// See: https://github.com/CosmWasm/cw-plus/blob/main/packages/utils/src/parse_reply.rs
	let data = msg.result.unwrap().data.unwrap();
	let res = parse_instantiate_response_data(data.as_slice())?;
  // save res.contract_address
	Ok(Response::new())
}
```

## Propagation of context between contracts

To stop reentrancy attacks, CosmWasm does not allow context to be stored in the contract memory. There are two ways to propagate state between contracts:

1. All `events` returned by the submessage can be read from the `Reply` message
2. Storing a temporary state using `cw_storage_plus::Item` and loading it in the reply handler

## Examples

1. [Handling of contract instantiate reply](https://github.com/terraswap/terraswap/blob/main/contracts/terraswap_pair/src/contract.rs) (Terraswap)
2. [Parsing of contract execution replies](https://github.com/larry0x/astrozap/blob/master/contracts/astrozap/src/contract.rs) (larry0x)