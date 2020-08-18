---
title: Introduction
---

# Introduction

GaiaFlex proves the potential of a smart contract container at the heart of the Cosmos Hub. {synopsis}

One of the promises of CosmWasm is to enable flexible smart contract execution on Cosmos Hub. With CosmWasm on the Hub,
network participants can propose to deploy smart contracts, vote in governance to enable them.

In this section you will learn all the knowledge required to experience smart contract on the hub. If you are interested in smart contract
development, digest the [Getting Started](./../getting-started/intro.md) documentation.

## Wasmd Authorization Settings

CosmWasm provides on-chain smart contract deployment authorization mechanisms that can be configured many ways:

- Free for all, meaning fully without an admin. Anyone can deploy.
- Fully permissioned, meaning only an admin can deploy.
- By on-chain governance. Deployment of a contract is determined by governance votes.
- By owner, contract by contract basis.

### Enable Governance Proposals at Compile Time

As gov proposals bypass the existing authorization policy they are disabled and require to be enabled at compile time.
```
-X github.com/CosmWasm/wasmd/app.ProposalsEnabled=true - enable all x/wasm governance proposals (default false)
-X github.com/CosmWasm/wasmd/app.EnableSpecificProposals=MigrateContract,UpdateAdmin,ClearAdmin - enable a subset of the x/wasm governance proposal types (overrides ProposalsEnabled)
```

If you are using `gaiaflex` binary executable you don't need to build using flags above since it is already included in
the binary build.

### Init Parameters Via Genesis

Initial authorization configuration is in genesis file:

```json
    "wasm": {
      "params": {
        "code_upload_access": {
          "permission": "Everybody"
        },
        "instantiate_default_permission": "Everybody"
      }
    },
```

#### Available configurations
- `code_upload_access` - who can upload a wasm binary: `Nobody`, `Everybody`, `OnlyAddress`. Needs to be defined in the genesis.
can be changed later by governance votes.
- `instantiate_default_permission` - platform default, who can instantiate a wasm binary when the code owner has not set it
