---
title: Proposing Smart Contract
---

## Getting the contract

There are two options to get the sample contract:

1. Download [source code](https://github.com/CosmWasm/cosmwasm-plus/tree/v0.1.1/contracts/cw20-base), and [compile](./../getting-started/compile-contract.md) it your self.

2. Download pre-compiled binary.
You can download precompiled binary from: https://github.com/CosmWasm/cosmwasm-plus/releases/download/v0.1.1/cw20_base.wasm

::: warning
What could go wrong with
downloading and executing a binary uploaded by some random people on the internet right 😉
:::

## Uploading Contract and Submitting Proposals

This command will handle the deployment of the contract and submission of a proposal and extract code ID from the
response for later use:

This is the basic wasm code store submit proposal:

::: Warning
Do not run copy paste this command since contract permissions is not defined
:::

```sh
gaiaflex tx gov submit-proposal wasm-store cw20_base.wasm \
    --source "https://crates.io/api/v1/crates/cw20-base/0.1.1/download" \
    --builder "cosmwasm/rust-optimizer:0.10.1" \
    --title "Enable ETH killer cw20 token" \
    --description "This contract deploys the first cw20 token on the hub" \
    --run-as $(gaiaflex keys show -a faucet) \
    --from faucet --fees "1000000umuon" --gas auto

gaiaflex tx gov submit-proposal instantiate-contract 1 $INIT --label my-test --admin cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv  --title instantiate --description test --run-as cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv --amount 100000umuon --deposit 101111umuon --from orkun --gas auto --gas-adjustment=1.12 --gas-prices "0.025umuon"
```

Now the clock is ticking for voting period to end.

Deposit: ```gaiaflex  tx gov deposit 2 10000000umuon --from orkun --gas auto```
Vote: ```gaiaflex tx gov vote 2 yes --from orkun --fees 500000umuon```

## Instantiating Contract

gaiaflex tx gov submit-proposal instantiate-contract 1 $INIT --label my-test \
    --admin cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv \
    --title instantiate --description test --run-as cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv \
    --amount 100000umuon --deposit 101111umuon --from acc --gas auto --gas-adjustment=1.12 --gas-prices "0.025umuon"

Deposit: ```gaiaflex  tx gov deposit 2 10000000umuon --from orkun --gas auto```
Vote: ```gaiaflex tx gov vote 2 yes --from orkun --fees 500000umuon```

