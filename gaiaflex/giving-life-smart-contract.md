---
title: Giving Life to a Smart Contract over Governance
---

# Giving Life to a Smart Contract with Voting

## Getting the contract

There are two options to get the sample contract:

1. Download [source code](https://github.com/CosmWasm/cosmwasm-plus/tree/v0.1.1/contracts/cw20-base), and [compile](./../getting-started/compile-contract.md) it your self.

2. Download [pre-compiled binary](https://github.com/CosmWasm/cosmwasm-plus/releases/download/v0.1.1/cw20_base.wasm).

::: warning
What could go wrong with
downloading and executing a binary uploaded by some random people on the internet right 😉
:::

### Uploading Contract and Submitting Proposals

This command will handle the deployment of the contract and submission of a proposal and extract **Code ID** from the
response for later use:

This is the signature of wasm code store submit proposal:

```shell script
gaiaflex tx gov submit-proposal wasm-store [wasm file] \
  --source [source] --builder [builder] --title [text] \
  --description [text] --run-as [address] [flags]
```

`--run-as` flag is the contract creator, and it is required.

If you run `gaiaflex tx gov submit-proposal wasm-store -h`, you will notice two more important flags:

```shell
--instantiate-everybody string      Everybody can instantiate a contract from the code, optional
--instantiate-only-address string   Only this address can instantiate a contract instance from the code, optional
```

By default the first flag is enabled. If you want only one address to be able to initiate the contract,
set the `instantiate-only-address` flag.

Sending proposal tx script:

```shell script
export PROPOSAL_ID=$(gaiaflex tx gov submit-proposal wasm-store cw20_base.wasm \
    --source "https://crates.io/api/v1/crates/cw20-base/0.1.1/download" \
    --builder "cosmwasm/rust-optimizer:0.10.1" --deposit 100000umuon  \
    --title "Enable sample cw20 token" \
    --description "This contract deploys the first cw20 token on the hub" \
    --run-as $(gaiaflex keys show -a acc) \
    --from orkun --gas auto --gas-adjustment "1.12" -y | jq -r .data)
```

Now the clock is ticking for voting period to end.

Vote using the command:
```shell script
gaiaflex tx gov vote $PROPOSAL_ID yes --from acc
```

### Instantiating Contract

Now the wasm code is stored to the chain after the voting period is ended and result is yes. A one more voting needs to be done
to initiate the contract from the code with arguments.

```shell script
INIT='{"name":"Golden Stars","symbol":"STAR","decimals":2,"initial_balances":[{"address":"cosmos1x200a23zc2acc22mmy9pu4fuacl79w0yj4leqr","amount":"10000"},{"address":"cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv","amount":"10000"}],"mint":{"minter":"cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv"}}'
gaiaflex tx gov submit-proposal instantiate-contract $PROPOSAL_ID $INIT --label "Init cw20 token" \
    --admin  \
    --run-as cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv \
    --title instantiate --description test \
    --amount 100000umuon --deposit 101111umuon --from acc --gas auto --gas-adjustment=1.12 --gas-prices
```

Vote: ```gaiaflex tx gov vote 2 yes --from acc --gas auto --gas-prices "0.025umuon"```

## Execute the contract

Execution of a contract same as in [CW20 tutorial](../learn/using-contracts) section. Main difference is: TODO

## Migrating Contract

**Documentation WIP**

Here is a code migration contract if contracts supports the feature.

```shell script
gaiaflex tx gov submit-proposal migrate-contract $CONTRACT_ADDRESS $NEW_CODE_ID $MIGRATION_ARGS --title burner \
  --description "perform migration" --run-as $(gaiaflex keys show -a code-runner) \ --deposit 1000umuon  --from acc \
  --gas auto --gas-prices="0.025umuon"
````

## Set Admin

A live contract's admin can be changed later with another voting:

```shell script
gaiaflex tx gov submit-proposal set-contract-admin $CONTRACT_ADDRESS $NEW_ADMIN_ADDRESS --title "Update a contracts adming" \
  --description "such a description "--deposit 10000umuon --from acc --gas auto --gas-prices="0.025umuon"
```

## Clear Admin

And a contract can be adminless:

```shell script
gaiaflex tx gov submit-proposal clear-contract-admin $CONTRACT_ADDRESS --title clear-admin --description "Cotnract is stable" \
  --deposit 10000umuon --from acc --gas auto --gas-prices="0.025umuon"
```
