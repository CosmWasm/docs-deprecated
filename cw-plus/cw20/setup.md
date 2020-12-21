---
title: Setup your Node Client
order: 2
---

# Introduction

This is a simple tutorial showing you how to use of powerful node REPL to interact with
a CW20 token contract (fungible tokens, like ERC20) on [heldernet](https://github.com/CosmWasm/testnets/tree/master/heldernet).

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

to set up your client. `useOptions` takes the heldernet configuration from everything from
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
