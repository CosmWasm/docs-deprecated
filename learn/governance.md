---
title: Smart Contracts Over Governance
---

# Introduction

CsomWasm proves the potential of a smart contract container at the heart of the Cosmos Hub. {synopsis}

One of the promises of CosmWasm is to enable flexible smart contract execution on Cosmos Hub. With CosmWasm on the Hub,
network participants can propose to deploy smart contracts, vote in governance to enable them.

In this section you will learn all the knowledge required to experience smart contract on the hub. If you are interested in smart contract
development, digest the [Getting Started](/getting-started/intro.md) documentation.

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
        "permission": "Nobody"
      },
      "instantiate_default_permission": "Nobody"
    }
}
```

These configurations in gaiaflex testnet means only governance can upload and init smart contracts.

### Available configurations
- `code_upload_access` - who can upload a wasm binary: `Nobody`, `Everybody`, `OnlyAddress`. Needs to be defined in the genesis.
can be changed later by governance votes.
- `instantiate_default_permission` - platform default, who can instantiate a wasm binary when the code owner has not set it
In this tutorial, we will show you deploying a smart contract on a governed network.

CosmWasm extends Cosmos SDK governance module to enable deployment of smart contracts after proposals.

## Get Sample cw-subkeys Contract

There are two options to get the sample contract:

1. Download [source code](https://github.com/CosmWasm/cosmwasm-plus/tree/v0.1.1/contracts/cw20-base), and [compile](/getting-started/compile-contract.md) it your self.

2. Download [pre-compiled binary](https://github.com/CosmWasm/cosmwasm-plus/releases/download/v0.1.1/cw20_base.wasm).

## Submit Proposal

Deployment command is down below:

```shell
wasmcli tx gov submit-proposal wasm-store cw1-subkeys.wasm \
 --source “https://github.com/CosmWasm/cosmwasm-plus" \
 —-builder “cosmwasm/workspace-optimizer:0.10.3” \
 —-title “Enable cw1-subkeys functionality” \
 —-description “DAO and DSOs need this!” \
 —-instantiate-everybody “true” \
 —-run-as $(wasmcli keys show -a account)
 —-deposit “10000umuon”
 --from account
```

If you run `wasmcli tx gov submit-proposal wasm-store -h`, you will notice two more important flags:

```shell
--instantiate-everybody string      Everybody can instantiate a contract from the code, optional
--instantiate-only-address string   Only this address can instantiate a contract instance from the code, optional
```

By default, the first flag is enabled. If you want only one address to be able to initiate the contract,
set the `instantiate-only-address` flag.

If either of these flags are set, the voting committee should decide if that is acceptable for the given contract.
Instantiate-everybody might make sense for a multisig (everyone makes their own), but not for creating a new token.

## Vote

After the proposal creation, it needs to be approved by governance voting.
```shell
wasmcli tx gov vote [proposal-id] yes --from account
```

## Instantiate

After the proposal passes the code will be deployed. Now you can instantiate the contract.

```shell
INIT=’{“admins”: [“cosmos12at9uplen85jt2vrfc5fs36s9ed4ahgduclk5a”,”cosmos1v7mjgfyxvlqt7tzj2j9fwee82fh6ra0jvhrxyp”,”cosmos18rkzfn65485wq68p3ylv4afhgguq904djepfkk”,”cosmos1xxkueklal9vejv9unqu80w9vptyepfa95pd53u”], “mutable”: true}’
wasmcli tx wasm instantiate [code_id] “$INIT” \
 --label “UP-101 Funding Account”
 —-amount 2000000uatom
 --from account
```

## Interact

If you have admin access to the contract you can add or remove admins by running the command:

```
export UPDATE_ADMINS_MSG=’{“update_admins”: {“admins”:[“cosmos1u3nufc2kjslj2t3pugxhjv4zc8adw5thuwu0tm”, “cosmos1fp9qlazkm8kgq304kalev6e69pyp5kmdd5pcgj”]}}’
wasmcli tx wasm execute $CONTRACT_ADDRESS “$UPDATE_ADMINS_MSG” \
--from account
```

Subkey allowances can execute send token transaction using the command:
```
export SEND_MSG=’{“execute”:{“msgs”:[{“bank”:{“send”:{“amount”:[{“denom”:”umuon”,”amount”:”1000"}],”from_address”:”cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5",”to_address”:”cosmos1cs63ehtq6lw86vc87t42cnhcmydtnrffzdjhkz”}}}]}}’
wasmcli tx wasm execute $CONTRACT_ADDRESS “$SEND_MSG” --from account
```
