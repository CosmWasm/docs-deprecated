---
order: 3
---

# CW1 Whitelist

[CW1 Whitelist](https://github.com/CosmWasm/cosmwasm-plus/tree/master/contracts/cw1-whitelist) may be the simplest implementation of CW1, a whitelist of addresses.
It contains a set of admins that are defined upon creation.
Any of those admins may `Execute` any message via the contract,
per the CW1 spec.

To make this slighly less minimalistic, you can allow the admin set
to be mutable or immutable. If it is mutable, then any admin may
(a) change the admin set and (b) freeze it (making it immutable).

While largely an example contract for CW1, this has various real-world use-cases,
such as a common account that is shared among multiple trusted devices,
or trading an entire account (used as 1 of 1 mutable). Most of the time,
this can be used as a framework to build your own, 
more advanced cw1 implementations.

