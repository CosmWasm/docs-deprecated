---
sidebar_position: 1
---

# Introduction

One of the promising aspect of Blockchain technology is novel **Governance** mechanisms.

:::info [wikipedia](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization)
A decentralized autonomous organization (DAO), sometimes called a decentralized autonomous corporation (DAC), is an
organization represented by rules encoded as a computer program that is transparent, controlled by the organization
members and not influenced by a central government.

A DAO's financial transaction record and program rules are
maintained on a blockchain.
:::

DAOs and Governance are going to be game changer concept in the 21st century. It will change the way we think about
organisations. This concept has huge potential because it enables groups or organisations to cooperate and execute
actions on blockchains without need the of a trusted authority. Every voting and execution takes place on chain. This
means that the decision execution made by DAOs are unstoppable. Other aspect is transparency. Due to the nature of a
blockchain, DAO members have stake in the game and their cards are more transparent compared to traditional governance
systems.

## CosmWasm and Governance

There are contracts in [cw-plus](https://github.com/CosmWasm/cw-plus/) that you can use at the moment:

- [cw3](https://github.com/CosmWasm/cw-plus/blob/main/packages/cw3/README.md): CW3 is a specification for voting
  contracts based on CosmWasm
  - [cw3-fixed-multisig](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw3-fixed-multisig): This is a
  simple implementation of the cw3 spec. It is a multisig with a fixed set of addresses created upon instatiation.
    Each address may have the same weight (K of N), or some may have extra voting power
  - [cw3-flex-multisig](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw3-flex-multisig) his builds on
  cw3-fixed-multisig with a more powerful implementation of the cw3 spec. It is a multisig contract that is backed by
    a cw4 (group) contract, which independently maintains the voter set.
- [cw4](https://github.com/CosmWasm/cw-plus/tree/main/packages/cw4): CW4 is a spec for storing group membership, which
  can be combined with CW3 multisigs. The purpose is to store a set of members/voters that can be accessed to determine
  permissions in another section.
  - [cw4-group](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw4-group) It stores a set of members along with
    an admin, and allows the admin to update the state
  - [cw4-stake](https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw4-stake) It provides a similar API
    to [cw4-group] (which handles elected membership), but rather than appointing members (by admin or multisig), their
    membership and weight are based on the number of tokens they have staked. This is similar to many DAOs.

There are other DAO projects that are developed in the community. But we will stick to these for the simplicity for now.

## DAO Governed Smart Contracts

Every wallet and smart contract has addresses and any execution from them is considered same. This means a smart
contract can assign another smart contract as admin, owner or privileged. In this episode, we will set up a DAO with
multiple participants and a CW20 contract that is managed by the DAO.
