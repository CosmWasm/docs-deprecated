---
sidebar_position: 2
---

# Basics of Smart Contract Interactions

As mentioned before, smart contracts are executable codes.
In the next lessons, we will learn how to write one. Until then, it's best to use what's already written to keep things simple. 
We will dive into two options for deploying and interacting with contracts: `wasmd` and `CosmJS`

## Where to find smart contracts?

Normally, we compile smart contracts using rust compilers then code optimizers.
Now we will just download a precompiled one by cosmwasm team.

## Download

We provide smart contract binary executable
at [cw-plus](https://github.com/CosmWasm/cw-plus/) repo alongside the code.
cw-plus repository is a collection of production-grade smart contracts that has been heavily tested on real mainnets.
You will see a list of available contracts on the repository page.
Go click **Releases** button to see tagged binary executables. You can download binaries and deploy to
compatible blockchains.

We will use cw20 prebuilt binary for this course: [cw20-base](https://github.com/CosmWasm/cw-plus/releases/download/v0.8.0/cw20_base.wasm)

Please don't pay attention to cw20-base details for now, just focus on getting a contract on a testnet.

## wasmd

### Store

We will deploy the code using `wasmd` CLI we installed earlier.
```sh
curl -LJO https://github.com/CosmWasm/cw-plus/releases/download/v0.8.0/cw20_base.wasm
RES=$(wasmd tx wasm store cw20_base.wasm --from wallet $TXFLAG -y)

# get code id
CODE_ID=$(echo $RES | jq -r '.logs[0].events[1].attributes[0].value')

# print code id
echo $CODE_ID

# no contracts yet, this should return an empty list
wasmd query wasm list-contract-by-code $CODE_ID $NODE --output json

```

Now the code stored on the network. `CODE_ID` is the identifier of the code.

### Instantiate

**Smart contract code != usable smart contract instance**

Smart contract code is just a blueprint of a smart contract. We *instantiate* a smart contract based on smart
contract code.

Here is the instantiation message:
```json
{
  "name": "Golden Stars",
  "symbol": "STAR",
  "decimals": "2",
  "initial_balances": [
    {"address": "wasm1ez03me7uljk7qerswdp935vlaa4dlu48mys3mq", "amount": "10000"},
    {"address": "wasm1tx7ga0lsnumd5hfsh2py0404sztnshwqaqjwy8", "amount": "10000"},
    {"address": "wasm1mvjtezrn8dpateu0435trlw5062qy76gf738n0", "amount": "10000"}
  ],
  "mint": {
    "minter": "wasm1mvjtezrn8dpateu0435trlw5062qy76gf738n0"
  }
}
```
This message contains initial state of the contract.

```shell
INIT=$(jq -n --arg wallet $(wasmd keys show -a wallet) '{"name":"Golden Stars","symbol":"STAR","decimals":2,"initial_balances":[{"address":"wasm1n8aqd9jq9glhj87cn0nkmd5mslz3df8zm86hrh","amount":"10000"},{"address":"wasm13y4tpsgxza44yq76qvj69sakq4jmeyqudwgwpk","amount":"10000"},{"address":$wallet,"amount":"10000"}],"mint":{"minter":$wallet}}')

wasmd tx wasm instantiate $CODE_ID "$INIT" --from wallet $TXFLAG --label "first cw20"
```

You will see this output indicating that instantiation transaction is success:

```json
{
  "height": "1350700",
  "txhash": "82D7240A35BDC6DE307AA725FE52590E83B60D4B682ABB0B0F6DCA28A66212D9",
  "data": "0A3C0A0B696E7374616E7469617465122D0A2B7761736D3170657A74676C397661677768346B3574677765366E367475397338686A7779716D6C6D72686B",
  "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"instantiate\"},{\"key\":\"module\",\"value\":\"wasm\"},{\"key\":\"signer\",\"value\":\"wasm10qhh60sexwtzd6nqr4r34z6t2d7nfrqp684twu\"},{\"key\":\"code_id\",\"value\":\"135\"},{\"key\":\"contract_address\",\"value\":\"wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk\"}]},{\"type\":\"wasm\",\"attributes\":[{\"key\":\"contract_address\",\"value\":\"wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk\"}]}]}]",
  "logs": [
    {
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "action",
              "value": "instantiate"
            },
            {
              "key": "module",
              "value": "wasm"
            },
            {
              "key": "signer",
              "value": "wasm10qhh60sexwtzd6nqr4r34z6t2d7nfrqp684twu"
            },
            {
              "key": "code_id",
              "value": "135"
            },
            {
              "key": "contract_address",
              "value": "wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk"
            }
          ]
        },
        {
          "type": "wasm",
          "attributes": [
            {
              "key": "contract_address",
              "value": "wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk"
            }
          ]
        }
      ]
    }
  ],
  "gas_wanted": "185650",
  "gas_used": "155257"
}
```

This command from before should now output the instantiated contract address.
```sh
wasmd query wasm list-contract-by-code $CODE_ID $NODE --output json
```
```json
{
  "contracts": [
    "wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk"
  ],
  "pagination": {}
}
```

Now we have a ready to use instantiated contract. As you can see, you need a lot of shell JSON manipulation for
command line interaction. This is just dirty work... Luckily we have a better option.

## CosmJS

CosmJS is the Swiss Army knife to power JavaScript based client solutions ranging from Web apps/explorers over
browser extensions to server-side clients like faucets/scrapers in the Cosmos ecosystem.

CosmJS contains all the functions you need to interact with Cosmos SDK clients. Its use ranges from exchanges, block
explorers to basic scripts, including smart contract execution.

For this tutorial, we will explore CosmWasm side of CosmJS.


### Setup Client

The first step before doing anything is ensuring we can create an account and connect to the chain. You will always use
the following command to start up the `@cosmjs/cli` with some cw20-specific helpers preloaded
(in addition to all the general helpers it has).

```shell
npx @cosmjs/cli@^0.26 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/master/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/master/cw20-base.ts
```

Now you will see a REPL client.

```js
const [addr, client] = await useOptions(pebblenetOptions).setup('password');
client.getAccount(addr);
```

This will take a few seconds as we hit the faucet the first time to ensure you have some tokens in your account to pay
fees. When it returns, you should see something like this:

```json
{
  address: 'wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp',
  pubkey: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'AkjSrJA0XT612qHvnHieHAebZ+cIA2jq3LRj0g4V/lOF'
  },
  accountNumber: 323,
  sequence: 4
}
```

### Reloading your Wallet {#reloading-your-wallet}

You can keep typing in the shell, or close it and run some sections later. Always start off with:

```js
const [addr, client] = await useOptions(pebblenetOptions).setup(PASSWORD_HERE);
```

to set up your client. `useOptions` takes the pebblenet configuration from everything from URLs to tokens to
bech32prefix. When you call `setup` with a password, it checks for
`~/.pebblenet.key` and creates a new key if it is not there, otherwise it loads the key from the file. Your private key (
actually mnemonic) is stored encrypted, and you need the same password to use it again. Try `cat ~/.pebblenet.key` to prove
to yourself that it is indeed encrypted, or try reloading with a different password.

If you want the mnemonic, you can recover it at anytime, as long as you still have the file and the password. You could
use this later to recover, or use the same mnemonic to import the key into the `pebblenet` cli tool.

```js
useOptions(pebblenetOptions).recoverMnemonic(YOUR_PASSWORD_HERE)
```

:::caution
This command saves the key to `~/.pebblenet.key` encrypted. If you forget the password, either delete it or pass
a
`filename` along with a password to create a new key.
:::

Also, try this with a invalid password and see how it fails.

Now that you feel a bit more secure about your keys (and ability to load them later), let's get into working with some
contracts.

### Example: STAR {#example-star}

The first contract I uploaded was STAR tokens, or "Golden Stars" to be distribute to the
[first 3 validators](https://block-explorer.pebblenet.cosmwasm.com/validators) on the network.

Please do not copy this verbatim, but look to see how such a contract is set up and deployed the first time.

```js
const [addr, client] = await useOptions(pebblenetOptions).setup(PASSWORD_HERE);

const cw20 = CW20(client, pebblenetOptions.fees);
const codeId = await cw20.upload(addr);
console.log(`CodeId: ${codeId}`);
// output: 55

// enable REPL editor mode to edit multiline code then execute
.editor
const initMsg = {
  name: "Golden Stars",
  symbol: "STAR",
  decimals: 2,
  // list of all validator self-delegate addresses - 100 STARs each!
  initial_balances: [
    {address: "wasm13krn38qhu83y5xvmjgydnk5vjau2u3c0tv5jsu", amount: "10000"},
    {address: "wasm1ppgpwep3yzh8w3d89xlzlens3420j5vs5q3p4j", amount: "10000"},
    {address: "wasm1fnx5jzqsdkntlq2nspjgswtezf45u5ug3kq9sw", amount: "10000"},
  ],
  mint: {
    minter: addr,
  },
};
// exit editor using `^D` and execute entered code
^
D

const contract = await cw20.instantiate(addr, codeId, initMsg, "STAR");
console.log(`Contract: ${contract.contractAddress}`);
// Contract: wasm14wm5jvsm6r896tcqsx9dlxc8h0w2mg5de39dsm

console.log(await contract.balance("wasm13krn38qhu83y5xvmjgydnk5vjau2u3c0tv5jsu"));
// 10000
console.log(await contract.balance(contract.contractAddress));
// 0
```

### Spin New Contract

Now that we have that uploaded, we can easily make a second contract. This one, please do run through and customize the
field names and token amounts before entering them.

```js
const [addr, client] = await useOptions(pebblenetOptions).setup(PASSWORD_HERE);
const cw20 = CW20(client, pebblenetOptions.fees);

.editor
const initMsg = {
  name: "My Coin",
  symbol: "MINE",
  decimals: 6,
  initial_balances: [
    {address: addr, amount: "12345678000"},
  ],
  mint: {
    minter: addr,
    cap: "99900000000"
  },
};
^
D

const codeId = 55;
const mine = await cw20.instantiate(addr, codeId, initMsg, "MINE");
console.log(`Contract: ${mine.contractAddress}`);
// Contract: wasm10ajume5hphs9gcrpl9mw2m96fv7qu0q7esznj2

// now, check the configuration
mine.balance(addr);
mine.tokenInfo()
mine.minter()
```

Look, you're rich now! Time to share the wealth.

### Using Contract {#using-contract}

In this section, we will show you how to use your newly constructed token. You can keep typing along in the same REPL
that you used to create the `MINE`
tokens (or whatever better name you invented), but if you closed it down and come back, here's how to re-connect:

```js
const [addr, client] = await useOptions(pebblenetOptions).setup(PASSWORD_HERE);
const cw20 = CW20(client, pebblenetOptions.fees);

// if you forgot your address, but remember your label, you can find it again
const contracts = await client.getContracts(55)
contracts
const contractAddress = contracts.filter(x => x.label === 'MINE')[0].address;

// otherwise, you can just cut and paste from before
const contractAddress = "wasm14wm5jvsm6r896tcqsx9dlxc8h0w2mg5de39dsm"

// now, connect to that contract and make sure it is yours
const mine = cw20.use(contractAddress);
mine.tokenInfo()
mine.minter()
mine.balance(addr)
```

Okay, you are connected to your contract. Let's see what cw20 is capable of. Here I will show you how you can mint
tokens (you did give yourself that special permission on init, right?) and transfer tokens to other users.

```js
const someone = "wasm13nt9rxj7v2ly096hm8qsyfjzg5pr7vn56p3cay";
const other = "wasm1ve2n9dd4uy48hzjgx8wamkc7dp7sfdv82u585d";

// right now, only you have tokens
mine.balance(addr)
mine.balance(someone)
mine.balance(other)
// and watch the total
mine.tokenInfo()

// let's mint some tokens for someone
mine.mint(addr, someone, "999888000")
// Bonus, take the tx hash printed out and cut-paste that into https://bigdipper.wasmnet.cosmwasm.com
// eg 26D5514CF437EE584793768B56CB4E605F1F6E61FC0123030DC64E08E2EE97FA

// See balances updated
mine.balance(someone)
mine.balance(addr)
// and the supply goes up
mine.tokenInfo()

// Okay, now let's transfer some tokens... that is the more normal one, right?
mine.transfer(addr, other, "4567000");
// eg. 4A76EFFEB09C82D0FEB97C3B5A9D5BADB6E9BD71F4EF248A3EF8B232C2F7262A
mine.balance(other)
mine.balance(addr)
```
