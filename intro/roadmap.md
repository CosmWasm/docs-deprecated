---
title: Roadmap
order: 8
---

# Rough Roadmap

So far, CosmWasm is an effort of a [small team](http://confio.tech) funded by [ICF Grants](https://interchain.io). We have been building out core technology to support various blockchains in the Cosmos Ecosystem. The following is the currently planned roadmap, largely based on the remaining funding of the ICF Grant. If there is strong interest (and funding) from a project that wishes to deploy this to production, the roadmap priorities may be modified.

You can view up-to-date status in our [Github project page](https://github.com/orgs/CosmWasm/projects/1).

## Past Achievements

**August-October 2019**:

* Core work to build out CosmWasm environment, and build system, example code, and Cosmos SDK integration.

**November 2019**:

* Tested the whole stack integration, wrote tutorials and documentation, polished many rough edges.

**December 2019**:

* [CosmWasm Documentation](https://www.cosmwasm.com) is live, including a [tutorial](../getting-started/intro).
* [CosmWasm v0.5.2](https://github.com/CosmWasm/cosmwasm/tree/v0.5.2), with full support for `init` and `handle` is the first stable release.
* [`wasmd`](https://github.com/CosmWasm/wasmd) sample blockchain is published and tested.

**January 2020**:

* [CosmWasm v0.6.0 released](https://medium.com/confio/announcing-wasmd-release-d865abf381b) with support for `query` and many enhancements to make contract development more ergonomic.
* [cosmwasm-examples](https://github.com/CosmWasm/cosmwasm-examples) is live with `escrow` and `erc20` contracts
* Reproduceable builds with [cosmwasm-opt](https://github.com/CosmWasm/cosmwasm-opt)
* Investigate feasibility of [writing contracts in AssemblyScript](https://github.com/CosmWasm/cosmwasm/pull/118) as well as Rust
* Much work on JS interfaces

**February 2020**:

* First [stable release of wasmd](https://medium.com/confio/announcing-wasmd-release-d865abf381b) with tagged Cosmos SDK dependency, to be easily imported by other projects
* First [release of CosmWasm JS](https://medium.com/confio/introduction-to-cosmwasm-js-548f58d9f6af). [`cosmwasm-js`](https://github.com/CosmWasm/cosmwasm-js) is an easy-to-use TypeScript SDK to talk to CosmWasm contracts
* Demo integration of a [chrome extension signing CosmWasm token contracts](https://medium.com/confio/adding-cosmwasm-to-the-neuma-multichain-wallet-ec657d893268). in this case allowing an ERC20-like contract to be traded along with native tokens.
* [nameservice contract](https://github.com/CosmWasm/cosmwasm-examples/tree/master/nameservice) released as example to parallel Cosmos SDK tutorial

 
**March 2020**:

* [CosmWasm v0.7.0 released](https://medium.com/confio/cosmwasm-0-7-released-6db5a037f943) released with much internal contract cleanup, but especially much more powerful and clean REST API for `wasmd` (inspired by ongoing `cosmwasm-js` work)
* [Demo Net launched](https://medium.com/confio/cosmwasm-demo-net-launched-4c604674f3e0) to upload and run your contracts without local blockchain
* [`code-explorer`](https://github.com/CosmWasm/code-explorer) released to inspect all code and contracts on chain
* [Enigma testnet running with CosmWasm](https://forum.enigma.co/t/testnet-is-live-with-smart-contracts/1386) smart contract support
* [Verify Rust source](https://medium.com/confio/dont-trust-cosmwasm-verify-db1caac2d335) behind uploaded CosmWasm contracts
* Much enhanced `cosmwasm-js`: [Reading](https://medium.com/confio/cosmwasmclient-part-1-reading-e0313472a158) and Writing
* NameService React app demoing full-stack solution (from contract to UI)

**April/May 2020**:

* CosmWasm 0.8 Released
* [Cross-contract queries](./composition)
* Add iterators to the Storage layer
* [Customizable messages and queries](https://github.com/CosmWasm/wasmd/blob/v0.8.0/INTEGRATION.md#adding-custom-hooks)
* Integration with staking module

## Planned Work

Fullfil [Cosmos Hub Proposal](https://hubble.figment.network/cosmos/chains/cosmoshub-3/governance/proposals/25):

* Enable contract migrations by owner
* Enable governance control over all lifecycle of contract
    * Opt-in when compiling binary, we provide support for both permissionless and permissioned systems

Add IBC support (based on ICF grant):

* Simple interface to expose IBC to contracts
* Full IBC integration inside `wasmd`

## Beyond

* Support for writing CosmWasm contracts in *AssemblyScript* or *TinyGo*
* Stricter and more configurable gas metering
* Support for more host platforms (Beyond Linux and OSX on i686/Amd64) 
* Other features as requested by projects building on CosmWasm.
* Further developing the "concept chain"
