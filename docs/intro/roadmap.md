---
id: roadmap
title: Rough Roadmap
sidebar_label: Roadmap
---

So far, CosmWasm is an effort of a [small team](http://confio.tech) funded by [ICF Grants](https://interchain.io). We have been building out core technology to support various blockchains in the Cosmos Ecosystem. The following is the currently planned roadmap, largely based on the remaining funding of the ICF Grant. If there is strong interest (and funding) from a project that wishes to deploy this to production, the roadmap priorities may be modified.

You can view up-to-date status in our [Github project page](https://github.com/orgs/confio/projects/1).

## Past Achievements

**August-October 2019**:
Core work to build out CosmWasm environment, and build system, example code, and cosmos sdk integration.

**November 2019**:
Tested the whole stack integration, wrote tutorials and documentation, polished many rough edges.

**December 2019**:
[CosmWasm Documentation](https://www.cosmwasm.com) is live, including a [tutorial](../getting-started/intro).
[CosmWasm v0.5.2](https://github.com/confio/cosmwasm/tree/v0.5.2), with full support for `init` and `handle` is the first stable release.
[`wasmd`](https://github.com/cosmwasm/wasmd) sample blockchain is published and tested.

## Planned Work

**January 2020**:

Release CosmWasm 0.6:

* Complete overhaul on the stub the query interface [#72](https://github.com/confio/cosmwasm/issues/72)
* Standardize Human/Canonical Addresses [#73](https://github.com/confio/cosmwasm/issues/73)
* Various improvements in the storage layer [#54](https://github.com/confio/cosmwasm/issues/54), [#70](https://github.com/confio/cosmwasm/issues/70), maybe [#53](https://github.com/confio/cosmwasm/issues/53)
* Support compression of wasm bytecode in contracts [#20](https://github.com/confio/go-cosmwasm/issues/20)
* Add some stricter checks on uploaded wasm bytecode [#50](https://github.com/confio/cosmwasm/issues/50)

Launch testnet:

* Unincentivized testnet run by 4+ independent validators
* Public testbed to allow testing and sharing smart contracts
* Support common Cosmos SDK tools (block explorer, wallet)
* This will be reset at least once on the way to a more stable "Concept Chain"

**Q1 2020**:

Build more dev tooling:

* Etherscan-like setup to validate rust code behind contracts and publicize JSON schemas
* A standard package registry to share contracts (like [crates.io](https://crates.io))
* Client-side library (TypeScript?) to call smart contracts, enabling web dApps
* CLI tooling for all common tasks

Better documentation:

* Complete [Name Service](../name-service/intro) tutorial.
* Finalize [Atomic Swap](https://github.com/confio/cosmwasm-examples/pull/2) and [ERC20](https://github.com/confio/cosmwasm-examples/pull/10) example contracts.
* Refine [cosmwasm.com](https://www.cosmwasm.com)
* Present at at least one Meetup
* Other documentation as requested by active users

Launch "concept chain":

* Cut a tagged release of `wasmd` when [Cosmos SDK v0.38](https://github.com/cosmos/cosmos-sdk/issues/5172) is released (with IBC)
* Deploy stable network with 10+ independent validators
* Deploy developer tooling linked to this chain
* Cultivate a developer community to grow the ecosystem of CosmWasm

Participate in [Game of Zones](https://cosmos.network/goz/) with minimal working IBC integration with contracts.

## Beyond

Further develop IBC support and tooling

Other features as requested by projects building on CosmWasm.

Further developing the "concept chain"
