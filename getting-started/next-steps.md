---
order: 6
---

# Next Steps

This is a very simple example for the escrow contract we developed, but it should show you what is
possible, limited only by the wasm code you upload and the json messages you send. The next step is
[Hijack Escrow tutorial](../learn/hijack-escrow/intro.md) where you will edit a smart contract to
put a backdoor that enables a thief to steal funds. If you want a guided tutorial to build a
contract from start to finish, check out the [name service
tutorial](../learn/name-service/intro).

We curated some video and workshop resources you can take a look at: [Videos and Workshops](../learn/videos-workshops)

If you feel you understand enough (and have prior experience with rust), feel free to grab
[`cosmwasm-template`](https://github.com/CosmWasm/cosmwasm-template) and use that as a configured
project to start modifying. Do not clone the repo, but rather follow the
[README](https://github.com/CosmWasm/cosmwasm-template/blob/master/README.md) on how to use
`cargo-generate` to generate your skeleton.

In either case, there is some documentation in
[`go-cosmwasm`](https://github.com/CosmWasm/go-cosmwasm/blob/master/spec/Index.md) and
[`cosmwasm`](https://github.com/CosmWasm/cosmwasm/blob/master/README.md) that may be helpful. Any
issues (either bugs or just confusion), please submit them on
[`cosmwasm/issues`](https://github.com/CosmWasm/cosmwasm/issues) if they deal with the smart
contract, and [`wasmd/issues`](https://github.com/CosmWasm/wasmd/issues) if they have to do with the
SDK integration.

Happy Hacking!
