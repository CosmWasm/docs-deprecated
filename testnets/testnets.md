---
title: Joining Testnets
order: 2
---

In this section we will explain how to join testnets, where to find testnet configurations, and some scripts to make the process faster.

## Select Your Network

You can find active and in-active testnet information such as configs and endpoints on [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

## Setup

Let's start rolling your node and start producing blocks in testnet environment.

**Before starting**, you can use [CosmWasm/tesnets/devops](https://github.com/CosmWasm/testnets/tree/master/devops) that contains easy setup scripts for wasmd
node, faucet, [block explorer](https://github.com/CosmWasm/big-dipper), lcd, nginx etc. Scripts
below does the some thing as **devops repo** in essence, just more manual and excludes nginx and system supervisor. Feel free
to use them. We use [cosmovisor](https://github.com/cosmos/cosmos-sdk/tree/master/cosmovisor) upgrade manager to handle network upgrades.
Our installation scripts can help you with both setting up cosmovisor and wasmd: [wasmd w/cosmovisor setup scripts](https://github.com/CosmWasm/testnets/tree/master/devops/node/cosmovisor)g

### Manual Setup

First of all make sure you followed the installation steps in [build requirements section](./build-requirements.md). You should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up environment variables:

Below is the [musselnet configuration](https://github.com/CosmWasm/testnets/tree/master/musselnet).

```shell
export CHAIN_ID="musselnet-4"
export TESTNET_NAME="musselnet-4"
export WASMD_VERSION="v0.15.0"
export CONFIG_DIR=".wasmd"
export BINARY="wasmd"

export COSMJS_VERSION="v0.24.2"
export GENESIS_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/musselnet/config/genesis.json"
export APP_CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/musselnet/config/app.toml"
export CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/musselnet/config/config.toml"

export RPC="https://rpc.musselnet.cosmwasm.com:443"
export LCD="https://lcd.musselnet.cosmwasm.com"
export FAUCET="https://faucet.musselnet.cosmwasm.com"

export COSMOVISOR_VERSION=v0.41.0
export COSMOVISOR_HOME=/root/.wasmd
export COSMOVISOR_NAME=wasmd

export SEED_NODE="c065c5ac440d1a9ba484a9a8b25c24d264b0a1a6@49.12.67.47:26656"
```

For running these scripts seamlessly, We recommend you to create a directory for CosmWasm tooling:
`mkdir CosmWasm && cd CosmWasm && export CW_DIR=$(pwd)`

```shell
cd $CW_DIR
git clone https://github.com/CosmWasm/wasmd
cd wasmd
# Check which version to use on testnets repo
git checkout $WASMD_VERSION
# build wasmd
make build
# add the executables to path
export PATH="${PATH}:$(pwd)/build"
```

Initialize wallet using command:

```shell
# create wallet
wasmd keys add mywallet
```

## Joining Live Testnets

### Run wasmd Full Node

```shell
export MONIKER=new_validator
# initialize wasmd configuration
wasmd init $MONIKER

# get the testnets genesis file
curl -sSL $GENESIS_URL > ~/.wasmd/config/genesis.json

# get app.toml. Minimum gas prices must be 0.025umayo
curl -sSL $APP_CONFIG_URL > ~/.wasmd/config/app.toml

# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOME/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
## Start wasmd
wasmd start --p2p.seeds $SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

### Become A Validator(optional)

In order to join the network as validator, you need some staking tokens.
Please ask some in [discord testnets channel](https://docs.cosmwasm.com/chat)

If you want to participate in active block building, you need some coins staked to your validators address.

For those interested in validator stack, here is a good reading source on validator architectures: [certus one blog](https://kb.certus.one/)

**Note**: make sure your validator is synced before upgrading to validator

```shell
wasmd tx staking create-validator \
  --amount=1000000ufrites \
  --pubkey=$(wasmd tendermint show-validator) \
  --moniker=$MONIKER \
  --chain-id=$CHAIN_ID \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --node $RPC \
  --fees=5000umayo \
  --from=mywallet
```

### Run the Light Client Daemon

With wasmd version v0.13 lcd client and node merged. To enable light client, change `app.toml/api` value to true.

## Joining To Be Launched Testnets

::: tip
You need to have your address and informations defined in networks genesis file to join not yet launched testnets.
Here is the script you can run to take care of it automatically.
:::

```shell
cd $CW_DIR
## Fork github.com:CosmWasm/testnets to your account and clone.
## You cannot push directly to CosmWasm/testnets repo
git clone git@github.com:<your-name>/testnets
cd testnets
git checkout -b add-gen-acc-<validator-name>
cd $TESTNET_NAME

wasmd keys add validator

wasmd add-genesis-account --home . $(wasmd keys show -a validator) 100000000ufrites,100000000umayo

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
