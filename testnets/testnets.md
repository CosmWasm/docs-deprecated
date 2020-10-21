---
title: Joining Testnets
order: 2
---

In this section we will explain how to join testnets, where to find testnet configurations and some scripts to make the process faster.

## Select Your Network

You can find active and in-active testnet information such as configs and endpoints on [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

## Setup

Let's start rolling your node and start producing blocks in testnet environment.

**Before starting**, you can use [CosmWasm/tesnets/devops](https://github.com/CosmWasm/testnets/tree/master/devops) that contains easy setup scripts for wasmd
node, faucet, [block explorer](https://github.com/CosmWasm/big-dipper), lcd, nginx etc. Scripts
below does the some thing as **devops repo** in essence, just more manual and excludes nginx and system supervisor. Feel free
to use them.

First of all make sure you followed the installation steps in [build requirements section](./build-requirements.md). You should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up environment variables:

Below is the [heldernet configuration](https://github.com/CosmWasm/testnets/tree/master/heldernet).

```shell
export CHAIN_ID="hackatom-wasm"
export TESTNET_NAME="heldernet"
export WASMD_VERSION="v0.11.1"
export CONFIG_DIR=".wasmd"
export BINARY="wasmd"
export CLI_BINARY="wasmcli"

export COSMJS_VERSION="v0.23.0"
export GENESIS_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/heldernet/config/genesis.json"
export APP_CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/heldernet/config/app.toml"
export CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/heldernet/config/config.toml"

export RPC="https://rpc.heldernet.cosmwasm.com:443"
export LCD="https://lcd.heldernet.cosmwasm.com"
export FAUCET="https://faucet.heldernet.cosmwasm.com"
export SEED_NODE="456ac8ae0f4a1b11e6eb2ddd0ac97857e78e4353@78.47.97.169:26656"
```

::: tip
We have setup different executables for each testnet names after network names like: `corald/coral`, `gaiaflexd/gaiaflex`
:::

For running these scripts seamlessly, We recommend you to create a directory for CosmWasm tooling:
`mkdir CosmWasm && cd CosmWasm && export CW_DIR=$(pwd)`

```shell
cd $CW_DIR
git clone https://github.com/CosmWasm/wasmd
cd wasmd
# Check which version to use on testnets repo
git checkout $WASMD_VERSION
# generate coral executables
make build # make build-gaiaflex, make build etc...
# add the executables to path
export PATH="${PATH}:$(pwd)/build"
```

## Initialize Your Wallet

Initialize `coral` and generate validator account:

```shell
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

## Joining Live Testnets

### Run wasmd Node

```shell
export MONIKER=new_validator
# initialize wasmd configuration
wasmd init $MONIKER

# get the testnets genesis file
curl -sSL $GENESIS_URL > ~/.wasmd/config/genesis.json

# get app.toml. Minimum gas prices must be 0.025ucosm
curl -sSL $APP_CONFIG_URL > ~/.wasmd/config/app.toml

# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOME/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
## Start wasmd
wasmd start --p2p.seeds $SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

### Become An Active Validator(optional)

In order to join the network as validator, you need some staking tokens.
Please ask some in [discord testnets channel](https://docs.cosmwasm.com/chat)

If you want to participate in active block building, you need some coins staked to your validators address.

For those interested in validator stack, here is a good reading source on validator architectures: [certus one blog](https://kb.certus.one/)

**Note**: make sure your validator is synced before upgrading to validator

```shell
wasmcli tx staking create-validator \
  --amount=100000000stake \
  --pubkey=$(wasmd tendermint show-validator) \
  --moniker=$MONIKER \
  --chain-id=hackatom-wasm \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --fees=5000ucosm
  --from=mywallet
```

### Run the Light Client Daemon

```shell
wasmcli rest-server
# if the node is running on another machine use:
wasmcli rest-server --node tcp://<host>:<port>
```

## Joining To Be Launched Testnets

::: tip
You need to have your address and informations defined in networks genesis file to join not yet launched testnets.
Here is the script you can run to take care of it automatically. It uses `wasmd` [network specific executables](https://github.com/CosmWasm/testnets/tree/master/wasmnet):
:::
  
```shell
cd $CW_DIR
## Fork github.com:CosmWasm/testnets to your account and clone.
## You cannot push directly to CosmWasm/testnets repo
git clone git@github.com:<your-name>/testnets
cd testnets
git checkout -b add-gen-acc-<validator-name>
cd $TESTNET_NAME

wasmcli keys add validator
wasmd add-genesis-account --home . $(wasmcli keys show -a validator) 100000000ucosm,100000000stake
# please sort the genesis file, so the diff makes sense
SORTED=$(jq -S . < ./config/genesis.json) && echo "$SORTED" > ./config/genesis.json

git add ./config/genesis.json
git commit -m "Add <myvalidator> account to network genesis"
git push

# Open PR to CosmWasm/testnets:master (https://github.com/CosmWasm/testnets)
```

After the network is launched you can follow [Joining Live Testnets](#joining-live-testnets).

## Deploying Contracts to Testnet

[Getting Started section](../getting-started/intro.md) is the best reading source that teaches you the process of compiling and deploying contracts using a basic smart contract. If you are interested in developing your own contracts, after reading getting started tutorials head to [Hijacking Escrow](../learn/hijack-escrow/intro.md) where you play around with the example escrow contract.
