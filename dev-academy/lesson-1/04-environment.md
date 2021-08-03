---
sidebar_position: 3
---

# Environment Setup

You need an environment to run contracts. You can either run your node locally or connect to an existing network. For
easy testing, oysternet network is online, you can use it to deploy and run your contracts.

When interacting with network, you can either use `wasmd` which is a Go client or Node REPL. Although Node REPL is
recommended for contract operations, since JSON manipulation is not intuitive with the Shell/Go client.

For the whole course, we will be using a public testnet to make things simpler.

## Go {#go}

You can setup golang following [official documentation](https://github.com/golang/go/wiki#working-with-go). The latest
versions of `wasmd`
require go version `v1.15`.

## Rust {#rust}

Assuming you have never worked with rust, you will first need to install some tooling. The standard approach is to
use `rustup` to maintain dependencies and handle updating multiple versions of
`cargo` and `rustc`, which you will be using.

### Installing Rust in Linux and Mac {#installing-rust-in-linux-and-mac}

First, [install rustup](https://rustup.rs/). Once installed, make sure you have the wasm32 target:

```shell
rustup default stable
cargo version
# If this is lower than 1.50.0+, update
rustup update stable

rustup target list --installed
rustup target add wasm32-unknown-unknown
```

## wasmd {#wasmd}

`wasmd` is the backbone of CosmWasm platform. It is the implementation of a Cosmoszone with wasm smart contracts
enabled.

This code was forked from the `cosmos/gaia` repository as a basis and then added x/wasm and cleaned up many
gaia-specific files. However, the wasmd binary should function just like gaiad except for the addition of the x/wasm
module.

If you intend to develop or edit a contract, you need wasmd.

```shell
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd
# replace the v0.16.0 with the most stable version on https://github.com/CosmWasm/wasmd/releases
git checkout v0.16.0
make install

# verify the installation
wasmd version
```

:::info
If you have any problems here, check your `PATH`. `make install` will copy `wasmd` to
`$HOME/go/bin` by default, please make sure that is set up in your `PATH` as well, which should be the case in general
for building Go code from source.
:::

## Setup wasmd and Wallet

Let's configure `wasmd` exec, point it to testnets, create wallet and ask tokens from faucet:

First source the oysternet cosmwasm public network configurations to the shell:

```shell
source <(curl -sSL https://raw.githubusercontent.com/CosmWasm/testnets/master/oysternet-1/defaults.env)
```

Setup the client:

```shell
# add wallets for testing
wasmd keys add main
>
{
  "name": "main",
  "type": "local",
  "address": "wasm13nt9rxj7v2ly096hm8qsyfjzg5pr7vn5saqd50",
  "pubkey": "wasmpub1addwnpepqf4n9afaefugnfztg7udk50duwr4n8p7pwcjlm9tuumtlux5vud6qvfgp9g",
  "mnemonic": "hobby bunker rotate piano satoshi planet network verify else market spring toward pledge turkey tip slim word jaguar congress thumb flag project chalk inspire"
}

```

You need some tokens in your address to interact. If you are using local node you can skip this step. Requesting tokens
from faucet:

```shell
JSON=$(jq -n --arg addr $(wasmd keys show -a main) '{"denom":"usponge","address":$addr}') && curl -X POST --header
"Content-Type: application/json" --data "$JSON" https://faucet.oysternet.cosmwasm.com/credit
```

## Export wasmd Parameters {#export-wasmd-parameters}

`wasmd` client requries setup for interacting with different testnets.
Each testnet has its own endpoints and system parameters.

Best way to configure `wasmd` is by setting up environment variables below:

```bash
# bash
export NODE="--node $RPC"
export TXFLAG="${NODE} --chain-id ${CHAIN_ID} --gas-prices 0.001usponge --gas auto --gas-adjustment 1.3"

# zsh
export NODE=(--node $RPC)
export TXFLAG=($NODE --chain-id $CHAIN_ID --gas-prices 0.001usponge --gas auto --gas-adjustment 1.3)
```

If command above throws error, this means your shell is different. If no errors, try running this:

```bash
wasmd query bank total $NODE
```

## Setting up your IDE {#setting-up-your-ide}

We need a good IDE for developing rust smart contracts. We recommend Intellij with Rust Plugin.
