---
order: 2
---

# Cosmic dApp logic

The [`@cosmicdapp/logic`](https://github.com/CosmWasm/dApps/tree/master/packages/logic) package provides three kinds of resources that will make it easier to develop CosmJS based dApps: config, utils, and service. In order to better understand the example balance checker dApp that we'll be developing, we'll go over those utilities that will be used in the app.

## Config

The AppConfig definitions that configure the app to work for a given chain:

```typescript
export interface AppConfig {
  readonly chainId: string;
  readonly chainName: string;
  readonly addressPrefix: string;
  readonly rpcUrl: string;
  readonly httpUrl: string;
  readonly faucetUrl: string;
  readonly feeToken: string;
  readonly stakingToken: string;
  readonly faucetToken: string;
  readonly coinMap: CoinMap;
  readonly gasPrice: number;
  readonly codeId?: number;
}
```

In this tutorial we'll be using configuration for Heldernet.

The fields are pretty self-explanatory except `coinMap`, which is a map of native coin names that will allow us to pretty print the token amounts with `nativeCoinToDisplay()`. It looks like this:

```typescript
{
  ucosm: { denom: "COSM", fractionalDigits: 6 },
  ustake: { denom: "STAKE", fractionalDigits: 6 },
}
```

## Utils

Here you can find the definition for a `CoinMap` like the one above, which will come in handy when defining it in your config file.

There are also several utility functions for working with errors and currencies. In this tutorial we'll only be using `nativeCoinToDisplay()`, which takes two parameters: a `@cosmjs/launchpad` `Coin` and a `CoinMap`.

It makes use of those parameters and the `Decimal` class from `@cosmjs/math` to return a `Coin` with a more user friendly `amount` field, that will be used for printing native coins in the balance checker.

## Service

This resource offers several React context providers, some utility functions, and a `ProtectedSwitch` React component.

### Sdk provider

We'll be able to interact with this React context provider with the `useSdk` hook, which will give us access to a `SigningCosmWasmClient` in order to query the chain.

### Account provider

The `useAccount` hook will expose this provider's state, which will be useful for getting the user address and balance.

### ErrorProvider

By making use of the `useError` hook, we will be able to query and change the value of a global error.

### CW20

This is a utility that will provide several methods for interacting with CW20 contracts. For the balance checker, we'll be querying the balance of a given CW20 contract token.

### ProtectedSwitch

A wrapper around `react-router-dom` `Switch`, that only allows the user to visit the routes inside if the user has finished the login process.
