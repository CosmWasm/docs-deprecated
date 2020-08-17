---
order: 3
---

# Setting Up Environment

You need an environment to run contracts. You can either run your node locally or connect to an
existing network. For easy testing, long living coral network is online, you can use it to deploy and run your
contracts. If you want to setup and run against a local blockchain, [click
here](#run-local-node-optional)

To verify testnet is currently running, make sure the following URLs are all working for you:

- [https://rpc.coralnet.cosmwasm.com/status](https://rpc.coralnet.cosmwasm.com/status)
- [https://faucet.coralnet.cosmwasm.com/status](https://faucet.coralnet.cosmwasm.com/status)
- [https://lcd.coralnet.cosmwasm.com/node_info](https://lcd.coralnet.cosmwasm.com/node_info)

We have set up two native tokens - `REEF` (`ureef`) for being a validator and `SHELL` (`ushell`) for
paying fees.
Available frontends:

- [Big-dipper block explorer](https://bigdipper.coralnet.cosmwasm.com/)
- [wasm.glass contract explorer](https://coralnet.wasm.glass/#)

You can use these to explore txs, addresses, validators and contracts
feel free to deploy one pointing to our rpc/lcd servers and we will list it.

You can find more information about other testnets:
[CosmWasm/testnets](https://github.com/CosmWasm/testnets) and [Testnet
section](./../testnets/testnets.md).

When interacting with network, you can either use `coral` which is a GO client or Node REPL. Altough Node REPL is
recommended for contract operations, since JSON manipulation is not intuitive with bash/go client.

## Setup GO CLI

Let's configure `coral` exec, point it to testnets, create wallet and ask tokens from faucet:

First source the coral network configurations to the shell:

```sh
source <(curl -sSL https://raw.githubusercontent.com/CosmWasm/testnets/master/coralnet/defaults.env)
```

Setup the client:

```sh
coral config chain-id $CHAIN_ID
coral config trust-node true

# if connecting to local node: coral config node http://localhost:26657
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

# add more wallets for testing
coral keys add fred
>
{
  "name": "fred",
  "type": "local",
  "address": "coral1avdvl5aje3zt0uay40uj6l9xtqtlqhduu84nql",
  "pubkey": "coralpub1addwnpepqvcjveqepq34x59fnmygdy58ag7zwu8gefgsprq9th38nxzptpgszc3rkve",
  "mnemonic": "hobby bunker rotate piano satoshi planet network verify else market spring toward pledge turkey tip slim word jaguar congress thumb flag project chalk inspire"
}

coral keys add bob
coral keys add thief
```

You need some tokens in your address to interact. If you are using local node you can skip this
step. Requesting tokens from faucet:

```sh
JSON=$(jq -n --arg addr $(coral keys show -a fred) '{"ticker":"COSM","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.coralnet.cosmwasm.com/credit
JSON=$(jq -n --arg addr $(coral keys show -a thief) '{"ticker":"COSM","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.coralnet.cosmwasm.com/credit
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
```

Using the REPL:

```js
// Create or load account
const mnemonic = loadOrCreateMnemonic('fred.key')
mnemonicToAddress('coral', mnemonic)

const { address, client } = await connect(mnemonic, {})
address

client.getAccount()
// if empty - this only works with CosmWasm
hitFaucet(defaultFaucetUrl, address, 'SHELL')
client.getAccount()
```

## Run Local Node (optional)

If you are interested in running your local network you can use the script below:

```sh
# initialize wasmd configuration files
wasmd init localnet

# setup local node
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
