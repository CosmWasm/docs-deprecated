---
title: cw20-base Tutorial
order: 3
---

# cw20-base Tutorial

:::warning
This tutorial does not work with cosmjs 0.23. It will be fixed when 0.24 is out.
:::

This is a simple tutorial showing you how to use of powerful node REPL to interact with
a CW20 token contract (fungible tokens, like ERC20) on [musselnet](https://github.com/CosmWasm/testnets/tree/master/musselnet).

I will walk you through uploading contract code and creating a concrete instance (the same `cw20-base`
wasm code can be reused to create dozens of token contracts with different symbols and distributions).
Then I will show you how to easily interact with this contract. As JSON manipulation and local variables
are not so much fun in BASH, we use the [`@cosmjs/cli`](https://github.com/CosmWasm/cosmjs/tree/master/packages/cli)
tool instead of the `wasmd` CLI tool.

But, before we get into the fun part of playing with the smart contracts, I want to make sure
you know how to use your tools and not loose your private keys.

You must have Node 10+ installed locally to run it. It has been tested on Ubuntu, and may not
work properly on Windows (we assume a HOME environmental variable). PRs welcome.

## Connecting to the chain

The first step before doing anything is ensuring we can create an account and connect to the chain.
You will always use the following command to start up the `@cosmjs/cli` with some cw20-specific helpers preloaded
(in addition to all the general helpers it has).

```shell
npx @cosmjs/cli@^0.23 --init https://raw.githubusercontent.com/CosmWasm/cosmwasm-plus/master/contracts/cw20-base/helpers.ts
```

Once this downloads the source and starts up, you should see a bunch of yellow text (explaining what code is preloaded),
followed by a familiar node prompt: `>> `. Please note this is a super-charged REPL, it allows the use of `await`
to easily work with `Promises`, and also does type-checks before executing code. You don't need to define types,
but if you type `client.getCodez()`, you will get the helpful message:
`Property 'getCodez' does not exist on type 'SigningCosmWasmClient'. Did you mean 'getCodes'?`,
much better than the typical `TypeError: client.getCodez is not a function`
or worse `cannot call undefined`.

Without further ado, let's get to use it, and please do read the error messages:

```js
const client = await useOptions(hackatomOptions).setup(YOUR_PASSWORD_HERE);
client.getAccount();
```

This will take a few seconds as we hit the faucet the first time to ensure you have
some tokens in your account to pay fees. When it returns, you should see something like this:

```js
{ address: 'cosmos16hn7q0yhfrm28ta9zlk7fu46a98wss33xwfxys',
  balance: [ { denom: 'ucosm', amount: '1000000' } ],
  pubkey: undefined,
  accountNumber: 31,
  sequence: 0 }
```

## Reloading your Wallet

You can keep typing in the shell, or close it and run some sections later.
Always start off with:

```js
const client = await useOptions(hackatomOptions).setup(YOUR_PASSWORD_HERE);
```

to set up your client. `useOptions` takes the musselnet configuration from everything from
URLs to tokens to bech32prefix. When you call `setup` with a password, it checks for
`~/.helder.key` and creates a new key if it is not there, otherwise it loads the key from the file.
Your private key (actually mnemonic) is stored encrypted, and you need the same password to use it again.
Try `cat ~/.helder.key` to prove to yourself that it is indeed encrypted, or try reloading with a different
password.

If you want the mnemonic, you can recover it at anytime, as long as you still have the file and the password.
You could use this later to recover, or use the same mnemonic to import the key into the `helder` cli tool.

```js
useOptions(hackatomOptions).recoverMnemonic(YOUR_PASSWORD_HERE)
```

::: warning
This command saves the key to `~/.helder.key` encrypted. If you forget the password, either delete it or pass a
`filename` along with a password to create a new key.
:::

Also, try this with a invalid password and see how it fails.

Now that you feel a bit more secure about your keys (and ability to load them later), let's get into working with
some contracts.

## Sending CW20 Tokens

Now that you have set up your client, let's get going and try out the
[`cw20-base`](https://github.com/CosmWasm/cosmwasm-plus/tree/master/contracts/cw20-base)
token contract, which implements the
[`cw20` spec](https://github.com/CosmWasm/cosmwasm-plus/blob/master/packages/cw20/README.md).

We will show how to upload the compiled wasm code, instantiate your own contract (possibly
reusing code), and then mint and transfer tokens on that contract.

## Upload and Instantiate a Contract

I will walk you though how to set up an example CW20 contract on Heldernet.

### Example: STAR

The first contract I uploaded was STAR tokens, or "Golden Stars" to be distribute to the
[first 3 validators](https://bigdipper.musselnet.cosmwasm.com/validators) on the network.

Please do not copy this verbatum, but look to see how such a contract is setup and deployed the first time.

```js
const client = await useOptions(hackatomOptions).setup(YOUR_PASSWORD_HERE);

const cw20 = CW20(client);
const codeId = await cw20.upload();
console.log(`CodeId: ${codeId}`);
// output: 429

// enable REPL editor mode to edit multiline code then execute
.editor
const initMsg = {
  name: "Golden Stars",
  symbol: "STAR",
  decimals: 2,
  // list of all validator self-delegate addresses - 100 STARs each!
  initial_balances: [
    { address: "cosmos1ez03me7uljk7qerswdp935vlaa4dlu48mys3mq", amount: "10000"},
    { address: "cosmos1tx7ga0lsnumd5hfsh2py0404sztnshwqaqjwy8", amount: "10000"},
    { address: "cosmos1mvjtezrn8dpateu0435trlw5062qy76gf738n0", amount: "10000"},
  ],
  mint: {
    minter: client.senderAddress,
  },
};
// exit editor using `^D` and execute entered code
^D

const contract = await cw20.instantiate(codeId, initMsg, "STAR");
console.log(`Contract: ${contract.contractAddress}`);
// Contract: cosmos1hjzk8wr2gy9f3xnzdrtv5m9735jcxeljhm0f8u

console.log(await contract.balance("cosmos1ez03me7uljk7qerswdp935vlaa4dlu48mys3mq"));
// 10000
console.log(await contract.balance());
// 0
```

### Try this at home: MINE

Now that we have that uploaded, we can easily make a second contract. This one, please
do run through and customize the field names and token amounts before entering them.

```js
const client = await useOptions(hackatomOptions).setup(YOUR_PASSWORD_HERE);
const address = client.senderAddress;

const cw20 = CW20(client);

.editor
const initMsg = {
  name: "My Coin",
  symbol: "MINE",
  decimals: 6,
  // list of all validator self-delegate addresses - 100 STARs each!
  initial_balances: [
    { address, amount: "12345678000"},
  ],
  mint: {
    minter: address,
    cap: "99900000000"
  },
};
^D

const codeId = 429;
const mine = await cw20.instantiate(codeId, initMsg, "MINE");
console.log(`Contract: ${mine.contractAddress}`);
// Contract:  cosmos10ajume5hphs9gcrpl9mw2m96fv7qu0q7esznj2

// now, check the configuration
mine.balance();
mine.tokenInfo()
mine.minter()
```

Look, you're rich now! Time to share the wealth.

## Using a contract

In this section, we will show you how to use your newly constructed token.
You can keep typing along in the same REPL that you used to create the `MINE`
tokens (or whatever better name you invented), but if you closed it down and
come back, here's how to re-connect:

```js
const client = await useOptions(hackatomOptions).setup(YOUR_PASSWORD_HERE);
const cw20 = CW20(client);

// if you forgot your address, but remember your label, you can find it again
const contracts = await client.getContracts(4)
contracts
const contractAddress = contracts.filter(x => x.label === 'MINE')[0].address;

// otherwise, you can just cut and paste from before
const contractAddress = "cosmos10ajume5hphs9gcrpl9mw2m96fv7qu0q7esznj2"

// now, connect to that contract and make sure it is yours
const mine = cw20.use(contractAddress);
mine.tokenInfo()
mine.minter()
mine.balance()
```

Okay, you are connected to your contract. Let's see what cw20 is capable of.
Here I will show you how you can mint tokens (you did give yourself
that special permission on init, right?) and transfer tokens to other
users.

```js
const someone = "cosmos13nt9rxj7v2ly096hm8qsyfjzg5pr7vn56p3cay";
const other = "cosmos1ve2n9dd4uy48hzjgx8wamkc7dp7sfdv82u585d";

// right now, only you have tokens
mine.balance()
mine.balance(someone)
mine.balance(other)
// and watch the total
mine.tokenInfo()

// let's mint some tokens for someone
mine.mint(someone, "999888000")
// Bonus, take the tx hash printed out and cut-paste that into https://bigdipper.wasmnet.cosmwasm.com
// eg 26D5514CF437EE584793768B56CB4E605F1F6E61FC0123030DC64E08E2EE97FA

// See balances updated
mine.balance(someone)
mine.balance()
// and the supply goes up
mine.tokenInfo()

// Okay, now let's transfer some tokens... that is the more normal one, right?
mine.transfer(other, "4567000");
// eg. 4A76EFFEB09C82D0FEB97C3B5A9D5BADB6E9BD71F4EF248A3EF8B232C2F7262A
mine.balance(other)
mine.balance()
```

Great, you are moving stuff around and see it in your queries and in the block explorer.
Time to act like a pro.
