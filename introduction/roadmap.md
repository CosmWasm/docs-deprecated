---
order: 2
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

* [CosmWasm v0.7 released](https://medium.com/confio/cosmwasm-0-7-released-6db5a037f943) released with much internal contract cleanup, but especially much more powerful and clean REST API for `wasmd` (inspired by ongoing `cosmwasm-js` work)
* [Demo Net launched](https://medium.com/confio/cosmwasm-demo-net-launched-4c604674f3e0) to upload and run your contracts without local blockchain
* [`code-explorer`](https://github.com/CosmWasm/code-explorer) released to inspect all code and contracts on chain
* [Enigma testnet running with CosmWasm](https://forum.enigma.co/t/testnet-is-live-with-smart-contracts/1386) smart contract support
* [Verify Rust source](https://medium.com/confio/dont-trust-cosmwasm-verify-db1caac2d335) behind uploaded CosmWasm contracts
* Much enhanced `cosmwasm-js`: [Reading](https://medium.com/confio/cosmwasmclient-part-1-reading-e0313472a158) and Writing
* NameService React app demoing full-stack solution (from contract to UI)

**April/May 2020**:

* CosmWasm 0.8 Released
* [Cross-contract queries](../architecture/composition.md)
* Add iterators to the Storage layer
* [Customizable messages and queries](https://github.com/CosmWasm/wasmd/blob/v0.8.0/INTEGRATION.md#adding-custom-hooks)
* Integration with staking module

**June 2020**:

* CosmWasm 1 year(the idea was born during the Hackatom in Berlin June 2019)
* 1st Live Workshop (Custom token) - Code with us
* CosmJS initiative started with other projects in Cosmos

**July 2020**:

* Cosmwasm 0.9 and 0.10 Released
  * Enable contract migrations by owner
  * Enable governance control over all lifecycle of contract
  * Opt-in when compiling binary, we provide support for both permissionless and permissioned systems
* Fullfil [Cosmos Hub Proposal](https://hubble.figment.network/cosmos/chains/cosmoshub-3/governance/proposals/25):
* Lead Launchpad initiative and contribute
* Re-branding Confio and CosmWasm
* Fetch.ai integrated CosmWasm

**August 2020**:

* CosmJS 0.22 released
* Long living smart contract testing playground [coral network](https://github.com/CosmWasm/testnets/tree/master/coral) released
* CosmWasm governance enabled testing network [gaiaflex](https://github.com/CosmWasm/testnets/tree/master/gaiaflex) released
* Team growth (Dev Relations/Orkun, Frontend/Abel, COO/VP of product/Martin)
* Launched CosmWasm discord server
* New website of Confio and CosmWasm

**September 2020**:

* Governance enabled smart contracts demoed on GaiaFlex network
* More smart contract workshops
* CosmWasm 0.11 progress

**October 2020**:

* CosmWasm 0.11 released
* CosmJS 0.23 released
* HackAtom V support, workshops, and joined hackatom CosmWasm network - heldernet
* Progress on Althea's Peggy
* Keplr integration stablized

**November 2020**:

* CosmJS improvements such as bank, auth and signing support
* More Recruitments! Rust Dev, and look out for more devs
* CosmWasm 0.12 feature complete
  * new module cache
  * new multi-contract testing framework
  * Wasmer reborn preperations
* 3 awards for the teams who joined HackAtom V using CosmWasm
* CosmWasm [random oracle](https://github.com/confio/rand) smart contract released

**December 2020**:

* CosmWasm 0.12 released
* New [production grade multisig smart contracts](https://github.com/CosmWasm/cosmwasm-plus/tree/master/packages/cw3)
* CosmWasm 0.12 supported Musselnet released
* [CosmWasm Improvment Proposals(CWIPS)](https://github.com/CosmWasm/CWIPs) launched

## Planned Work

Add IBC support (based on ICF grant):

* Simple interface to expose IBC to contracts
* Full IBC integration inside `wasmd`

## Beyond

* Support for writing CosmWasm contracts in *AssemblyScript* or *TinyGo*
* Stricter and more configurable gas metering
* Support for more host platforms (Beyond Linux and OSX on i686/Amd64) 
* Other features as requested by projects building on CosmWasm.
* Further developing the "concept chain"
