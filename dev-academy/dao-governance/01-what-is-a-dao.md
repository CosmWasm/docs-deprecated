---
sidebar_position: 1
---

# Introduction

One of the promising aspects of Blockchain technology is novel **governance** mechanisms.

:::info [wikipedia](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization)
A decentralized autonomous organization (DAO), sometimes called a decentralized autonomous corporation (DAC), is an
organization represented by rules encoded as a computer program that is transparent, controlled by the organization
members and not influenced by a central government.

A DAO's financial transaction record and program rules are
maintained on a blockchain.
:::

You can think of a DAO like a corporation. Corporations have a board that make
decisions. In DAOs, these decisions are stored on the blockchain, and the rules
for making them are embedded in the application logic of smart contracts.

DAOs have enormous potential to shape the way we organize and collaborate. They
enable groups or organizations to cooperate and execute actions on blockchains
without the need for a trusted authority. Every vote and execution takes place
on chain. This means that the decision execution made by DAOs are uncensorable.

Another compelling aspect of DAOs is their transparency. Where it can take
years to audit the finances of a traditional corporations, understanding the
state of the DAO is as simple as querying its blockchain.

## CosmWasm and Governance

There are contracts in [cw-plus](https://github.com/CosmWasm/cw-plus/) that you can use at the moment:

- [cw3](https://github.com/CosmWasm/cw-plus/blob/main/packages/cw3/README.md): CW3 is a specification for voting
  contracts based on CosmWasm
  - [cw3-fixed-multisig](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw3-fixed-multisig): This is a
  simple implementation of the cw3 spec. It is a multisig with a fixed set of addresses created upon instantiation.
    Each address may have the same weight (K of N), or some may have extra voting power
  - [cw3-flex-multisig](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw3-flex-multisig) builds on
  cw3-fixed-multisig with a more powerful implementation of the cw3 spec. It is a multisig contract that is backed by
    a cw4 (group) contract, which independently maintains the voter set.
- [cw4](https://github.com/CosmWasm/cw-plus/tree/main/packages/cw4): CW4 is a spec for storing group membership, which
  can be combined with CW3 multisigs. The purpose is to store a set of members/voters that can be accessed to determine
  permissions in another section.
  - [cw4-group](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw4-group) stores a set of members along with
    an admin, and allows the admin to update the state
  - [cw4-stake](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw4-stake) provides a similar API
    to `cw4-group` (which handles elected membership), but rather than appointing members (by admin or multisig), their
    membership and weight are based on the number of tokens they have staked. This is similar to the way many DAOs function.

The scope of this section will be limited to introducing the contracts maintained in the [cw-plus](https://github.com/CosmWasm/cw-plus/) repository. However, there are other DAO projects and governance protocols that are developed by the community.

## DAO Governed Smart Contracts

Every wallet and smart contract has an address and any execution from them is considered the same. This means a smart
contract can assign another smart contract as an admin, owner or a privileged member. In the next section, we will set up a DAO with
multiple participants along with a CW20 contract that is managed by the DAO.
