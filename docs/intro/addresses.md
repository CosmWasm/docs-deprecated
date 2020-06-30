---
title: Names and Addresses
order: 4
---

# Names and Addresses

Blockchains (almost?) all use addresses to identify external actors via a hash of a public key, and many newer ones extended this to identify on-chain "smart contracts" with unique addresses as well. On chain, addresses are represented by a use a concise, immutable binary format, typically 20 or 32 bytes long, often derived from a hashing function. However, there are many human-readable representations of these binary addresses, which are shown to clients. For example, [Bech32](https://en.bitcoin.it/wiki/Bech32) `bc1qc7slrfxkknqcq2jevvvkdgvrt8080852dfjewde450xdlk4ugp7szw5tk9`, hex `0x8617E340B3D01FA5F11F306F4090FD50E238070D` or [checksumned hex](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md) `0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed`, and even [large integers](https://research.kudelskisecurity.com/2018/01/16/blockchains-how-to-steal-millions-in-264-operations/) `3040783849904107057L`.

## Human Addresses

*Human Addresses* are great for the UI. They are always a subset of ascii text, and often contain security checks - such as chain-prefix in Bech32, and checksums in Bech32 and checksummed hex (EIP55). Since we designed the [serialization format](./serialization) with Developer UX as a main concern, we expose the human readable addresses to the clients. Messages coming in and queries coming out should use the (current) human encoding of the address.

However, there is an issue with using this representation everywhere. Some blockchains have changed their human representation without altering the internal representation, for example Bitcoin [moved from Base58 to Bech32](https://en.bitcoin.it/wiki/BIP_0173) encoding along with SegWit, and Rise is also [moving from Lisk format to Bech32](https://medium.com/rise-vision/introducing-rise-v2-521a58e1e9de#41d5) in the v2 upgrade

This means that if `message.signer` is always the human address that signed the transaction and I use it to look up your account balance, if this encoding ever changed, then you lose access to your account. We clearly need a stable identifier to work with internally.

## Canonical Addresses

This is where we define a *Canonical Address*. This is defined to be stable and unique. That is, for one given account, there is only ever one canonical address (for the life of the blockchain). We define a *canonical address* format that potentially multiple human addresses can be converted to. It can be transformed back and forth without any changes:

`canonicalize(humanize(canonical_addr)) == canonical_addr`

Note that there may be multiple valid human addresses at one time (during a transition), so the following may or may not be equal:

`humanize(canonicalize(human_addr)) ?== human_addr`

We define the *Canonical Address* as the binary representation used internally in the blockchain. This is what the native tokens are indexed by and therefore must never change for the life of an account. This is the representation that should be used for all **storage lookups** (if you use part of an address as the key in the storage). Furthermore, you very likely want to store the canonical address in your contracts, so if a payout happens long after the contract was created, the stored beneficiary is still a valid string.

## Naming

Once we accept that multiple *Human Addresses* can be resolved to one *Canonical Address*, we can take a step back from mathematical encoding formats and look at other ways we want to represent an account. More and more, [human](https://app.ens.domains/about) [readable](https://docs.blockstack.org/core/naming/introduction.html) [names](https://iov.one) are increasingly important in blockchains [and beyond](https://hackernoon.com/everything-you-didnt-know-about-the-handshake-naming-system-how-this-blockchain-project-will-483464309f33).

At one point, we considered making names a first-class citizen of CosmWasm and using them everywhere in messages. Until we realized that accounts can have no name until initialized, and we need a permanently stable *Canonical Address*. However, we would still like names to be as central to the blockchain as possible. To this end, we can consider names as just another form of *Human Address* albeit one that requires a contract query (with storage access) to resolve, not just a call to a pure function.

This actual format and interfaces are still under discussion, and we are still working on a [tutorial version of a name service](../name-service/intro). However, for sake of argument, imagine we agree every *Human Address* that begins with `:` is a name to lookup with the name service, and other ones can be resolved directly with the built-in blockchain resolution function. So when creating a transaction for an escrow, you could use either `{"arbiter": "cosmos1qqp837a4kvtgplm6uqhdge0zzu6efqgujllfst"}` or `{"arbiter": ":alice"}`, performing the resolution inside the contract rather than only in the client. Of course we would need a standard query format for name service, and the calling contract would need to somehow know the address of the canonical name service contract to resolve with, which is why this feature is still under discussion.

### DIDs

*Note: it will likely be quite some time before this is fully implemented. It serves as design inspiration*

Let's keep imagining what is possible with *Human Names*, once we develop a solution to the name service issue. We could not just use a reference to resolve a user address, but resolve a contract as well. Maybe we could dispatch a message to an "ERC20" token contract not by its name, but by its *uniquely registered token ticker*. We would soon need to use some way to distinguish the scope or context of a name. This is where [Decentralized Identifiers (DIDs)](https://www.w3.org/TR/did-core/) could come in. Imagine the following message format, that could be used either by a end-client or by a smart contract "actor":

```json
{
    "destination": "did:token:XRN",
    "msg": {
        "transfer": {
            "from": "did:account:alice",
            "to": "did:account:bob",
            "amount": "13.56"
        }
    }
}
```

This would not be some spec to be resolved client-side, but the actual interchange format used on the blockchain. So one smart contract could also dispatch such a message in the course of execution. Do you like this idea? Comments? [Please add your thoughts on github](https://github.com/CosmWasm/cosmwasm/issues/80).