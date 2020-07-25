---
title: Joining Testnet
order: 2
---

In this section we will explain how to join testnets, where to find testnet configurations and some scripts to demonstrate make the process faster.

# Select Your Network

You can find active and in-active testnet information such as configs and endpoints on [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

# Connect Your Validator/Node

Let's start rolling your node and start producing blocks in live testnet environment.

## Setup

First of all make sure you followed the installation steps in [build requirements section](./build-requirements.md). You should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up environment variables:

Below is the [demonet configuration](https://github.com/CosmWasm/testnets/blob/master/demo-09/config).
You can find the other networks configurations at [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

```sh
export CHAIN_ID=testing
export TESTNET_NAME=demo-09
export RPC=https://rpc.demo-09.cosmwasm.com:443
export FAUCET=https://faucet.demo-09.cosmwasm.com
export SEED_NODE=26c9c79dc62b5ddc753bb9fcce022fcc98b5a8cf@p2p.demo-09.cosmwasm.com:26656
```

Also install `jq`.

## Initialize your wallet

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

# create wallet
wasmcli keys add mywallet
```

In order to join the network as validator, you need some staking tokens. We have a faucet running for that.

Request some tokens from faucet:

```sh
JSON=$(jq -n --arg addr $(wasmcli keys show -a mywallet) '{"ticker":"COSM","address":$addr}')
curl -X POST --header "Content-Type: application/json" --data "$JSON" https://$FAUCET/credit

JSON=$(jq -n --arg addr $(wasmcli keys show -a mywallet) '{"ticker":"STAKE","address":$addr}')
curl -X POST --header "Content-Type: application/json" --data "$JSON" https://$FAUCET/credit
```

## Run wasmd node

```sh
export MONIKER=new_validator
# initialize wasmd configuration
wasmd init $MONIKER
# get the testnets genesis file
curl $RPC/genesis | jq .result.genesis > ~/.wasmd/config/genesis.json
# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOMEDIR/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
## Start wasmd
wasmd start --p2p.seeds $SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

## Become an active validator(optional)

If you want to participate in active block building, you need some coins staked to your validators address. If you are interested in validator tech stack, [certus one blog](https://kb.certus.one/) is a good resource to begin with.

**Note: make sure your validator is synced before upgrading to validator

```sh
wasmcli tx staking create-validator \
  --amount=1000000ustake \
  --pubkey=$(wasmd tendermint show-validator) \
  --moniker=$MONIKER \
  --chain-id=testing \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --gas="auto" \
  --gas-adjustment="1.1" \
  --from=mywallet
```

## Run the Light Client Daemon

```sh
wasmcli rest-server
# if the node is running on another machine use:
wasmcli rest-server --node tcp://<host>:<port>
```
