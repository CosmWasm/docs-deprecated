---
title: Cosmos SDK
order: 3
---

# Using Cosmos SDK

## Connect to Demo Net

For easy testing, we have a demo net online you can use to deploy and run your contracts.
There is a simple faucet with REST API that will release tokens to try it out.

To verify this is currently running, make sure the following URLs are all working for you:

- https://faucet.demo-10.cosmwasm.com/status
- https://rpc.demo-10.cosmwasm.com/status
- https://lcd.demo-10.cosmwasm.com/node_info

We have set up two native tokens - `STAKE` (`ustake`) for being a validator and
`COSM` (`ucosm`) for paying fees. There are also 3 "ERC20-like" tokens set initialized
at start (you can add more): `HASH`, `ISA` and `JADE`. (TODO: link to explorer)

We currently don't have any frontends (lunie, hubble, cosmostation, etc) that work with
the demo net, but feel free to deploy one pointing to our rpc/lcd servers and we will list it.

## Connecting with a Go CLI

If you are used to the Cosmos SDK go tooling (eg `gaiacli`), and have a Go toolchain
installed locally, this may be the easiest for you. If you have a JS developer toolchain
and prefer Node REPL, check the next section.

First, compile the `wasmcli` binary from source:

```bash
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd
git checkout v0.9.1
make install

# This should return "0.9.1"
wasmcli version
```

(If you have any problems here, check your `PATH`. `make install` will copy `wasmcli` to
`$HOME/go/bin` by default, please make sure that is set up in your `PATH` as well, which should
be the case in general for building Go code from source.)

Now, open up another window and set up your client:

```bash
wasmcli config chain-id testing
wasmcli config trust-node true
wasmcli config node https://rpc.demo-10.cosmwasm.com:443
wasmcli config output json
wasmcli config indent true
# this is important, so the cli returns after the tx is in a block,
# and subsequent queries return the proper results
wasmcli config broadcast-mode block

# check you can connect
wasmcli query supply total
wasmcli query staking validators
wasmcli query wasm list-code

# create some local accounts
wasmcli keys add fred
wasmcli keys add bob
wasmcli keys list
```

## Connecting with a Node REPL

Beyond the standard CLI tooling, we have also produced a flexible TypeScript library [`cosmwasm-js`](https://github.com/CosmWasm/cosmwasm-js), which runs in Node.js as well as in modern browsers and handles queries and submitting transactions.
Along with this library, we produced [`@cosmwasm/cli`](https://www.npmjs.com/package/@cosmwasm/cli), which is a super-charged
Node console. It supports `await`, does type checking for helpful error messages, and preloads many `cosmwasm-js` utiities.
If you are comfortable with the Node console, you will probably find this easier and more powerful than the CLI tooling.

Full usage and installation [instructions are on the README](https://github.com/CosmWasm/cosmwasm-js/tree/master/packages/cli), but here is a short version for those who want to run from source:

```bash
git clone https://github.com/CosmWasm/cosmjs.git
cd cosmjs
git checkout master # or v0.21.2
yarn install && yarn build
cd packages/cli
./bin/cosmwasm-cli --init examples/helpers.ts
```

Using the REPL:

```js
// Create or load account
const mnemonic = loadOrCreateMnemonic('fred.key')
mnemonicToAddress('cosmos', mnemonic)

const { address, client } = await connect(mnemonic, {})
address

client.getAccount()
// if empty - this only works with CosmWasm
hitFaucet(defaultFaucetUrl, address, 'COSM')
client.getAccount()
```

## Further Information on the Cosmos-SDK

`wasmcli` and `wasmd` are forks of `gaiacli` and `gaiad`, which are the binaries that run the Cosmos Hub ([source](https://github.com/cosmos/gaia)). These represent an instance of a blockchain that utilizes all of the stable features of the [Cosmos-SDK](https://github.com/cosmos/cosmos-sdk). As such, `wasmcli` and `wasmd` have all the same features (plus WASM smart contracts obviously). If you'd like to learn more about accessing those features take a look at the [Gaia docs](https://cosmos.network/docs/cosmos-hub/what-is-gaia.html). If you'd like to learn more about getting stared with the Cosmos-SDK in general, take a look at the series of [Tutorials](https://githubc.com/cosmos/tutorials) that show how to build custom modules for application-specific blockchains.
