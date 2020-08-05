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
You can find the other networks configurations at [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

Below is the [demonet configuration](https://github.com/CosmWasm/testnets/blob/master/demo-10/config).
You can find the other networks configurations at [CosmWasm/testnets](https://github.com/CosmWasm/testnets).

```sh
export CHAIN_ID=testing
export TESTNET_NAME=demo-10
export RPC=https://rpc.demo-10.cosmwasm.com:443
export FAUCET=https://faucet.demo-10.cosmwasm.com
export SEED_NODE=1445f84f409745c554c03557e826edc9757b941a@p2p.demo-10.cosmwasm.com:26656
```

**IMPORTANT**:
>We have setup different executables for each testnet names after network names like: `corald/coral`, `gaiaflexd/gaiaflex`
We will be using `coral` and `corald` network specific executables during this tutorial.

For running these scripts seamlessly, We recommend you to create a directory for CosmWasm tooling:
`mkdir CosmWasm && cd CosmWasm && export CW_DIR=$(pwd)`

```shell script
git clone
cd $CW_DIR
git clone git@github.com:CosmWasm/wasmd
cd wasmd
# Check which version to use on testnets repo
git checkout v0.10.0
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

### Run wasmd Node

```sh
export MONIKER=new_validator
# initialize wasmd configuration
corald init $MONIKER
# get the testnets genesis file
curl $RPC/genesis | jq .result.genesis > ~/.wasmd/config/genesis.json
# You need to configure p2p seeds
# Either you can insert the seed addresses in $HOMEDIR/.wasmd/config/config.toml to "seeds"
# For simplicity we will pass the seed ID and domain as argument
# You can get the seed it using command:
## Start wasmd
corald start --p2p.seeds $SEED_NODE
```

Now you should be seeing blocks being replayed and your node is catching up with the testnet. This could take a while.

### Become An Active Validator(optional)

In order to join the network as validator, you need some staking tokens. We have a faucet running for that.

Request some tokens from faucet:

```sh
JSON=$(jq -n --arg addr $(coral keys show -a mywallet) '{"ticker":"COSM","address":$addr}')
curl -X POST --header "Content-Type: application/json" --data "$JSON" $FAUCET/credit

JSON=$(jq -n --arg addr $(coral keys show -a mywallet) '{"ticker":"STAKE","address":$addr}')
curl -X POST --header "Content-Type: application/json" --data "$JSON" $FAUCET/credit
```

If you want to participate in active block building, you need some coins staked to your validators address. If you are interested in validator tech stack, [certus one blog](https://kb.certus.one/) is a good resource to begin with.

**Note**: make sure your validator is synced before upgrading to validator

```sh
coral tx staking create-validator \
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
cd <testnet-name>

coral keys add validator
coral init dummy
corald add-genesis-account $(coral keys show -a validator) 100000000ushell,100000000ureef
cat $HOME/.corald/config/genesis.json | jq '.app_state.auth.accounts [0]' > /tmp/new_acc.json
NEW_GEN=$(jq '.app_state.auth.accounts += [input]' ./config/genesis.json /tmp/new_acc.json) && echo "$NEW_GEN" > ./config/genesis.json

git add . && git commit -m "add <myvalidator> account to coral genesis" && git push
# Open PR to CosmWasm/testnets:master and ping us
```

After the network is launched you can follow [Joining Live Testnets](#joining-live-testnets)