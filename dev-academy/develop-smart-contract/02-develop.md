---
sidebar_position: 2
---

# Developing a Smart Contract

In this section, we will build on top of the template that was generated [previously](01-intro.md), and develop a smart contract that will function as a To-Do List.
:::tip Reminder
The template contract is only being utilized to provide the initial structure. The various functions, messages and data structures that are defined in the template contract will need to be repurposed, replaced or removed in accordance with the needs of our new contract.
:::

Here is the application logic:
- The owner of the To-Do List contract can add new entries, update existing ones or delete them.  
- The contract can be queried to return individual entries as well as a subset of the whole list. 

You can find the full version of this contract by clicking on the following link:
* [cw-contracts/cw-to-do-list](https://github.com/InterWasm/cw-contracts/tree/main/contracts)
## Contract Config & State

Each instance of the To-Do List contract should have an `owner` with entry manipulation rights. In order to be able to check whether a function call is authorized or not, the address of the owner must be persisted on contract storage following the instantiation.

```rust
//state.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
  pub owner: Addr,
}

pub const CONFIG: Item<Config> = Item::new("config");
//Item stores a single variable of a given type, identified by a string storage key.
```
A To-Do List consists of entries, each of which is identified by a unique `id`. The `id` of the latest entry on the list is stored as `ENTRY_SEQ`, an Item that holds an integer value. The value stored in `ENTRY_SEQ` is incremented every time a new entry is appended to the list.

The attributes `status` and `priority` are defined as enums to provide uniformity among different entries.

The list of entries as a whole is persisted as the `LIST`, a Map that holds a collection of `id` to `Entry` pairs.

```rust
//state.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Entry {
    pub id: u64,
    pub description: String,
    pub status: Status,
    pub priority: Priority,
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum Status {
    ToDo,
    InProgress,
    Done,
    Cancelled
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum Priority {
    None,
    Low,
    Medium,
    High
}

pub const ENTRY_SEQ: Item<u64> = Item::new("entry_seq");
pub const LIST: Map<u64, Entry> = Map::new("list");
```
## Instantiate

### Message Definition
```rust
// msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub owner: Option<String>,
}
```
`owner` is defined as an optional attribute. If no owner information is provided in the `InstantiateMsg` received, the address that instantiates the contract will be assigned as the owner by default.
### Instantiation Logic
```rust
//contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let owner = msg
        .owner
        .and_then(|addr_string| deps.api.addr_validate(addr_string.as_str()).ok())
        .unwrap_or(info.sender);
    // If the instantiation message contains an owner address, validate the address and use it.
    // Otherwise, the owner is the address that instantiates the contract.    

    let config = Config {
        owner: owner.clone()
    };
    // Save the owner address to contract storage.
    CONFIG.save(deps.storage, &config)?;
    // Save the entry sequence to contract storage, starting from 0.
    ENTRY_SEQ.save(deps.storage, &0u64)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", owner))
}
```
Once again, the logic above dictates that if the `owner` in the instantiation message is `Some`, validate and use it; if not, use `info.sender` instead and store the configuration before returning a `Response` with the relevant attributes.
:::info
```rust
let owner = msg.owner
    .and_then(|addr_string| deps.api.addr_validate(addr_string.as_str()).ok())
    .unwrap_or(info.sender);
```
The example above is a great one to understand the concept of method chaining.

A great read on the subject: [Rust Combinators: and_then](https://doc.rust-lang.org/rust-by-example/error/option_unwrap/and_then.html)
:::

## Execute

### Message Definition
The owner of the To-Do List contract should be able to add new entries to the list, update existing ones or delete the entries on the list. Therefore, the ExecuteMsg enum should include a struct for each of these actions to later route a received execution message to the appropriate handling logic.

```rust
//msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    NewEntry {description: String, priority: Option<Priority>},
    UpdateEntry { id: u64, description: Option<String>, status: Option<Status>, priority: Option<Priority> },
    DeleteEntry { id: u64 }
}
```
### Execution Logic

The `execute()` function [match](https://doc.rust-lang.org/rust-by-example/flow_control/match.html)es the received `ExecuteMsg` with one of the structs defined in the file `/src/msg.rs` and routes it to the corresponding handler function. 
```rust
//contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::NewEntry {description, priority} => execute_create_new_entry(deps, info, description, priority),
        ExecuteMsg::UpdateEntry {id, description, status, priority } => execute_update_entry(deps, info, id, description, status, priority),
        ExecuteMsg::DeleteEntry {id} => execute_delete_entry(deps, info, id)
    }
}
```
### - Create New Entry
The function `execute_create_new_entry()` handles the creation of a new entry on the list. 
```rust
//contract.rs
pub fn execute_create_new_entry(deps: DepsMut, info: MessageInfo, description: String, priority: Option<Priority>) -> Result<Response, ContractError> {
    // Before creating the new entry, the function checks if the message sender is 
    // the owner of the contract.
    let owner = CONFIG.load(deps.storage)?.owner;
    if info.sender != owner {
        // If not, it returns an error and the new entry creation fails to be performed.
        return Err(ContractError::Unauthorized {});
    }
    // In order to generate a unique `id` for the new entry, the function increments the entry sequence 
    // and saves it to the contract storage with `ENTRY_SEQ.update()`.
    let id = ENTRY_SEQ.update::<_, cosmwasm_std::StdError>(deps.storage, |id| {
        Ok(id.add(1))
    })?;
    /*
       The new entry is defined with the received `description` and `priority` attributes. The `status` of 
       the new entry is set to `ToDo` by default. Notice that `priority` is an optional parameter. 
       If not provided, the 'priority' will be set as `None` by default.
    */
    let new_entry = Entry {
        id,
        description,
        priority: priority.unwrap_or(Priority::None),
        status: Status::ToDo
    };
    // The function finally saves the new entry to the `LIST` with the matching `id` and returns a `Response`
    // with the relevant attributes. 
    LIST.save(deps.storage, id, &new_entry)?;
    Ok(Response::new().add_attribute("method", "execute_create_new_entry")
        .add_attribute("new_entry_id", id.to_string()))
}
```
### - Update Entry
The function `execute_update_entry()` handles the update of an existing entry on the list.
```rust
//contract.rs
pub fn execute_update_entry(deps: DepsMut, info: MessageInfo, id: u64, description: Option<String>, status: Option<Status>, priority: Option<Priority>) -> Result<Response, ContractError> {
    // Before continuing with the new update, the function checks if the message sender is 
    // the owner of the contract.
    let owner = CONFIG.load(deps.storage)?.owner;
    if info.sender != owner {
        // If not, it returns an error and the update fails to be performed.
        return Err(ContractError::Unauthorized {});
    }
    // The entry with the matching `id` is loaded from the `LIST`.
    let entry = LIST.load(deps.storage, id)?;
    /*
       Sharing the same id, an updated version of the entry is defined with the received values for 
       `description`, `status` and `priority`. These are optional parameters and if any one of them is not 
       provided, the function defaults back to the corresponding value from the entry loaded.
    */
    let updated_entry = Entry {
        id,
        description: description.unwrap_or(entry.description),
        status: status.unwrap_or(entry.status),
        priority: priority.unwrap_or(entry.priority),
    };
    // The function saves the updated entry to the `LIST` with the matching `id` and returns a `Response` 
    // with the relevant attributes.
    LIST.save(deps.storage, id, &updated_entry)?;
    Ok(Response::new().add_attribute("method", "execute_update_entry")
                      .add_attribute("updated_entry_id", id.to_string()))
}
```
### - Delete Entry
The function `execute_delete_entry()` handles the removal of an existing entry from the list.
```rust
//contract.rs
pub fn execute_delete_entry(deps: DepsMut, info: MessageInfo, id: u64) -> Result<Response, ContractError> {
    // Before carrying on with the removal, the function checks if the message sender is 
    // the owner of the contract.
    let owner = CONFIG.load(deps.storage)?.owner;
    if info.sender != owner {
        // If not, it returns an error and the deletion fails to be performed.
        return Err(ContractError::Unauthorized {});
    }
    // The entry with the matching `id` is removed from the `LIST`.
    LIST.remove(deps.storage, id);
    // The function returns a `Response` with the relevant attributes.
    Ok(Response::new().add_attribute("method", "execute_delete_entry")
                      .add_attribute("deleted_entry_id", id.to_string()))
}
```

## Query

### Message Definition
Upon creating and populating the list with entries, querying individual entries or a subset of the whole list should be possible. Therefore, the file `/src/msg.rs` should include a `QueryMsg` enum that defines a struct for each query type to be received, along with the corresponding response message definition for each query type.

```rust
//msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    QueryEntry {id: u64},
    QueryList {start_after: Option<u64>, limit: Option<u32>},
}

// A custom struct is defined for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct EntryResponse {
    pub id: u64,
    pub description: String,
    pub status: Status,
    pub priority: Priority,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ListResponse {
    pub entries: Vec<Entry>,
}
```
### Query Logic
The `query()` function matches the received `QueryMsg` with one of the structs defined in the file /src/msg.rs, routes it to the corresponding handler function and returns a query response in byte-array format.
```rust
//contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::QueryEntry { id } => to_binary(&query_entry(deps, id)?),
        QueryMsg::QueryList {start_after, limit} => to_binary(&query_list(deps, start_after, limit)?),
    }
}
```
### - Query Entry
The function `query_entry()` handles the query of an individual existing entry on the list.
```rust
fn query_entry(deps: Deps, id: u64) -> StdResult<EntryResponse> {
    // The entry with the matching `id` is loaded from the `LIST`.
    let entry = LIST.load(deps.storage, id)?;
    // An `EntryResponse` is formed with the attributes of the loaded entry and returned.
    Ok(EntryResponse { id: entry.id, description: entry.description, status: entry.status, priority: entry.priority })
}
```
### - Query List
The function `query_list()` handles the queries that demand a subset of the whole list. Making use of [Map](https://docs.rs/cw-storage-plus/0.13.2/cw_storage_plus/struct.Map.html)'s `range()` function, custom range queries are possible on the stored list of entries.   
```rust
//contract.rs
// Limits for the custom range query
const MAX_LIMIT: u32 = 30;
const DEFAULT_LIMIT: u32 = 10;

fn query_list(deps: Deps,
              start_after: Option<u64>,
              limit: Option<u32>,
) -> StdResult<ListResponse> {
    // The optional parameters `start_after` and `limit` are used to define the subset of the list in order to
    // limit the number of entries returned.
    
    // `start_after` serves as the lower index bound for the `range()` function.
    let start = start_after.map(Bound::exclusive);
    let limit = limit.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as usize;
    /*
       The function `take(limit)` determines the maximum number of entries to be returned. 
       * If a `limit` is not provided, the function defaults to return a maximum of 10 entries. 
       * If a `limit` is provided, the `limit` gets compared with the `MAX_LIMIT` and the smaller of the two is 
         used as the maximum number of entries to be returned.
    */
    let entries: StdResult<Vec<_>> = LIST
        .range(deps.storage, start, None, Order::Ascending)
        .take(limit)
        .collect();
    // The `range().take(limit).collect()` method-chain outputs the result as a vector of (id, Entry) tuples.    
    let result = ListResponse {
        entries: entries?.into_iter().map(|l| l.1.into()).collect(),
    };
    // The output is then mapped into an Entry-only vector in order to prepare the `ListResponse` struct 
    // that will be returned as the query response.
    Ok(result)
}
```
## Contract Deployment
Now that the main components of the smart contract are defined, the next step is to build and deploy our To-Do List contract to the chain.

### Build
In order to build the contract and optimize the .wasm binary before deployment, we can follow [the instructions](/dev-academy/develop-smart-contract/intro#building-the-contract) that was included in the previous chapter.

:::tip Reminder
Because we've used the template contract as a starting point, there might be remnants of the template code that interfere with the build process causing compilation warnings and errors (e.g., unresolved imports) which should be trivial to solve. Still, if you are having problems at this point, please refer to the full version of the contract code [here](https://github.com/InterWasm/cw-contracts/tree/main/contracts) for a working example.
:::

### Deploy
Once the .wasm binary is built and optimized, we can deploy the contract to the testnet.

:::note
For the deployment process to be successful, we'll need to set up `wasmd` and have a wallet address with sufficient funds to deploy the contract. You can find the required instructions [here](/dev-academy/basics/environment#wasmd).

You may ignore this step if you have already set up `wasmd` and requested some `umlg`s for your wallet address from the faucet.
:::

Open up a terminal window and navigate to the `/artifacts` folder located in the project root directory.
```bash
#Deploy the contract to the testnet
RES=$(wasmd tx wasm store cw_to_do_list.wasm --from wallet --node https://rpc.malaga-420.cosmwasm.com:443 --chain-id malaga-420 --gas-prices 0.25umlg --gas auto --gas-adjustment 1.3 -y --output json -b block)

#Get the Code Id
echo $RES | jq -r '.logs[0].events[-1].attributes[0].value'
```
Using this Code Id, any address can instantiate the contract and create their own To-Do List instance.
## Contract Interaction
Now that the contract is deployed to the testnet with a Code Id, it is time to instantiate the contract and interact with our own To-Do List contract instance.

Open up a new Terminal window and run the following command to initialize a CosmJS CLI session.
```bash
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts
```

Let us import the necessary `StdFee` interface and generate/load a wallet address.
```js
import { StdFee } from "@cosmjs/stargate";

const [addr, client] = await useOptions(malagaOptions).setup("password");

//Display the wallet address
client.getAccount(addr);
//Display the account balance
client.getBalance(addr,"umlg")
```
Define a `defaultFee` to be passed into instantiation and execution functions later on:
```js
const defaultFee: StdFee = { amount: [{amount: "200000", denom: "umlg",},], gas: "200000",};
```
We can now instantiate the contract and create a To-Do List instance using the code id we have received upon deployment. Notice that the instantiation message is empty (i.e., `{}`) and does not specify an `owner` address. In this case, the contract will be instantiated with our wallet address assigned as the contract `owner`.
```js
const codeId = 1 //Replace the Code Id with the one you have received earlier
const instantiateResponse = await client.instantiate(addr, codeId, {}, "To Do List", defaultFee)
console.log(instantiateResponse)
```
The instantiation should succeed and we should have a response similar to the one below.
```js
{
  contractAddress: 'wasm1mls5039qaptduck4c33h39f4nvl603dkx6xxetclnefdderf2ngsta4tuf',
  logs: [ { msg_index: 0, log: '', events: [Array] } ],
  transactionHash: '8CF7CFFDF83EF3553561675AAC49331FB16CAF74A85841D8E7CF8B60DBB5EEBA'
}
```
The `contractAddress` is the address of the contract instance that we have created. We can now include this address in execute and query messages in order to target this specific To-Do List instance.
:::note
For the remainder of this section, the contract address will be passed into the execute() and query() functions as `instantiateResponse.contractAddress`. If you want to access the same contract instance in the future, it is recommended that you note the contract address down so that the next time you initialize a CosmJS CLI session, you can store the address in a variable (e.g., `const myOldContract = "The contract address you noted down"`) and use that variable instead of `instantiateResponse.contractAddress` as a function parameter to target this particular contract instance without the need of re-instantiating a new one.
:::

The `transactionHash` can be carried over to the [Malaga-420 Block Explorer](https://block-explorer.malaga-420.cosmwasm.com/) to examine the transaction for the instantiation in detail.

The `logs`, among other details, include the attributes we've added to the `instantiate()` function response in the contract code.
```rust
//contract.rs
Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", owner))
```
At this point the `owner` address can be extracted from the `logs` and should match your wallet address. 
```js
console.log(instantiateResponse.logs[0].events[2].attributes[2])
//Outputs the address of the contract owner

client.getAccount(addr);
//Outputs your wallet details
```
Now, let us create a new To-Do List entry. Notice that the execute() function targets the contract address we've received upon instantiation and the message inside matches the struct `ExecuteMsg::NewEntry` that was defined in the contract code under `/src/msg.rs`.
```js
//Enable REPL editor mode to edit multiple lines of code
.editor

const executeResponse = await client.execute(
         addr, 
         instantiateResponse.contractAddress,
         {
           new_entry: {
             description: "A new entry.",
             priority: "Medium"
           }
         },
         defaultFee,
       )

//Exit editor using `^D` to execute the code entered
^D

console.log(executeResponse)
```
The executeResponse should look similar to the one below.
```js
{
  logs: [ { msg_index: 0, log: '', events: [Array] } ],
  transactionHash: '591830F0805C620336CC9E1A66DBCF34BA5ECF5415C4B41EC21112EEDF513510'
}
```
The `transactionHash` can again be carried over to the [Malaga-420 Block Explorer](https://block-explorer.malaga-420.cosmwasm.com/) to examine the transaction for the execution in detail.

Now, let us query the To-Do List contract and examine the response.

Notice that the message inside the query() function matches the struct `QueryMsg::QueryList` that was defined in the contract code under `/src/msg.rs`. We are not utilizing the optional `start_after` and `limit` parameters as we do not need to paginate a list that only has a single entry at this point.

```js
const queryResult = await client.queryContractSmart(instantiateResponse.contractAddress, { query_list: {} })

console.log(queryResult)
```
The query result should be as follows:
```js
{
  entries: [
    {
      id: '1',
      description: 'A new entry.',
      status: 'ToDo',
      priority: 'Medium'
    }
  ]
}
```
Create another entry by calling the execute() function again with the message inside matching the `ExecuteMsg:NewEntry` struct.

```js
//Enable REPL editor mode to edit multiple lines of code
.editor

const executeResponse_2 = await client.execute(
         addr, 
         instantiateResponse.contractAddress,
         {
           new_entry: {
             description: "Another entry.",
             priority: "Low"
           }
         },
         defaultFee,
       )

//Exit editor using `^D` to execute the code entered
^D
```
If we query the list, we should now see two entries.
```js
const queryResult_2 = await client.queryContractSmart(instantiateResponse.contractAddress, { query_list: {} })

console.log(queryResult_2)
```

```js
{
  entries: [
    {
      id: '1',
      description: 'A new entry.',
      status: 'ToDo',
      priority: 'Medium'
    },
    {
      id: '2',
      description: 'Another entry.',
      status: 'ToDo',
      priority: 'Low'
    }
  ]
}
```
Let us update the second entry now. Notice that the message inside the execute() function matches the `ExecuteMsg:UpdateEntry` struct that was defined in `/src/msg.rs`.

```js
.editor
const executeResponse_3 = await client.execute(
         addr,
         instantiateResponse.contractAddress,
         {
           update_entry: {
            id: 2,
            description: "Updated entry.",
            priority: "High",
            status: "InProgress"
          }
         },
         defaultFee,
       )
//Exit editor using `^D` to execute the code entered
^D       
```
Query the second entry individually and see the changes. Notice that the message inside the query() function now matches the struct `QueryMsg::QueryEntry` that was defined in the contract code under `/src/msg.rs`.
```js
const queryResult_3 = await client.queryContractSmart(instantiateResponse.contractAddress, {query_entry:{id: 2}})

console.log(queryResult_3)
```
```js
{
  id: '2',
  description: 'Updated entry.',
  status: 'InProgress',
  priority: 'High'
}
```
Now, let us delete the first entry. Notice that the message inside the execute() function now matches the `ExecuteMsg:DeleteEntry` struct that was defined in `/src/msg.rs`.
```js
.editor
const executeResponse_4 = await client.execute(
         addr,
         instantiateResponse.contractAddress,
         {
           delete_entry: {
            id: 1
          }
         },
         defaultFee,
       )
//Exit editor using `^D` to execute the code entered
^D
```
Query the list again and see that the first entry has been deleted.
```js   
const queryResult_4 = await client.queryContractSmart(instantiateResponse.contractAddress, { query_list: {} })

console.log(queryResult_4)
```
```js
{
  entries: [
    {
      id: '2',
      description: 'Updated entry.',
      status: 'InProgress',
      priority: 'High'
    }
  ]
}
```
With that, we've covered the basic functionality of our To-Do List contract.

Do not exit the CosmJS CLI session yet, so that we can create a different wallet address (i.e., one that is not the owner of our contract instance) and try to append a new entry to our To-Do list.

Now, running the command below will create a new key file containing an encrypted mnemonic in your `HOME` directory (i.e., ~/.another.key) and generate a new wallet address.

```js
const [another_addr, another_client] = await useOptions(malagaOptions).setup("password", ".another.key" );
```
You may compare the wallet addresses at hand with the following commands:
```js
//The original wallet address for the contract owner
client.getAccount(addr)

//The new wallet address that is not the contract owner
another_client.getAccount(another_addr)
```

Now, we can try and create a new entry. Notice that, although the target contract address remains the same, we are now utilizing `another_client` to call the execute() function with `another_addr` as the sender address.
```js
//Enable REPL editor mode to edit multiple lines of code
.editor

const executeResponse_5 = await another_client.execute(
         another_addr, 
         instantiateResponse.contractAddress,
         {
           new_entry: {
             description: "A new entry attempt from a wallet address that is not the contract owner.",
             priority: "Medium"
           }
         },
         defaultFee,
       )

//Exit editor using `^D` to execute the code entered
^D
```
The response is expected to be similar to the one below:

```bash
Error: Error when broadcasting tx EA5DFED64B966CDF839E2FAA8310CB4B7D541368BB1AAF8E7F68CEA4A9BE0BE2  at height 1995608. 
Code: 5; Raw log: failed to execute message; message index: 0: Unauthorized: execute wasm contract failed
```

Because `another_addr` is not the owner of our contract instance, the following portion of our contract code returns the error message that corresponds to `ContractError::Unauthorized {}` defined in the file `/src/error.rs`.
```rust
//contract.rs
pub fn execute_create_new_entry(deps: DepsMut, info: MessageInfo, description: String, priority: Option<Priority>) -> 
Result<Response, ContractError> {
    let owner = CONFIG.load(deps.storage)?.owner;
    if info.sender != owner {
        return Err(ContractError::Unauthorized {});
    }
    ...
}
```
You may now exit the CosmJS CLI session with the command `.exit`.
## Challenge
Modify the To-Do List contract so that the contract owner is able to 

* transfer the ownership of the contract to another address.

* set a due date for each To-Do List entry.
  
