---
sidebar_position: 2
---

# Develop Contract

In this session, we will build on top of the template we generated on the previous [page](01-intro.md).

Here is the application logic we want:

- Collected tokens in smart contract's balance are released to a target address after
  the token amount exceeds a specified amount.
- Contract accepts cw20 token that is predefined by the admin.


:::warning
We recommend deleting boilerplate code during implementation to help with copying and pasting code.
:::

:::info
You can find the full version of this contract at [cw-contracts/cw20-pot](https://github.com/InterWasm/cw-contracts/tree/main/contracts)
:::

## Config

`admin` information which determines who has pot creation address must be persisted on contract
storage during each execution. We will save this information to the storage on `Instantiate` phase.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
  pub admin: Addr,
  pub cw20_addr: Addr
}

pub const CONFIG: Item<Config> = Item::new("config");
```

`Item` is used since this data will be a singleton.

## Instantiate

### Msg

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub admin: Option<String>,
    /// cw20_addr is the address of the allowed cw20 token
    pub cw20_addr: String
}
```

`admin` is defined as `Option` because if `None`, `info.sender` will be set as admin.
The accepted cw20 address is set here.

### Execute

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let owner = msg.admin
        .and_then(|s| deps.api.addr_validate(s.as_str()).ok())
        .unwrap_or(info.sender);
    let config = Config {
        owner: owner.clone(),
    };
    let config = Config {
        owner: owner.clone(),
        cw20_addr: deps.api.addr_validate(msg.cw20_addr.as_str())?
    };
    CONFIG.save(deps.storage, &config);

    // init pot sequence
    POT_SEQ.save(deps.storage, &Uint128::new(0))?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", owner)
        .add_attribute("cw20_addr", msg.cw20_addr))
}
```

The logic above is for if the owner is `Some` validate, if not use `info.sender` and store configuration,
then return `Response` with attributes.

```rust
let owner = msg.admin
    .and_then(|s| deps.api.addr_validate(s.as_str()).ok())
    .unwrap_or(info.sender);
```

The example above is a great one to understand method chaining.
Great read: [Rust Combinator](https://doc.rust-lang.org/rust-by-example/error/option_unwrap/and_then.html)

### Tests

I leave this part to you as a challenge ;)

## Create Pot

`admin` can create pots to collect money in with a given threshold.

### State

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Pot {
  /// target_addr is the address that will receive the pot
  pub target_addr: Addr,
  /// threshold_amount is the token threshold amount
  pub threshold_amount: Uint128,
  /// collected keeps information on how much is collected for this pot.
  pub collected: Uint128,
}

/// POT_SEQ holds the last pot ID
pub const POT_SEQ: Item<Uint128> = Item::new("pot_seq");
/// POTS are indexed my an auto incremented integer number.
pub const POTS: Map<U128Key, Pot> = Map::new("pot");
```

We can use a `save_pot` helper to auto-increment seq and use it as an index for pot.

```rust
pub fn save_pot(deps: DepsMut, pot: &Pot) -> StdResult<()> {
  // increment id if exists, or return 1
  let id = POT_SEQ.load(deps.storage)?;
  // checks for overflow
  let id = id.checked_add(Uint128::new(1))?;
  POT_SEQ.save(deps.storage, &id)?;

  // save pot with id
  POTS.save(deps.storage, id.u128().into(), pot)
}
```

### Msg

`ExecuteMsg` becomes this:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    CreatePot {
        /// target_addr will receive tokens when token amount threshold is met.
        target_addr: String,
        /// threshold is the token amount for releasing tokens.
        threshold: Uint128
    },
}
```

### Execute

`Execute` becomes this:

```rust
pub fn execute_create_pot(
    deps: DepsMut,
    info: MessageInfo,
    target_addr: String,
    threshold: Uint128,
) -> Result<Response, ContractError> {
    // owner authentication
    let config = CONFIG.load(deps.storage)?;
    if config.owner != info.sender {
        return Err(ContractError::Unauthorized {});
    }
    // create and save pot
    let pot = Pot {
        target_addr: deps.api.addr_validate(target_addr.as_str())?,
        threshold,
        collected: Uint128::zero(),
        ready: false,
    };
    save_pot(deps, &pot)?;

    Ok(Response::new()
        .add_attribute("action", "execute_create_pot")
        .add_attribute("target_addr", target_addr)
        .add_attribute("threshold_amount", threshold))
}
```

## Collect Tokens

This is the important part that this document tries to teach: Interaction with an external contract.
The smart contract will collect cw20 tokens. After cw20 token is sent, this contract will operate on this information.

But how?

CosmWasm smart contracts work as message-sending actors. Each contract execute other via sending a message
back to the context.

Users can transfer tokens from their account to the smart contract, then execute the smart contract to save this token
allocation in the next TX. But the problem here is how to verify this token is sent from this user?

One way to achieve this:
1. User [increases token allowance](https://github.com/CosmWasm/cw-plus/tree/main/packages/cw20#allowances) of the cw20-pot smart contract address.
2. User triggers cw20-pot contract to withdraw allowed funds to its account.

This operation requires two transactions.

There is a better and elegant way: [cw20 Receiver Interface](https://github.com/CosmWasm/cw-plus/tree/main/packages/cw20#receiver).

Works like this, the user creates a message for sending cw20 tokens to cw20-pot contract with an embedded message inside
to trigger cw20-pot execution.

If you check [cw20-base/contracts.rs#execute_send](https://github.com/CosmWasm/cw-plus/blob/main/contracts/cw20-base/src/contract.rs#L318)

```rust
pub fn execute_send(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  contract: String,
  amount: Uint128,
  msg: Binary,
) -> Result<Response, ContractError> {
```

In the signature, you will notice `contract`, `amount` and `msg`. `contract` is the recipient of the token and also
address of the next execution, `amount` is the number of tokens and `msg` is `base64` external message.

At the end of `execute_send`, you will see a `Response` with an embedded message sent back to the chain.
```rust
let res = Response::new()
        .add_attribute("action", "send")
        .add_attribute("from", &info.sender)
        .add_attribute("to", &contract)
        .add_attribute("amount", amount)
        .add_message(
            Cw20ReceiveMsg {
                sender: info.sender.into(),
                amount,
                msg,
            }
            .into_cosmos_msg(contract)?,
        );
    Ok(res)
```

As you can see `msg` is wrapped in a `Cw20ReceiveMsg` and for contract-cw20 interaction, your contract accept
`Cw20ReceiveMsg`.

```rust
pub fn execute_receive(
  deps: DepsMut,
  info: MessageInfo,
  wrapped: Cw20ReceiveMsg,
) -> Result<Response, ContractError> {
  // cw20 address authentication
  let config = CONFIG.load(deps.storage)?;
  if config.cw20_addr != info.sender {
    return Err(ContractError::Unauthorized {});
  }

  let msg: ReceiveMsg = from_binary(&wrapped.msg)?;
  match msg {
    ReceiveMsg::Send { id } => receive_send(deps, id, wrapped.amount, info.sender),
  }
}
```

On this line, contract-defined embed receive msg is parsed from base64 binary.
```rust
  let msg: ReceiveMsg = from_binary(&wrapped.msg)?;
```

Here is the `ReceiveMsg`:
```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ReceiveMsg {
    // Send sends token to an id with defined pot
    Send { id: Uint128 },
}
```

It creates a second depth branch inside `execute`.

And the smart contract runs this logic:

```rust
pub fn receive_send(
    deps: DepsMut,
    pot_id: Uint128,
    amount: Uint128,
    cw20_addr: Addr,
) -> Result<Response, ContractError> {
    // load pot
    let mut pot = POTS.load(deps.storage, pot_id.u128().into())?;

    pot.collected += amount;

    POTS.save(deps.storage, pot_id.u128().into(), &pot)?;

    let mut res = Response::new()
        .add_attribute("action", "receive_send")
        .add_attribute("pot_id", pot_id)
        .add_attribute("collected", pot.collected)
        .add_attribute("threshold", pot.threshold);

    // if collected exceeds threshold prepare a cw20 message
    if pot.collected >= pot.threshold {
        let cw20 = Cw20Contract(cw20_addr);
        let msg = cw20.call(Cw20ExecuteMsg::Transfer {
            recipient: pot.target_addr.into_string(),
            amount: pot.collected,
        })?;
        res = res.add_message(msg);
    }

    Ok(res)
}
```

```rust
    // if collected exceeds threshold prepare a cw20 message
    if pot.collected >= pot.threshold {
        // Cw20Contract is a function helper that provides several queries and message builder.
        let cw20 = Cw20Contract(cw20_addr);
        // Build a cw20 transfer send msg, that send collected funds to target address
        let msg = cw20.call(Cw20ExecuteMsg::Transfer {
            recipient: pot.target_addr.into_string(),
            amount: pot.collected,
        })?;
        res = res.add_message(msg);
    }
```

After the execution, if the threshold is passed, the collected amount is sent to the target.

## Summary

In this section, we showed you contract to contract interaction and cw20 contract interaction.
This should give you some insight to message passing, Actor model, and contract development.

## Challenge

As a challenge, you can try to implement a contract that extends [cw-plus](https://github.com/CosmWasm/cosmwasm-plus/)
or [cw-nfts](https://github.com/CosmWasm/cw-nfts).
