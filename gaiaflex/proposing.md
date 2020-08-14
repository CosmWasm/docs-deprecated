---
title: Proposing Smart Contract 
---

## Getting the contract

There are two options to get the contract:

1. Download [source code](https://github.com/CosmWasm/cosmwasm-plus/tree/v0.1.1/contracts/cw20-base), and [compile](./../getting-started/compile-contract.md) it your self.

2. Download pre-compiled binary.
You can download precompiled binary from: https://github.com/CosmWasm/cosmwasm-plus/releases/download/v0.1.1/cw20_base.wasm

::: warning
What could go wrong with
downloading and executing a binary that random people on the internet uploaded right 😉
:::

## Uploading Contract and Submitting Proposals

This command will handle the deployment of the contract and submission of a proposal:

```sh
gaiaflex tx gov submit-proposal wasm-store cw20_base.wasm \
    --source "https://crates.io/api/v1/crates/cw20-base/0.1.1/download" \
    --builder "cosmwasm/rust-optimizer:0.10.1" \
    --title "Enable ETH killer cw20 token" \
    --description "This contract deploys the first cw20 token on the hub" \
    --run-as $(gaiaflex keys show -a wallet) \
    --from wallet \
    --gas auto
```

Here is the output:

```json
{
  "height": "15152",
  "txhash": "A3A1554EDDEE7EAA0A211F563FA60717B299764BAB404F42321E7940E296076B",
  "data": "0000000000000004",
  "raw_log": "[{\"msg_index\":0,\"log\":\"\",\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"submit_proposal\"},{\"key\":\"sender\",\"value\":\"cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv\"},{\"key\":\"module\",\"value\":\"governance\"},{\"key\":\"sender\",\"value\":\"cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv\"}]},{\"type\":\"proposal_deposit\",\"attributes\":[{\"key\":\"amount\"},{\"key\":\"proposal_id\",\"value\":\"4\"}]},{\"type\":\"submit_proposal\",\"attributes\":[{\"key\":\"proposal_id\",\"value\":\"4\"},{\"key\":\"proposal_type\",\"value\":\"StoreCode\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"cosmos10d07y265gmmuvt4z0w9aw880jnsr700j6zn9kn\"},{\"key\":\"sender\",\"value\":\"cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv\"},{\"key\":\"amount\"}]}]}]",
  "logs": [
    {
      "msg_index": 0,
      "log": "",
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "action",
              "value": "submit_proposal"
            },
            {
              "key": "sender",
              "value": "cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv"
            },
            {
              "key": "module",
              "value": "governance"
            },
            {
              "key": "sender",
              "value": "cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv"
            }
          ]
        },
        {
          "type": "proposal_deposit",
          "attributes": [
            {
              "key": "amount"
            },
            {
              "key": "proposal_id",
              "value": "4"
            }
          ]
        },
        {
          "type": "submit_proposal",
          "attributes": [
            {
              "key": "proposal_id",
              "value": "4"
            },
            {
              "key": "proposal_type",
              "value": "StoreCode"
            }
          ]
        },
        {
          "type": "transfer",
          "attributes": [
            {
              "key": "recipient",
              "value": "cosmos10d07y265gmmuvt4z0w9aw880jnsr700j6zn9kn"
            },
            {
              "key": "sender",
              "value": "cosmos1lj0cuh34c5useycd2wl3puqfr57lxd39hn8qcv"
            },
            {
              "key": "amount"
            }
          ]
        }
      ]
    }
  ],
  "gas_wanted": "5162316",
  "gas_used": "5161103"
}
```

