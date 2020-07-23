---
title: Joining Testnet
order: 2
---

# Joining Testnets

In this section we will demonstrate how to roll your node and start producing blocks in live testnet environment.

## Setup

First of all make sure you followed the installation steps in [build requirements section](./build-requirements.md). You should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up environment variables: `$CHAIN_ID`, `$TESTNET_NAME`, `$RPC`, `$FAUCET` and `$SEED_NODE`

```sh
export CHAIN_ID=testing
export TESTNET_NAME=demo-09
export RPC=https://rpc.demo-09.cosmwasm.com:443
export FAUCET=https://faucet.demo-09.cosmwasm.com
export SEED_NODE=p2p.demo-09.cosmwasm.com:26656
```

## Initialize your validators wallet

In order to join the network as validator, you need some staking tokens. We have a faucet running for that.

Initialize `wasmcli` and generate validator account:

```sh
wasmcli config chain-id $CHAIN_ID
wasmcli config trust-node true
wasmcli config node $RPC
wasmcli config output json
wasmcli config indent true
# this is important, so the cli returns after the tx is in a block,
# and subsequent queries return the proper results
wasmcli config broadcast-mode block

# check you can connect
wasmcli query supply total
wasmcli query staking validators
wasmcli query wasm list-code

# create validor address
wasmcli keys add validator
```

Request some tokens from faucet:

```sh
export VAL_ADDR=$(wasmcli keys show -a validator)

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"ticker":"STAKE","address":"${VAL_ADDR}"}' \
  $FAUCET/credit
```

## Run the wasmd node

```sh
export WASMD_HOME=$HOME

# initialize wasmd configuration
wasmd init <moniker> --home $WASMD_HOME # default homedir is $HOME
# get the testnets genesis file
curl https://$RPC_ENDPOINT/genesis | jq .result.genesis > $WASMD_HOME/genesis.json
# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOMEDIR/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
NODE_ID=$(curl https://$RPC_ENDPOINT/status | jq .result.node_info.id | tr -d '"')

## Start wasmd
wasmd start --p2p.seeds $NODE_ID@$P2P
```
 
Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

# Live Testnets

## Demonet (WIP)

- CHAIN_ID: **testing**
- CosmWasm version: **v0.9.1**
- CosmJs version: **v0.21.1**
- RPC: https://rpc.demo-09.cosmwasm.com:26657
- SEED_NODE: p2p.demo-09.cosmwasm.com:26656
- LCD: https://lcd.demo-09.cosmwasm.com
- FAUCET: https://faucet.demo-09.cosmwasm.com/credit
