---
sidebar_position: 1
---

# Anatomy of a Smart Contract

A smart contract can be considered an instance of a singleton object whose internal state is persisted on the
blockchain. Users can trigger state changes or query the contract state through sending the contract JSON formatted execute function calls or query messages.

Developing a smart contract mainly revolves around defining the following three functions that constitute the interface of a smart contract:

- `instantiate()`: serves as the constructor during contract instantiation and provides the initial state
- `execute()`: gets called when a user wants to invoke a method on the smart contract
- `query()`: gets called when a user wants to request current-state related data from the smart contract

This section will cover how different instantiate, execute and query messages are defined, along with the implementation of smart contract functions that process those messages.

## Start with a template
In your workspace directory, you'll want to use `cargo-generate` to quick-start a smart contract project with the recommended folder structure and build options:

```sh
# install cargo-generate
cargo install cargo-generate --features vendored-openssl
cargo generate --git https://github.com/CosmWasm/cosmwasm-template.git --name my-first-contract
cd my-first-contract
```

The template helps you get started by providing the basic boilerplate and structure for a smart contract. At this point, you may start examining the project contents with your favorite IDE.

## Project Overview

The `/src` directory contains the smart contract source code in separate files.
- The file `src/contract.rs` contains the main smart contract logic and is where the functions instantiate(), execute() and query() are implemented.
- The file `src/state.rs` defines how the smart contract state data is represented and the way it will be stored. 
- The file `src/msg.rs` is where different types of messages and responses the smart contract can receive and return are defined.
- The file `src/error.rs` defines the error types that can be returned by the smart contract.
- The file `src/lib.rs` is where all the previous modules are exposed and made accessible.

## Contract State
Let us start by examining the file `/src/state.rs`.

The starting template has the following basic state:

- a singleton struct `State` containing:
  - a 32-bit integer `count`
  - an address `owner`

```rust
// src/state.rs
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::Addr;
use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub count: i32,
    pub owner: Addr,
}
```

Smart contracts have the ability to keep persistent state through native LevelDB, a byte-array-based key-value
store. As such, any data you wish to persist should be assigned a unique key with which the data can be indexed and later retrieved.

```rust
// src/state.rs
pub const STATE: Item<State> = Item::new("state");
```

In the example above, the key `"state"` is used as a prefix.

Data can only be persisted as a raw byte array, so any notion of structure or data-type must be expressed as a pair of serializing and deserializing functions. For instance, objects must be stored as bytes, so you must supply both the function that encodes the object into bytes to save it on the blockchain, and the function that decodes the bytes back into the data-types that your contract logic can understand. The choice of byte representation is up to you, so long as it provides a clean, bi-directional mapping.

Fortunately, the CosmWasm team have provided utility crates such
as [cosmwasm_storage](https://github.com/CosmWasm/cosmwasm/tree/main/packages/storage), which provides convenient
high-level abstractions for data containers such as a "singleton" and "bucket", which automatically provide
serialization and deserialization for commonly-used types such as structs and Rust numbers.

Notice how the `State` struct holds both `count` and `owner`. In addition, the `derive` attribute is applied to
auto-implement some useful traits:

- `Serialize`: provides serialization
- `Deserialize`: provides deserialization
- `Clone`: makes our struct copyable
- `Debug`: enables our struct to be printed to string
- `PartialEq`: gives us equality comparison
- `JsonSchema`: auto-generates a JSON schema for us

The type `Addr` represents a human-readable Bech32 address with a `wasm` prefix.

## InstantiateMsg

Defined in the file `/src/msg.rs`, the `InstantiateMsg` is received when an address tries to instantiate a contract on the blockchain through a `MsgInstantiateContract` message. This message provides the contract with initial configuration and state.

:::note
On CosmWasm, the upload of a contract's code and the instantiation of a contract are regarded as
separate events, unlike on Ethereum. This is to allow a small set of vetted contract archetypes to exist as
multiple instances sharing the same base code but be configured with different parameters (imagine one canonical ERC20, and multiple tokens that use its code).
:::
### Message Definition

```rust
// src/msg.rs

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
  pub count: i32,
}

```
For our template contract, we will expect a contract creator to supply the initial state in a JSON formatted message as follows:

```json
{
  "count": 100
}
```
This message arrives embedded in the received `MsgInstantiateContract` message during instantiation. 

### Instantiation Logic

Defined in the file `/src/contract.rs`, the `instantiate()` function is the first entry-point, or where the contract processes a received `MsgInstantiateContract` message. The instantiation data is extracted from the message and is used to set out the initial state, as follows:

```rust
// src/contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  msg: InstantiateMsg,
) -> Result<Response, ContractError> {
  //An overview of function parameters:

  //"deps" allows us to perform storage related actions, validate addresses and query other smart contracts
  //"_env" is mainly used to access details about the current state of the blockchain (i.e., block height, time, chain id) 
  //"info" provides access to the message metadata (i.e., sender address, the amount and type of funds)
  //"msg" is the MsgInstantiateContract payload, which comprises the data received from the contract creator
  //in JSON format that conforms to the InstantiateMsg struct

  //Introduce a new variable named `state` of type `State`
  let state = State {
    //the value for count in the received message is assigned to the variable `count` of the `State` struct
    count: msg.count,
    //the sender address of the MsgInstantiateContract is assigned to the variable `owner` of the `State` struct
    owner: info.sender.clone(),
  };
  //Store the contract name and version
  set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
  //Store the initial state of the contract
  STATE.save(deps.storage, &state)?;
  
  //Form and return an Ok(Response)
  //The attributes will be included in the JSON formatted response message
  Ok(Response::new()
    .add_attribute("method", "instantiate")
    .add_attribute("owner", info.sender)
    .add_attribute("count", msg.count.to_string()))
}
```
## ExecuteMsg

Defined in the file `/src/msg.rs`, an `ExecuteMsg` is received when an address tries to invoke one of the smart contract functions through a `MsgExecuteContract` message. Unlike the `InstantiateMsg`, which was a single struct; the `ExecuteMsg` is an enumerator, which essentially holds a list of possible execute message structs with different names and attributes to account for the different types of functions that
a smart contract can expose to a user. The `execute()` function demultiplexes these different types of messages and forwards them to the appropriate message handler logic.
### Message Definition

The `ExecuteMsg` enum contains the different types of execute messages that our contract can understand.
```rust
// src/msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
  Increment {},
  Reset { count: i32 },
}
```
:::note
The line `#[serde(rename_all = "snake_case")]` performs a snake_case conversion (lowercase initials with an underscore between words) on the field names before serialization and deserialization. So, we'll have `increment` and `reset` instead of `Increment` and `Reset` when serializing and deserializing across JSON formatted messages.
:::

At this point, our template contract can accept the following two types of execute messages in JSON format, embedded in a `MsgExecuteContract` message:
#### Increment

Any address can utilize the Increment function to increment the current count by 1.

```json
{
  "increment": {}
}
```

#### Reset

The owner of the contract can reset the count to an arbitrary number. The check regarding whether a user is the contract owner is a part of the execution logic.
```json
{
  "reset": {
    "count": 5
  }
}
```
### Execution Logic
Defined in the file `/src/contract.rs`, the `execute()` function uses Rust's pattern matching to route the received `ExecuteMsg` to the appropriate handling logic, by either routing to the function `try_increment()` or  `try_reset()` depending on the type of message received.

```rust
// src/contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
  deps: DepsMut,
  _env: Env,
  info: MessageInfo,
  msg: ExecuteMsg,
) -> Result<Response, ContractError> {
  match msg {
    ExecuteMsg::Increment {} => try_increment(deps),
    ExecuteMsg::Reset { count } => try_reset(deps, info, count),
  }
}
```

```rust
pub fn try_increment(deps: DepsMut) -> Result<Response, ContractError> {
  STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
    state.count += 1;
    Ok(state)
  })?;

  Ok(Response::new().add_attribute("method", "try_increment"))
}
```

It is quite straightforward to follow the logic of `try_increment()`. We acquire a mutable reference to the storage to
update the item located at key `"state"`, made accessible through the `STATE` convenience function defined in
the `src/state.rs`. We then update the present state's count by returning an `Ok` result with the new state. Finally, we
terminate the contract's execution with an acknowledgement of success by returning an `Ok` result with the
default `Response`.

In this example, the default `Response` is used for simplicity. However, the `Response` can be manually created to
provide the following information:

- `messages`: A list of messages. This is how smart contracts execute other smart contract functions or use native modules.
- `attributes`: A list of key-value pairs to define emitted SDK events that can be subscribed to and parsed by clients.
- `events`: Extra, custom events separate from the main `wasm` one. These will have `wasm-` prepended to the type. These can be used by explorers and applications to report important events or state changes that occurred during the execution.
- `data`: additional data that the contract returns to the client.

```rust
// src/contract.rs
pub fn try_reset(deps: DepsMut, info: MessageInfo, count: i32) -> Result<Response, ContractError> {
  STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
    if info.sender != state.owner {
      return Err(ContractError::Unauthorized {});
    }
    state.count = count;
    Ok(state)
  })?;
  Ok(Response::new().add_attribute("method", "reset"))
}
```

The logic for try_reset() is very similar to increment — except this time, we first check that the message sender is permitted to invoke the reset function. Please, observe the use of `ContractError::Unauthorized {}` to return an error if the sender is not the owner of the contract. Custom error messages can be defined in the file `/src/error.rs`.
## QueryMsg
Defined in the file `/src/msg.rs`, a `QueryMsg` is received when an address tries to query information about the current state of the smart contract. Similar to the `ExecuteMsg`, `QueryMsg` is an enumerator and holds a list of possible query message structs with different names and attributes in order to cover the different types of query functions a user can invoke. The `query()` function demultiplexes these different types of messages and forwards them to the appropriate message handler logic.

In addition to handling how the queries are received, the contract also needs a structured way of outputting query responses. This is accomplished by defining response structs (e.g., `CountResponse`) in the file `/src/msg.rs`, so the querying party may know what to expect from the JSON response to be received.
### Message Definition

The template contract only supports one type of `QueryMsg` message, which is `GetCount`.

```rust
// src/msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
  // GetCount returns the current count as a json-encoded number
  GetCount {},
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CountResponse {
  pub count: i32,
}
```
#### GetCount
The query message:

```json
{
  "get_count": {}
}
```
The contract should return a `CountResponse` with the current count in JSON format.

```json
{
  "count": 5
}
```
### Query Logic

The logic for `query()` is similar to that of `execute()`, except the fact that the `query()` function is called without the need of making a transaction by the end-user. Therefore, the argument `info` can be omitted in the query() function signature as there is no message information present to be processed. 

```rust
// src/contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
  match msg {
    // Match and route the query message to the appropriate handler
    QueryMsg::GetCount {} => to_binary(&query_count(deps)?),
    // Return the response in byte-array format
  }
}

fn query_count(deps: Deps) -> StdResult<CountResponse> {
  let state = STATE.load(deps.storage)?;
  // Load the current contract state
  Ok(CountResponse { count: state.count })
  // Form and return a CountResponse
}
```
The query() function matches the received message with one of the QueryMsg structs defined in `/src/msg.rs` and  routes the received QueryMsg to the appropriate handling logic before returning a specific query response in byte-array format.
## Building the Contract

To build your contract, run the following command. 
```sh
cargo wasm
```
This will check for any preliminary errors and output a .wasm binary under the folder `/target/wasm32/release`.

### Optimizing your build

:::info
You will need [Docker](https://www.docker.com) installed to run this command.
:::

You will need to make sure the output WASM binary is as small as possible in order to minimize fees and stay under the size limit for the blockchain. Run the following command in the root directory of your Rust smart contract's project folder.

```sh
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.6
```

This will result in an optimized .wasm binary under the folder `/artifacts` in your project directory.

:::note optional

You may add the optimization command above in `Cargo.toml` for quick access.

This allows running custom scripts in a similar way to what `package.json` does in the Node ecosystem.

Install `cargo-run-script`

```sh
cargo install cargo-run-script
```

Add the script in `Cargo.toml`

```toml
[package.metadata.scripts]
optimize = """docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.6
"""
```
Run the command:

```sh
cargo run-script optimize
```
:::

## Schemas

The file `/examples/schema.rs` contains the configuration for JSON-schema auto-generation.  With the help of schema files, the different data structures that form the smart contract's interface can be represented in JSON format.

### Schema Generation
The configuration file should include an entry for each data structure we need a schema for.
```rust
// examples/schema.rs

use std::env::current_dir;
use std::fs::create_dir_all;

use cosmwasm_schema::{export_schema, remove_schemas, schema_for};

use my_first_contract::msg::{CountResponse, ExecuteMsg, InstantiateMsg, QueryMsg};
use my_first_contract::state::State;

fn main() {
  let mut out_dir = current_dir().unwrap();
  out_dir.push("schema");
  create_dir_all(&out_dir).unwrap();
  remove_schemas(&out_dir).unwrap();

  export_schema(&schema_for!(InstantiateMsg), &out_dir);
  export_schema(&schema_for!(ExecuteMsg), &out_dir);
  export_schema(&schema_for!(QueryMsg), &out_dir);
  export_schema(&schema_for!(State), &out_dir);
  export_schema(&schema_for!(CountResponse), &out_dir);
}
```

You can then build the schemas with:

```sh
cargo schema
```

The newly generated schemas should be accessible in the `/schema` directory. 
The following is an example of `/schema/query_msg.json`.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QueryMsg",
  "anyOf": [
    {
      "type": "object",
      "required": [
        "get_count"
      ],
      "properties": {
        "get_count": {
          "type": "object"
        }
      },
      "additionalProperties": false
    }
  ]
}
```

You can use an online tool such as [JSON Schema Validator](https://www.jsonschemavalidator.net/) to test [your input](/dev-academy/develop-smart-contract/intro#getcount) against the generated JSON schema.
