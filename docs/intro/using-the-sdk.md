---
id: using-the-sdk
title: Using Cosmos SDK
sidebar_label: Cosmos SDK
---

## Set Up a Single Node "Dev Net"

To get this to work, you will need to first deploy a local single-node testnet. I assume you have some experience with this, if not, please refer to gaiad documentation. You will need go 1.13 installed and standard dev tooling, and `$HOME/go/bin` set to be in your `$PATH`.

If you want to dig deeper, you can [following these instructions](https://github.com/cosmwasm/wasmd/blob/master/docs/deploy-testnet.md#single-node-local-manual-testnet), and also look at instructions of deploying remote networks and multi-node networks. Soon we aim to deploy a testnet to allow all developers to quickly test out contract development and connecting dApps, without worrying about deployment.

**WARNING** The server will only work on osx and linux. Windows support is on the roadmap (but you should be able to use a Windows client).

Checkout code and compile:

```
git clone https://github.com/cosmwasm/wasmd.git
cd wasmd
make install
```

Set up a single-node local testnet:

```bash
cd $HOME
wasmd init --chain-id=testing testing

wasmcli keys add validator

wasmd add-genesis-account $(wasmcli keys show validator -a) 1000000000stake,1000000000validatortoken

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

## TODO

It would be great if some cosmos devs could extend this, or at least add links to recommended resources.
`wasmcli` is a fork of `gaiacli` and works exactly the same (except for the smart contract module being added)