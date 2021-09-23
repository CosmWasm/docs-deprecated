---
sidebar_position: 1
---

# Introduction

In this tutorial you will learn how to build a [CosmJS](https://github.com/cosmos/cosmjs) based dApp. The example dApp
will be a balance checker that will allow you to see your native tokens and the CW20 tokens of the contract with the
address you enter.

## Views {#views}

It will look like this:

### Login {#login}

![image](assets/frontend-dapp/login.png)

### Native balance {#native-balance}

![image](assets/frontend-dapp/balance-native.png)

### Balance of a CW20 contract {#balance-of-a-cw20-contract}

![image](assets/frontend-dapp/balance-cw20.png)

### Error for address with no contract {#error-for-address-with-no-contract}

![image](assets/frontend-dapp/balance-error.png)

## Setup environment {#setup-environment}

We recommend to use [Visual Studio Code](https://code.visualstudio.com) but this tutorial should be easily followed with
any other text editor.

You should download the latest release of the [`CosmWasm/dApps`](https://github.com/CosmWasm/dApps) monorepo using your
preferred method.
