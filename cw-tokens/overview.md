---
title: Overview
id: overview
sidebar_position: 1
---

# CosmWasm Tokens

cw-tokens is a collection of [cw20 related](https://github.com/CosmWasm/cw-plus/tree/main/packages/cw20) contracts extracted from [cw-plus](https://github.com/CosmWasm/cw-plus).
These contracts serve as examples of what is possible to build with cw20 spec and serves as starting points for your own CosmWasm token contracts.

## Contents {#contents}

- [cw20-atomic-swap](./cw20-atomic-swap.md) is an implementation of atomic swaps for both native and cw20 tokens.
- [cw20-bonding](./cw20-bonding.md) is a smart contract implementing arbitrary bonding curves, which can use native and cw20 tokens as reserve tokens.
- [cw20-escrow](./cw20-escrow.md) is a basic escrow contract that is compatible with all native and cw20 tokens.
- [cw20-merkle-airdrop](./cw20-merkle-airdrop.md) is an airdrop contract to distribute cw20 tokens in a way that is both cheap and efficient.
- [cw20-staking](./cw20-staking.md) is a contract that provides staking derivatives, staking native tokens on your behalf and minting cw20 tokens that can be used to claim them.
- [cw20-streams](./cw20-streams.md) is a contract enables the creation of cw20 token streams, which allows a cw20 payment to be vested continuously over time.


## Contribution {#contribution}

All contributions are welcome. You can open PRs at [cw-tokens](https://github.com/CosmWasm/cw-tokens).
