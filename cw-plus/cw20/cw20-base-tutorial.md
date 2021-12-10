---
title: cw20-base Tutorial
sidebar_position: 3
---

# CW20-base Tutorial


This is a simple tutorial showing you how to use of powerful node REPL to interact with a cw20 token contract (fungible
tokens, like ERC20).

I will walk you through uploading contract code and creating a concrete instance (the same `cw20-base`
wasm code can be reused to create dozens of token contracts with different symbols and distributions). Then I will show
you how to easily interact with this contract. As JSON manipulation and local variables are not so much fun in BASH, we
use the [`@cosmjs/cli`](https://github.com/CosmWasm/cosmjs/tree/master/packages/cli)
tool instead of the `wasmd` CLI tool.

But, before we get into the fun part of playing with the smart contracts, I want to make sure you know how to use your
tools and not loose your private keys.

You must have Node 10+ installed locally to run it. It has been tested on Ubuntu, and may not work properly on Windows (
we assume a HOME environmental variable). PRs welcome.

## Connecting to the chain {#connecting-to-the-chain}

The first step before doing anything is ensuring we can create an account and connect to the chain. You will always use
the following command to start up the `@cosmjs/cli` with some cw20-specific helpers preloaded
(in addition to all the general helpers it has).

```shell
npx @cosmjs/cli@^0.26 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/master/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/master/cw20-base.ts
```

Once this downloads the source and starts up, you should see a bunch of yellow text (explaining what code is preloaded),
followed by a familiar node prompt: `>> `. Please note this is a super-charged REPL, it allows the use of `await`
to easily work with `Promises`, and also does type-checks before executing code. You don't need to define types, but if
you type `client.getCodez()`, you will get the helpful message:
`Property 'getCodez' does not exist on type 'SigningCosmWasmClient'. Did you mean 'getCodes'?`, much better than the
typical `TypeError: client.getCodez is not a function`
or worse `cannot call undefined`.

Without further ado, let's get to use it, and please do read the error messages:

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

## Reloading your Wallet {#reloading-your-wallet}

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

## Sending cw20 Tokens {#sending-cw20-tokens}

Now that you have set up your client, let's get going and try out the
[`cw20-base`](https://github.com/CosmWasm/cw-plus/tree/master/contracts/cw20-base)
token contract, which implements the
[`cw20` spec](https://github.com/CosmWasm/cw-plus/blob/master/packages/cw20/README.md).

We will show how to upload the compiled wasm code, instantiate your own contract (possibly reusing code), and then mint
and transfer tokens on that contract.

## Upload and Instantiate a Contract {#upload-and-instantiate-a-contract}

I will walk you though how to set up an example cw20 contract on Pebblenet.

### Example: STAR {#example-star}

The first contract I uploaded was STAR tokens, or "Golden Stars" to be distribute to the
[first 3 validators](https://block-explorer.pebblenet.cosmwasm.com/validators) on the network.

Please do not copy this verbatum, but look to see how such a contract is setup and deployed the first time.

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
console.log(await contract.balance());
// 0
```

### Try this at home: MINE {#try-this-at-home-mine}

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
  // list of all validator self-delegate addresses - 100 STARs each!
  initial_balances: [
    {address, amount: "12345678000"},
  ],
  mint: {
    minter: address,
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
mine.balance();
mine.tokenInfo()
mine.minter()
```

Look, you're rich now! Time to share the wealth.

## Using a contract {#using-a-contract}

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
mine.balance()
```

Okay, you are connected to your contract. Let's see what cw20 is capable of. Here I will show you how you can mint
tokens (you did give yourself that special permission on init, right?) and transfer tokens to other users.

```js
const someone = "wasm13nt9rxj7v2ly096hm8qsyfjzg5pr7vn56p3cay";
const other = "wasm1ve2n9dd4uy48hzjgx8wamkc7dp7sfdv82u585d";

// right now, only you have tokens
mine.balance()
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
mine.balance()
// and the supply goes up
mine.tokenInfo()

// Okay, now let's transfer some tokens... that is the more normal one, right?
mine.transfer(addr, other, "4567000");
// eg. 4A76EFFEB09C82D0FEB97C3B5A9D5BADB6E9BD71F4EF248A3EF8B232C2F7262A
mine.balance(other)
mine.balance()
```
