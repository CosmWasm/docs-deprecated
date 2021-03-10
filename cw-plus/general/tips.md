---
title: Advanced Tips
order: 2
---

# Advanced REPL tips

::: danger
You must read [cw20 tutorial](../cw20/03-cw20-base-tutorial.md) first. This section builds on
top of it.
:::

You got your hands dirty with Node REPL. Now let's dig in a bit deeper of some
advanced functions you can use.

## Interactive Discovery

So far you have been cut-and-pasting commands in the tutorials when using
node repl. But what else can you do with this contract? Luckily Javascript
has some nice introspection. And, we added some extra bonuses there. Just type
`mine` in the REPL and see the list of methods:

```
>> mine
{ contractAddress: 'cosmos1jatwj0hq5qxrmd6y4qnfrg5lstmdk26akcrasl',
  balance: [AsyncFunction: balance],
  allowance: [AsyncFunction: allowance],
  tokenInfo: [AsyncFunction: tokenInfo],
  minter: [AsyncFunction: minter],
  mint: [AsyncFunction: mint],
  transfer: [AsyncFunction: transfer],
  burn: [AsyncFunction: burn],
  increaseAllowance: [AsyncFunction: increaseAllowance],
  decreaseAllowance: [AsyncFunction: decreaseAllowance],
  transferFrom: [AsyncFunction: transferFrom] }
```

But how do I call them? What arguments do they take?
You can always go look up the
[original helper file on the web](https://github.com/CosmWasm/cosmwasm-plus/blob/master/contracts/cw20-base/helpers.ts#L151-L167)
and see all the types defined there.

But why switch to a browser and get distracted by something else?
There is a great `.type` operator to show you this without ever leaving the REPL:

```
>> const _i = mine.increaseAllowance
undefined
>> .type _i
const _i: (recipient: string, amount: string) => Promise<string>

>> const _a = mine.allowance
undefined
>> .type _a
const _a: (owner: string, spender: string) => Promise<string>
```

One note, `.type` is a bit finicky and stops at the first dot, so this simpler version
doesn't work, just describes the `mine` object:

```
>> .type mine.increaseAllowance
const mine: CW20Instance
>> .type mine
const mine: CW20Instance
```

Armed with that knowledge, let's try to add an allowance and query it:

```js
mine.increaseAllowance(other, "5000")
mine.allowance(client.senderAddress, other)
'5000'
```

## Multiple Wallets

You know how we keep starting every session with:

```js
const client = await useOptions(hackatomOptions).setup(YOUR_PASSWORD_HERE);
```

What if I told you there was more you could do here? Don't believe me, just explore
for yourself:

```js
const { setup } = useOptions(hackatomOptions);
.type setup
// this gives:
const setup: (password: string, filename?: string) => Promise<SigningCosmWasmClient>
```

Yup... it takes a second argument. You don't HAVE to store your keys in `~/.coral.key`. That's just
a default. It also means we could make 2 clients using different key files.

```js
const client = await setup(YOUR_PASSWORD_HERE)
const partner = await setup(OTHER_PASSWORD, "/home/user/.test2.key")

// let's make sure they are unique
client.getAccount()
partner.getAccount()

// and move some tokens around
partner.sendTokens(client.senderAddress, [ { denom: 'ucosm', amount: '200000' }])

client.getAccount()
partner.getAccount()
```

This let's us then try more complex use cases with the CW20 contract.
Sending back and forth, `transferFrom`, `burnFrom`, etc

That's enough hints from me.
Time for you to go play with the contract on your own...
