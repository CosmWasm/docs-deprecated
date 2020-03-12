---
id: intro
title: Name Service Introduction
sidebar_label: Intro
---

The Cosmos SDK has [a good standard tutorial](https://tutorials.cosmos.network/nameservice/tutorial/00-intro.html), which builds out a sample name service application. To provide a nice transition for existing SDK developers, we will demonstrate implementing the same application using CosmWasm. This is a useful tutorial to demonstrate basic concepts and applying the skills that you learned in the introduction. We will also be producing another tutorial for deploying and using an ERC20 contract, which may be more familiar to those coming from an Ethereum background.

## Goal

As in the [original tutorial](https://tutorials.cosmos.network/nameservice/tutorial/00-intro.html), you will build a functional application running on [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/). In this case we will use [`cosmwasm`](https://github.com/CosmWasm/cosmwasm) to deploy a rust contract rather than develop a native go module. In the process, learn the basic concepts and structures of CosmWasm. The example will showcase how quickly and easily customize a [default Cosmos SDK application](https://github.com/cosmwasm/wasmd) using CosmWasm smart contracts.

By the end of this tutorial you will have a functional `nameservice` application, a mapping of strings to other strings (`map[string]string`). This is similar to [Namecoin](https://namecoin.org/), [ENS](https://ens.domains/), [IOV](https://iov.one), or [Handshake](https://handshake.org/), which all model the traditional DNS systems (`map[domain]zonefile`). Users will be able to buy unused names, or sell/trade their name.

**Coming Soon**
