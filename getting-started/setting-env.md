---
order: 3
---

# Setting Up Environment

You need an environment to run contracts. You can either run your node locally or connect to an
existing network. For easy testing, we have a demo net online you can use to deploy and run your
contracts. If you want to setup and run against a local blockchain, [click
here](#run-local-node-optional)

To verify testnet is currently running, make sure the following URLs are all working for you:

- https://rpc.demo-10.cosmwasm.com/status
- https://faucet.demo-10.cosmwasm.com/status
- https://lcd.demo-10.cosmwasm.com/node_info

We have set up two native tokens - `STAKE` (`ustake`) for being a validator and `COSM` (`ucosm`) for
paying fees. We currently don't have any frontends (lunie, hubble, cosmostation, etc) that work with
the demo net, but feel free to deploy one pointing to our rpc/lcd servers and we will list it.

You can find more information about other testnets:
[CosmWasm/testnets](https://github.com/CosmWasm/testnets) and [Testnet
section](./../testnets/testnets.md).

When interacting with network, you can either use `wasmcli` which is a GO client or Node REPL.
Depends solely on your preference.

## Setup GO CLI

Let's configure `wasmcli`, point it to testnets, create wallet and ask tokens from faucet:

```sh
wasmcli config chain-id testing
wasmcli config trust-node true
# if connecting to local node, wasmcli config node http://localhost:26657
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

# add more wallets for testing
wasmcli keys add fred
>
{
  "name": "fred",
  "type": "local",
  "address": "cosmos1avdvl5aje3zt0uay40uj6l9xtqtlqhduu84nql",
  "pubkey": "cosmospub1addwnpepqvcjveqepq34x59fnmygdy58ag7zwu8gefgsprq9th38nxzptpgszc3rkve",
  "mnemonic": "hobby bunker rotate piano satoshi planet network verify else market spring toward pledge turkey tip slim word jaguar congress thumb flag project chalk inspire"
}
wasmcli keys add bob
wasmcli keys add thief
```

You need some tokens in your address to interact. If you are using local node you can skip this
step. Requesting tokens from faucet:

```sh
JSON=$(jq -n --arg addr $(wasmcli keys show -a fred) '{"ticker":"COSM","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.demo-10.cosmwasm.com/credit
JSON=$(jq -n --arg addr $(wasmcli keys show -a thief) '{"ticker":"COSM","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.demo-10.cosmwasm.com/credit
```

## Setup Node REPL

Beyond the standard CLI tooling, we have also produced a flexible TypeScript library
[CosmJS](https://github.com/CosmWasm/cosmjs), which runs in Node.js as well as in modern browsers
and handles queries and submitting transactions. Along with this library, we produced
[@cosmjs/cli](https://www.npmjs.com/package/@cosmjs/cli), which is a super-charged Node console. It
supports `await`, does type checking for helpful error messages, and preloads many CosmJS utilities.
If you are comfortable with the Node console, you will probably find this easier and more powerful
than the CLI tooling.

Full usage and installation [instructions are on the
README](https://github.com/CosmWasm/cosmjs/tree/master/packages/cli), also here are the source codes prepacked with
network configurations you can use on-the-fly:

```sh
## CORALNET
npx @cosmjs/cli --init https://raw.githubusercontent.com/CosmWasm/testnets/master/coralnet/cli_helper.ts
## DEMONET
npx @cosmjs/cli --init https://raw.githubusercontent.com/CosmWasm/testnets/master/demo-10/cli_helper.ts
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

## Run Local Node (optional)

If you are interested in running your local network you can use the script below:

```sh
# initialize wasmd configuration files
wasmd init localnet
# setup wasmcli
wasmcli config chain-id localnet
wasmcli config trust-node true
wasmcli config node http://localhost:26657
wasmcli config output json

# add your wallet addresses to genesis
wasmd add-genesis-account $(wasmcli keys show -a fred) 10000000000ucosm,10000000000stake
wasmd add-genesis-account $(wasmcli keys show -a thief) 10000000000ucosm,10000000000stake
# add fred's address as validator's address
wasmd gentx --name fred
# collect gentxs to genesis
wasmd collect-gentxs
# validate the genesis file
wasmd validate-genesis
# run the node
wasmd start
```
