---
title: Joining Testnets
order: 2
---

In this section we will explain how to join testnets, where to find testnet configurations and some scripts to make the process faster.

## Select Your Network

You can find active and in-active testnet information such as configs and endpoints on [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

## Setup

Let's start rolling your node and start producing blocks in testnet environment.

First of all make sure you followed the installation steps in [build requirements section](./build-requirements.md). You should have the required binaries. If you just want to copy and execute the scripts below, make sure to set up environment variables:

Below is the [coral network configuration](https://github.com/CosmWasm/testnets/tree/master/coral).

```sh
export CHAIN_ID="cosmwasm-coral"
export TESTNET_NAME="coralnet"
export WASMD_VERSION="v0.10.0"
export CONFIG_DIR=".corald"
export BINARY="corald"
export CLI_BINARY="coral"

export COSMJS_VERSION="v0.22.1"
export GENESIS_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/coral/config/genesis.json"

export RPC="https://rpc.coralnet.cosmwasm.com:443"
export LCD="https://lcd.coralnet.cosmwasm.com"
export FAUCET="https://faucet.coralnet.cosmwasm.com"
export SEED_NODE="ec488c9215e1917e41bce5ef4b53d39ff6805166@195.201.88.9:26656"
```

**IMPORTANT**:
>We have setup different executables for each testnet names after network names like: `corald/coral`, `gaiaflexd/gaiaflex`
We will be using `coral` and `corald` network specific executables during this tutorial.

For running these scripts seamlessly, We recommend you to create a directory for CosmWasm tooling:
`mkdir CosmWasm && cd CosmWasm && export CW_DIR=$(pwd)`

```shell script
cd $CW_DIR
git clone https://github.com/CosmWasm/wasmd
cd wasmd
# Check which version to use on testnets repo
git checkout $WASMD_VERSION
# generate coral executables
make build-coral # make build-gaiaflex, make build etc...
# add the executables to path
export PATH="${PATH}:$(pwd)/build"
```

## Initialize Your Wallet

Initialize `coral` and generate validator account:

```sh
coral config chain-id $CHAIN_ID
coral config trust-node true
coral config node $RPC
coral config output json
coral config indent true
# this is important, so the cli returns after the tx is in a block,
# and subsequent queries return the proper results
coral config broadcast-mode block

# check you can connect
coral query supply total
coral query staking validators
coral query wasm list-code

# create wallet
coral keys add mywallet
```

## Joining Live Testnets

### Run corald Node

```sh
export MONIKER=new_validator
# initialize corald configuration
corald init $MONIKER
# get the testnets genesis file
curl $RPC/genesis | jq .result.genesis > ~/.corald/config/genesis.json
# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOMEDIR/.corald/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
## Start corald
corald start --p2p.seeds $SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

### Become An Active Validator(optional)

In order to join the network as validator, you need some staking tokens.
Please ask some in [discord testnets channel](https://docs.cosmwasm.com/chat)

If you want to participate in active block building, you need some coins staked to your validators address. If you are interested in validator tech stack, [certus one blog](https://kb.certus.one/) is a good resource to begin with.

**Note**: make sure your validator is synced before upgrading to validator

```sh
coral tx staking create-validator \
  --amount=100000000ureef \
  --pubkey=$(corald tendermint show-validator) \
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

### Run the Light Client Daemon

```sh
coral rest-server
# if the node is running on another machine use:
coral rest-server --node tcp://<host>:<port>
```

## Joining To Be Launched Testnets

You need to have your address and informations defined in networks genesis file to join not yet launched testnets.
Here is the script you can run to take care of it automatically. It uses `coral` [network specific executables](https://github.com/CosmWasm/testnets/tree/master/coral#coral-wip):

```sh
cd $CW_DIR
## Fork github.com:CosmWasm/testnets to your account and clone.
## You cannot push directly to CosmWasm/testnets repo
git clone git@github.com:<your-name>/testnets
cd testnets
git checkout -b add-gen-acc-<validator-name>
cd $TESTNET_NAME

coral keys add validator
corald add-genesis-account --home . $(coral keys show -a validator) 100000000ushell,100000000ureef
# please sort the genesis file, so the diff makes sense
SORTED=$(jq -S . < ./config/genesis.json) && echo "$SORTED" > ./config/genesis.json

git add ./config/genesis.json
git commit -m "Add <myvalidator> account to coral genesis"
git push

# Open PR to CosmWasm/testnets:master (https://github.com/CosmWasm/testnets)
```

After the network is launched you can follow [Joining Live Testnets](#joining-live-testnets).

## Deploying Contracts to Testnet

[Getting Started section](../getting-started/intro.md) is the best reading source that teaches you the process of compiling and deploying contracts using a basic smart contract. If you are interested in developing your own contracts, after reading getting started tutorials head to [Hijacking Escrow](../learn/hijack-escrow/intro.md) where you play around with the example escrow contract.
