---
sidebar_position: 4
---

# Environment Setup

You need an environment to run contracts. You can either run your node locally or connect to an existing network. For
easy testing, you can use the public testnet (Malaga-420) to deploy and run your contracts.

When interacting with a network, you can either use `wasmd` which is a Go client or the Node REPL. The Node REPL is
recommended for contract operations, since JSON manipulation is not intuitive with the shell/Go client.

For this course, we will be using the public testnet to make things simpler.

## Gitpod

[Gitpod](https://www.gitpod.io/) is an online development environment. We have a gitpod image that you can base your
projects on. The image contains all the requirements below. Gitpod is only recommended if you have a stable internet connection.
Add [.gitpod.yml](https://github.com/CosmWasm/cosmwasm-template/blob/master/.gitpod.yml) file to your project's root
then push it to GitHub. After installing the [gitpod extension](https://www.gitpod.io/extension-activation/), on the GitHub
project repo, there will be a `Gitpod` button which will create a workspace for you to work on.

## Go {#go}

You can setup golang following the [official documentation](https://github.com/golang/go/wiki#working-with-go). The latest
versions of `wasmd`
require go version `1.18.2+`.

## Rust {#rust}

Assuming you have never worked with rust, you will first need to install some tooling. The standard approach is to
use `rustup` to download dependencies and handle updating multiple versions of
`cargo` and `rustc`, which you will be using.

### Installing Rust in Linux and Mac {#installing-rust-in-linux-and-mac}

First, [install rustup](https://rustup.rs/). Once installed, make sure you have the wasm32 target:

```shell
rustup default stable
cargo version
# If this is lower than 1.55.0+, update
rustup update stable

rustup target list --installed
rustup target add wasm32-unknown-unknown
```

## wasmd {#wasmd}

`wasmd` is the backbone of the CosmWasm platform. It is an implementation of a Cosmoszone with wasm smart contracts
enabled.

This code was forked from the `cosmos/gaia` repository as a base, then x/wasm was added and many
gaia-specific files were cleaned up. However, the wasmd binary should function just like gaiad except for the addition of the x/wasm
module.

If you intend to develop or edit a contract, you need wasmd.

```shell
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd
# If you are updating wasmd, first update your local repository by fetching the remote tags available
git fetch --tags
# replace the v0.27.0 with the most stable version on https://github.com/CosmWasm/wasmd/releases
git checkout v0.27.0
make install

# verify the installation
wasmd version
```

:::info
`make install` will copy `wasmd` to `$HOME/go/bin`
 by default. If you have any problem with the installation of `wasmd`, check your `PATH` and make sure it includes `$HOME/go/bin`. 
:::

## Setting up wasmd and Wallet {#setup-wasmd-and-wallet}

Let's configure the `wasmd` executable, point it to the testnet, create a wallet and ask for tokens from the faucet:

First, source the Malaga cosmwasm public network configuration to the shell:

```shell
source <(curl -sSL https://raw.githubusercontent.com/CosmWasm/testnets/master/malaga-420/defaults.env)
```

Setup the client:

```shell
# add wallets for testing
wasmd keys add wallet
```
:::info
Running the command above will add an encrypted private key to the wasmd keyring and display its attributes as follows: 
```
- name: wallet
  type: local
  address: wasm16ew79ekmhkvulym6auxu3prdhejm646de8d575
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AoUq0+iYyYY9FmCx3vZF2EHhvCq1zDQxIXAH8lEsjOPZ"}'
  mnemonic: ""

**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

share rhythm physical enrich merry female advance wrist mule mistake measure road pupil spell hollow eternal insect blast quit simple kid tooth drastic anger
```
:::

You need some tokens in your address to interact with the network. If you are using a local node you can skip this step. Requesting tokens
from the faucet:

```shell
JSON=$(jq -n --arg addr $(wasmd keys show -a wallet) '{"denom":"umlg","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.malaga-420.cosmwasm.com/credit
```

## Export wasmd Parameters {#export-wasmd-parameters}

`wasmd` client requires to be further configured in order to interact with different testnets.
Each testnet has its own endpoints and system parameters.

An effective way to configure `wasmd` is to define the following environment variables, making use of the network configuration parameters we sourced earlier.

```bash
# bash
export NODE="--node $RPC"
export TXFLAG="${NODE} --chain-id ${CHAIN_ID} --gas-prices 0.25umlg --gas auto --gas-adjustment 1.3"
```
or
```bash
# zsh
export NODE=(--node $RPC)
export TXFLAG=($NODE --chain-id $CHAIN_ID --gas-prices 0.25umlg --gas auto --gas-adjustment 1.3)
```

If the command above throws an error, it means you are utilizing a different type of shell. If there are no errors, try executing the following command:

```bash
wasmd query bank total $NODE
```
A response that is similar to the one below means that you can now interact with the node you have configured.
```shell
pagination:
  next_key: null
  total: "2"
supply:
- amount: "10006916235913"
  denom: uand
- amount: "10000000000000"
  denom: umlg
```
 You can check that your faucet request has been successful by checking the balance of your wallet bank account by trying the command:
```bash
wasmd query bank balances $(wasmd keys show -a wallet) $NODE
```
and you can explore the details about various other commands by running
```bash
wasmd help
```


## Setting up command-line tools

We will be using a few command-line tools extensively:
```shell
apt install jq curl
```

## Setting up the CosmJS CLI client

Another way to utilize and interact with on-chain contracts is using the CosmJS interactive client
[@cosmjs/cli](https://github.com/cosmos/cosmjs/tree/main/packages/cli)

To use it, install [node.js 12+](https://nodejs.org/en/download/) and [npx](https://www.npmjs.com/package/npx) first.

Then,

```shell
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts
```

With that, you should observe the initialization of an interactive session.
## Setting up your IDE {#setting-up-your-ide}

We need a good IDE for developing smart contracts with Rust. We recommend [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) (the community edition will do) coupled with the Rust Plugin.
