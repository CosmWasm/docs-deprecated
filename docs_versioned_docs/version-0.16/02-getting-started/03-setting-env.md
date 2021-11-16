---
sidebar_position: 3
---

# Setting Up Environment

You need an environment to run contracts. You can either run your node locally or connect to an existing network. For
easy testing, the pebblenet testnet is live. You can use this to deploy and run your contracts. If you want to setup and
run against a local blockchain, [follow these instructions](#run-local-node-optional).

To verify the testnet is currently running, make sure the following URLs are all working for you:

TODO: add deus labs

- [http://rpc.pebblenet.cosmwasm.com/status](http://rpc.pebblenet.cosmwasm.com/status)
- [https://faucet.pebblenet.cosmwasm.com/status](https://faucet.pebblenet.cosmwasm.com/status)
- [http://lcd.pebblenet.cosmwasm.com/node_info](http://lcd.pebblenet.cosmwasm.com/node_info)

We have set up two native tokens - `STAR` (`ustar`) for becoming a validator and `SPONGE` (`upebble`) for paying fees.
Available frontends:

- Block Explorer: [https://block-explorer.pebblenet.cosmwasm.com](https://block-explorer.pebblenet.cosmwasm.com)

You can use these to explore txs, addresses, validators and contracts. Feel free to deploy one pointing to our rpc/lcd
servers and we will list it.

When interacting with this network, you can either use `wasmd` which is a Go client, or the Node REPL. The Node REPL is
recommended for contract operations, since JSON manipulation is not intuitive with the Shell/Go client.

## Setup Go CLI {#setup-go-cli}

Let's configure the `wasmd` executable, point it to the testnet, create a wallet and ask for tokens from faucet:

First source the **uni** network configuration in the shell:

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

# zsh
export NODE=(--node $RPC)
export TXFLAG=($NODE --chain-id $CHAIN_ID --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3)
```

If any of the commands above throws an error, this means your shell is different. If the command succeeded, then try
running:

```bash
wasmd query bank total $NODE
```

Beyond the standard CLI tooling, we have also produced a flexible TypeScript
library [CosmJS](https://github.com/CosmWasm/cosmjs), which runs in Node.js as well as in modern browsers. It handles
queries and submitting transactions. Along with this library, we
produced [@cosmjs/cli](https://www.npmjs.com/package/@cosmjs/cli), which is a super-charged Node console. It
supports `await`, does type checking for helpful error messages, and preloads many CosmJS utilities. If you are
comfortable with the Node console, you will probably find this easier and more powerful than the CLI tooling.

Using the REPL:

```js
// Create or load account
const mnemonic = loadOrCreateMnemonic('fred.key')
mnemonicToAddress(mnemonic)

const {address, client} = await connect(mnemonic, {})
address

client.getAccount()
// if empty - this only works with CosmWasm
hitFaucet(defaultFaucetUrl, address, 'STAR')
client.getAccount()
```
