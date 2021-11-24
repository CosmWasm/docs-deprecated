---
sidebar_position: 2
---

# Joining Testnets

In this section we will explain how to join testnets, where to find testnet configurations, and some scripts to make the
process faster.

:::caution
Sandynet validators is run by confio and not open for external validators. The documentation here is for reference and
will be updated when long living CosmWasm network is released. If you want to start practicing validator operation skills, join upcoming CosmWasm testnets. But they are
very far from production environments. For near mainnet conditions, try validating in 30+ node networks, where network
load is high.

Try Terra: https://docs.terra.money/node/join-network.html

Or Juno: https://github.com/CosmosContracts/testnets

Both Terra and Juno integrates CosmWasm smart contract engine.
:::

## Select Your Network {#select-your-network}

You can find active and in-active testnet information such as configs and endpoints
on [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

## Setup {#setup}

Let's start rolling your node and start producing blocks in testnet environment.

**Before starting**, you can use [CosmWasm/tesnets/devops](https://github.com/CosmWasm/testnets/tree/master/devops) that
contains easy setup scripts for wasmd node, faucet, [block explorer](https://github.com/CosmWasm/big-dipper), lcd, nginx
etc. Scripts below does the some thing as **devops repo** in essence, just more manual and excludes nginx and system
supervisor. Feel free to use them. We use [cosmovisor](https://github.com/cosmos/cosmos-sdk/tree/master/cosmovisor)
upgrade manager to handle network upgrades. Our installation scripts can help you with both setting up cosmovisor and
wasmd: [wasmd w/cosmovisor setup scripts](https://github.com/CosmWasm/testnets/tree/master/devops/node/cosmovisor)

### Manual Setup {#manual-setup}

First of all make sure you followed the installation steps in [build requirements section](01-build-requirements.md). You
should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up
environment variables:

Below is the [sandynet configuration](https://github.com/CosmWasm/testnets/blob/master/sandynet-1/defaults.env).

```shell
export CHAIN_ID="sandynet-1"
export TESTNET_NAME="sandynet-1"
export FEE_DENOM="ubay"
export STAKE_DENOM="umaya"
export BECH32_HRP="wasm"
export WASMD_VERSION="v0.21.0"
export CONFIG_DIR=".wasmd"
export BINARY="wasmd"

export COSMJS_VERSION="v0.26.0"
export GENESIS_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/sandynet-1/config/genesis.json"
export APP_CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/sandynet-1/config/app.toml"
export CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/sandynet-1/config/config.toml"

export RPC="https://rpc.sandynet.cosmwasm.com:443"
export LCD="https://lcd.sandynet.cosmwasm.com"
export FAUCET="https://faucet.sandynet.cosmwasm.com"

export COSMOVISOR_VERSION="v0.42.10"
export COSMOVISOR_HOME=/root/.wasmd
export COSMOVISOR_NAME=wasmd

export NODE=(--node $RPC)
export TXFLAG=($NODE --chain-id $CHAIN_ID --gas-prices 0.001usandy --gas auto --gas-adjustment 1.3)
```

For running these scripts seamlessly, We recommend you to create a directory for CosmWasm tooling:
`mkdir CosmWasm && cd CosmWasm && export CW_DIR=$(pwd)`

```shell
cd $CW_DIR
git clone https://github.com/CosmWasm/wasmd
cd wasmd
# Check which version to use on 02-testnets repo
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

## Joining Live Testnets {#joining-live-testnets}

### Run wasmd Full Node {#run-wasmd-full-node}

```shell
export MONIKER=new_validator
# initialize wasmd configuration
wasmd init $MONIKER

# get the 02-testnets genesis file
curl -sSL $GENESIS_URL > ~/.wasmd/config/genesis.json

# get app.toml. Minimum gas prices must be 0.025usponge
curl -sSL $APP_CONFIG_URL > ~/.wasmd/config/app.toml

# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOME/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
## Start wasmd
wasmd start --p2p.seeds $SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

### Become A Validator(optional) {#become-a-validatoroptional}

:::caution
Command below is for demonstration, sandynet is not open for external validators.
:::

For those interested in validator stack, here is a good reading source on validator
architectures: [certus one blog](https://kb.certus.one/)

**Note**: make sure your validator is synced before upgrading to validator

```shell
wasmd tx staking create-validator \
  --amount=1000000ustar \
  --pubkey=$(wasmd tendermint show-validator) \
  --moniker=$MONIKER \
  --chain-id=$CHAIN_ID \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --node $RPC \
  --fees=5000usponge \
  --from=mywallet
```

### Run the Light Client Daemon {#run-the-light-client-daemon}

With wasmd version v0.13 lcd client and node merged. To enable light client, change `app.toml/api` value to true.

## Joining To Be Launched Testnets {#joining-to-be-launched-testnets}

:::info

You need to have your address and informations defined in networks genesis file to join not yet launched
testnets. Here is the script you can run to take care of it automatically.
:::

```shell
cd $CW_DIR
## Fork github.com:CosmWasm/02-testnets to your account and clone.
## You cannot push directly to CosmWasm/02-testnets repo
git clone git@github.com:<your-name>/02-testnets
cd 02-testnets
git checkout -b add-gen-acc-<validator-name>
cd $TESTNET_NAME

wasmd keys add validator

wasmd add-genesis-account --home . $(wasmd keys show -a validator) 100000000ustar,100000000usponge

# please sort the genesis file, so the diff makes sense
SORTED=$(jq -S . < ./config/genesis.json) && echo "$SORTED" > ./config/genesis.json

git add ./config/genesis.json
git commit -m "Add <myvalidator> account to network genesis"
git push

# Open PR to CosmWasm/02-testnets:master (https://github.com/CosmWasm/testnets)
```

After the network is launched you can follow [Joining Live Testnets](#joining-live-testnets).

## Deploying Contracts to Testnet {#deploying-contracts-to-testnet}

[Getting Started section](/docs/getting-started/intro) is the best reading source that teaches you the process of
compiling and deploying contracts using a basic smart contract. If you are interested in developing your own contracts,
after reading getting started tutorials head to [Hijacking Escrow](/tutorials/hijack-escrow/intro) where you play around
with the example escrow contract.
