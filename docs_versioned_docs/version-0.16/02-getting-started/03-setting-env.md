---
sidebar_position: 3
---

# Setting Up Environment

You need an environment to run contracts. You can either run your node locally or connect to an existing network. For
easy testing, pebblenet network is online, you can use it to deploy and run your contracts.

To verify testnet is currently running, make sure the following URLs are all working for you:

- [https://rpc.pebblenet.cosmwasm.com/status](https://rpc.pebblenet.cosmwasm.com/status)
- [https://faucet.pebblenet.cosmwasm.com/status](https://faucet.pebblenet.cosmwasm.com/status)
- [https://lcd.pebblenet.cosmwasm.com/node_info](https://lcd.pebblenet.cosmwasm.com/node_info)

Available frontends:

- Block Explorer: [https://block-explorer.pebblenet.cosmwasm.com](https://block-explorer.pebblenet.cosmwasm.com)

You can use these to explore txs, addresses, validators and contracts feel free to deploy one pointing to our rpc/lcd
servers and we will list it.

You can find more information about other testnets:
[CosmWasm/testnets](https://github.com/CosmWasm/testnets) and [Testnet section](/ecosystem/testnets/testnets).

When interacting with network, you can either use `wasmd` which is a Go client or Node REPL. Although Node REPL is
recommended for contract operations, since JSON manipulation is not intuitive with the Shell/Go client.

## Setup Go CLI {#setup-go-cli}

Let's configure `wasmd` exec, point it to testnets, create wallet and ask tokens from faucet:

First source the pebblenet network configurations to the shell:

```shell
source <(curl -sSL https://raw.githubusercontent.com/CosmWasm/testnets/master/pebblenet-1/defaults.env)
```

Setup the client:

```shell
# add wallets for testing
wasmd keys add wallet
>
{
  "name": "wallet",
  "type": "local",
  "address": "wasm13nt9rxj7v2ly096hm8qsyfjzg5pr7vn5saqd50",
  "pubkey": "wasmpub1addwnpepqf4n9afaefugnfztg7udk50duwr4n8p7pwcjlm9tuumtlux5vud6qvfgp9g",
  "mnemonic": "hobby bunker rotate piano satoshi planet network verify else market spring toward pledge turkey tip slim word jaguar congress thumb flag project chalk inspire"
}

wasmd keys add wallet2
```

You need some tokens in your address to interact. If you are using local node you can skip this step. Requesting tokens
from faucet:

```shell
JSON=$(jq -n --arg addr $(wasmd keys show -a wallet) '{"denom":"upebble","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.pebblenet.cosmwasm.com/credit
JSON=$(jq -n --arg addr $(wasmd keys show -a wallet2) '{"denom":"upebble","address":$addr}') && curl -X POST --header
"Content-Type: application/json" --data "$JSON" https://faucet.pebblenet.cosmwasm.com/credit
```

## Export wasmd Parameters {#export-wasmd-parameters}

If you intend to use wasmd as client, we recommend you to setup these variables. Otherwise You will have to define type
in node, chain id and gas-prices details with every command you execute. Also for this tutorial we will use these
variables. So make sure you export these before proceeding.

```bash
# bash
export NODE="--node $RPC"
export TXFLAG="${NODE} --chain-id ${CHAIN_ID} --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3"

# if your shell is zsh follow these
# zsh
export NODE=(--node $RPC)
export TXFLAG=($NODE --chain-id $CHAIN_ID --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3)
```

## Run Local Node (optional) {#run-local-node-optional}

This is not required and for those who want extra challenge.
You can set up a local node for yourself, but we recommend sticking to testnet.
Script down below will setup a local network:

```shell
# default home is ~/.wasmd
# if you want to setup multiple apps on your local make sure to change this value
APP_HOME="~/.wasmd"
RPC="http://localhost:26657"
CHAIN_ID="localnet"
# initialize wasmd configuration files
wasmd init localnet --chain-id ${CHAIN_ID} --home ${APP_HOME}

# add minimum gas prices config to app configuration file
sed -i -r 's/minimum-gas-prices = ""/minimum-gas-prices = "0.01ucosm"/' ${APP_HOME}/config/app.toml

# Create main address
# --keyring-backend test is for testing purposes
# Change it to --keyring-backend file for secure usage.
export KEYRING="--keyring-backend test --keyring-dir $HOME/.wasmd_keys"
wasmd keys add main $KEYRING

# create validator address
wasmd keys add validator $KEYRING

# add your wallet addresses to genesis
wasmd add-genesis-account $(wasmd keys show -a main $KEYRING) 10000000000ucosm,10000000000stake --home ${APP_HOME}
wasmd add-genesis-account $(wasmd keys show -a validator $KEYRING) 10000000000ucosm,10000000000stake --home ${APP_HOME}

# add fred's address as validator's address
wasmd gentx validator 1000000000stake --home ${APP_HOME} --chain-id ${CHAIN_ID} $KEYRING

# collect gentxs to genesis
wasmd collect-gentxs --home ${APP_HOME}

# validate the genesis file
wasmd validate-genesis --home ${APP_HOME}

# run the node
wasmd start --home ${APP_HOME}
```
