---
title: cw20-atomic-swap Spec
order: 7
---

# Atomic Swaps

cw20-atomic-swap source code: [https://github.com/CosmWasm/cosmwasm-plus/tree/master/contracts/cw20-atomic-swap](https://github.com/CosmWasm/cosmwasm-plus/tree/master/contracts/cw20-atomic-swap)

This is a contract that allows users to execute atomic swaps.
It implements one side of an atomic swap. The other side can be realized
by an equivalent contract in the same blockchain or, typically, on a different blockchain.

Each side of an atomic swap has a sender, a recipient, a hash,
and a timeout. It also has a unique id (for future calls to reference it).
The hash is a sha256-encoded 32-bytes long phrase.
The timeout can be either time-based (seconds since midnight, January 1, 1970),
or block height based.

The basic function is, the sender chooses a 32-bytes long phrase as preimage, hashes it,
and then uses the hash to create a swap with funds.
Before the timeout, anybody that knows the preimage may decide to release the funds
to the original recipient.
After the timeout (and if no release has been executed), anyone can refund
the locked tokens to the original sender.
On the other side of the swap the process is similar, with sender and recipient exchanged.
The hash must be the same, so the first sender can claim the funds, revealing the preimage
and triggering the swap.

See the [IOV atomic swap spec](https://github.com/iov-one/iov-core/blob/master/docs/atomic-swap-protocol-v1.md)
for details.

## Token types

Currently native tokens are supported; an upcoming version will support CW20 tokens.
