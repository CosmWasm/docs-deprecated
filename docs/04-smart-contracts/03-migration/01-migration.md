---
sidebar_position: 1
---

# Migration

Migration is the process through which a given smart contracts code can be swapped out or 'upgraded'.

CosmWasm made contract migration a first-class experience. When instantiating a contract, there is an optional admin field that you can set. If it is left empty, the contract is immutable. If it is set (to an external account or governance contract), that account can trigger a migration. The admin can also change admin or even make the contract fully immutable after some time. However, when we wish to migrate from contract A to contract B, contract B needs to be aware somehow of how the state was encoded.

This is where CW2 comes in. It specifies one special Singleton to be stored on disk by all contracts on instantiate. When the migrate function is called, then the new contract can read that data and see if this is an expected contract we can migrate from. And also contain extra version information if we support multiple migrate paths.

Working with CW2 is quite straightforward in that, as a smart contract developer you need only perform a couple of steps. 

The CW2 Spec provides a `set_contract_version` which should be used in instantiate to store the original version of a contract. It is important to also set_contract_version again after a successful migration to update it.

Additionally, `get_contract_version` is provided in CW2 which can and should be used in the `migrate` function of the contract when you need to know the previous version of the contract. Both methods work on a `Item` data structure from `cw_storage_plus` which operates over this object:

```rust
#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
pub struct ContractVersion {
    /// contract is the crate name of the implementing contract, eg. `crate:cw20-base`
    /// we will use other prefixes for other languages, and their standard global namespacing
    pub contract: String,
    /// version is any string that this implementation knows. It may be simple counter "1", "2".
    /// or semantic version on release tags "v0.7.0", or some custom feature flag list.
    /// the only code that needs to understand the version parsing is code that knows how to
    /// migrate from the given contract (and is tied to it's implementation somehow)
    pub version: String,
}
```

## Setting up a contract for migrations

Performing a contract migration is a three step process. First, you must write a newer version of the contract you wish to update. Second, you can upload the new code as you did before, but don’t instantiate it. Third, you use a dedicated [MsgMigrateContract](https://github.com/CosmWasm/wasmd/blob/v0.20.0/proto/cosmwasm/wasm/v1/tx.proto#L94-L104) transaction to point this contract to use the new code. And you are done!

The `migrate` fucntion itself, exposes the ability to make any granular changes needed to the State, akin to a database migration or any other things you might want to do.

If the migrate function returns an error, the transaction aborts, all state changes are reverted and the migration is not performed.

Provided below are a few variants on migrations you could do ranging from a very simple one, to a more restricted one by code iD and type. 



### Basic Contract Migration 

### Restricted Migration by code type 

## Platform Specific Variations 

### Terra 

Terra has some specific differences in how they manage migrations. Firstly; the contract must have been set as migratable on instantiation. The contract needs to have an admin for migratability.
Specifically migration in Terra refers to swapping out the code id for a new one that is consider 'compatible' (CW2 helps with this). [Source](https://docs.terra.money/Reference/Terra-core/Module-specifications/spec-wasm.html#interaction).

> Note: In Terra, it is also possible to migrate a code_id across chains (COL4->5 for example). This operation is atomic and can only be performed once. Its intention is to migrate your code to the new chain and preserve its old code ID. This process helps to prevent downstream breakages of other contracts on the new network which depend on your old code ID.