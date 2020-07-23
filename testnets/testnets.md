---
title: Joining Testnet
order: 2
---

# Joining Testnets

In this section we will demonstrate how to roll your node and start producing blocks in live testnet environment.

## Setup

First of all make sure you followed the installation steps in [build requirements section](./build-requirements.md). You should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up environment variables:

```sh
export CHAIN_ID=testing
export TESTNET_NAME=demo-09
export RPC=rpc.demo-09.cosmwasm.com:443
export FAUCET=faucet.demo-09.cosmwasm.com
export SEED_NODE=p2p.demo-09.cosmwasm.com:26656
```

Also install `jq`.

## Initialize your wallet

Initialize `wasmcli` and generate validator account:

```sh
wasmcli config chain-id $CHAIN_ID
wasmcli config trust-node true
wasmcli config node https://$RPC
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
# copy the address and paste it to ${WALLET_ADDR} below
wasmcli keys show -a mywallet

# get some hot stake
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"ticker":"STAKE","address":"${WALLET_ADDR}"}' \
  https://$FAUCET/credit

# get coins for paying fees
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"ticker":"COSM","address":"${WALLET_ADDR}"}' \
  https://$FAUCET/credit
```

## Run wasmd node

TODO persistent peer and seed node?

```sh
export MONIKER=new_validator
# initialize wasmd configuration
wasmd init $MONIKER
# get the testnets genesis file
curl https://$RPC/genesis | jq .result.genesis > ~/.wasmd/config/genesis.json
# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOMEDIR/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
export NODE_ID=$(curl https://$RPC/status | jq .result.node_info.id | tr -d '"')

## Start wasmd
wasmd start --p2p.seeds $NODE_ID@$SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

## Become an active validator

To start being an active validator that validates transactions, you need some coins staked to your validators address

TODO not sure about the values here

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

# Live Testnets

Below are the active testnets you can join!

## Demonet (WIP)

- CHAIN_ID: **testing**
- CosmWasm version: **v0.9.1**
- CosmJs version: **v0.21.1**
- RPC: rpc.demo-09.cosmwasm.com:26657
- SEED_NODE: p2p.demo-09.cosmwasm.com:26656
- LCD: lcd.demo-09.cosmwasm.com
- FAUCET: faucet.demo-09.cosmwasm.com
