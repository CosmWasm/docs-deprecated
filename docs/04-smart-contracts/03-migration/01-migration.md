---
sidebar_position: 1
---

# Migration

Migration is the process through which a given smart contracts code can be swapped out or 'upgraded'.

CosmWasm made contract migration a first-class experience. When instantiating a contract, there is an optional admin field that you can set. If it is left empty, the contract is immutable. If it is set (to an external account or governance contract), that account can trigger a migration. The admin can also change admin or even make the contract fully immutable after some time.

## Platform Specific Variations 

### Terra 

Terra has some specific differences in how they manage migrations. Firstly; the contract must have been set as migratable on instantiation. The contract needs to have an admin for migratability.
Specifically migration in Terra refers to swapping out the code id for a new one that is consider 'compatible' (CW2 helps with this). [Source](https://docs.terra.money/Reference/Terra-core/Module-specifications/spec-wasm.html#interaction).

> Note: In Terra, it is also possible to migrate a code_id across chains (COL4->5 for example). This operation is atomic and can only be performed once. Its intention is to migrate your code to the new chain and preserve its old code ID. This process helps to prevent downstream breakages of other contracts on the new network which depend on your old code ID.