---
id: using-the-sdk
title: Using Cosmos SDK
sidebar_label: Cosmos SDK
---

## Set Up a Single Node "Dev Net"

To get this to work, you will need to first deploy a local single-node testnet. I assume you have some experience with this, if not, please refer to gaiad documentation. You will need go 1.13 installed and standard dev tooling, and `$HOME/go/bin` set to be in your `$PATH`.

If you want to dig deeper, you can [following these instructions](https://github.com/CosmWasm/wasmd/blob/master/docs/deploy-testnet.md#single-node-local-manual-testnet), and also look at instructions of deploying remote networks and multi-node networks. Soon we aim to deploy a testnet to allow all developers to quickly test out contract development and connecting dApps, without worrying about deployment.

**WARNING** The server will only work on osx and linux. Windows support is on the roadmap (but you should be able to use a Windows client).

Checkout code and compile:

```bash
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd
make install
```

Set up a single-node local testnet:

```bash
# if you've done this before, wipe out all data from last run
# this may wipe out keys, make sure you know you want to do this
rm -rf ~/.wasmd

cd $HOME
wasmd init --chain-id=testing testing

# if you've done this before, check which keys are created locally first
# wasmcli keys list
# you can skip any "add" steps if they already exist
wasmcli keys add validator

wasmd add-genesis-account $(wasmcli keys show validator -a) 1000000000stake,1000000000validatortoken
# You can add a few more accounts here if you wish (for experiments beyond the tutorial)

wasmd gentx --name validator
wasmd collect-gentxs
wasmd start
```

## Connecting with a Client

Now, open up another window and set up your client:

```bash
wasmcli config chain-id testing
wasmcli config trust-node true
wasmcli config node tcp://localhost:26657
wasmcli config output json
wasmcli config indent true
# this is important, so the cli returns after the tx is in a block,
# and subsequent queries return the proper results
wasmcli config broadcast-mode block

wasmcli keys add fred
wasmcli keys add bob
wasmcli keys list

# verify initial setup
wasmcli query account $(wasmcli keys show validator -a)
```

## Further Information on the Cosmos-SDK

`wasmcli` and `wasmd` are forks of `gaiacli` and `gaiad`, which are the binaries that run the Cosmos Hub ([source](https://github.com/cosmos/gaia)). These represent an instance of a blockchain that utilizes all of the stable features of the [Cosmos-SDK](https://github.com/cosmos/cosmos-sdk). As such, `wasmcli` and `wasmd` have all the same features (plus WASM smart contracts obviously). If you'd like to learn more about accessing those features take a look at the [Gaia docs](https://cosmos.network/docs/cosmos-hub/what-is-gaia.html). If you'd like to learn more about getting stared with the Cosmos-SDK in general, take a look at the series of [Tutorials](https://githubc.com/cosmos/tutorials) that show how to build custom modules for application-specific blockchains.
