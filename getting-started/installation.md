---
order: 2
---

# Installation

In this section we will gear up your workhorse for developing, deploying and enjoying smart contracts on Cosmos SDK.

## Go

You can setup golang following [offical documentation](https://github.com/golang/go/wiki#working-with-go).
Latest versions of `wasmd` require go version `v1.14`.

## Rust

Assuming you have never worked with rust, you will first need to install some tooling. The standard approach is to use `rustup` to maintain dependencies and handle updating multiple version of `cargo` and `rustc`, which you will be using.

First [install rustup](https://rustup.rs/). Once installed, make sure you have the wasm32 target:

```bash
rustup default stable
cargo version
# If this is lower than 1.44.1+, update
rustup update stable

rustup target list --installed
rustup target add wasm32-unknown-unknown
```

For those new to rust, the `stable` channel comes out every 6 weeks with a stable release (as of 2020-08-03 it is 1.45.2 - we support 1.44.1+). The `nightly` channel is the bleeding edge and not only is it a version or two ahead (for testing), but it allows some extra unstable features, whose APIs may change. For compiling `wasm`, you will want to use `stable`. We use
`nightly` to compile the runtime for `wasmd`, which needs it for the singlepass compiler with gas metering and more.

## wasmd

`wasmd` is the backbone of CosmWasm platform. It is the implementation of a Cosmoszone with wasm smart contracts enabled.

This code was forked from the `cosmos/gaia` repository as a basis and then added x/wasm and cleaned up many gaia-specific files. However, the wasmd binary should function just like gaiad except for the addition of the x/wasm module.

If you intend to develop or edit contract you need wasmd.

```sh
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd
# replace the v0.10.0 with the most stable version on https://github.com/CosmWasm/wasmd/releases
git checkout v0.10.0
make install

# verify the installation
wasmcli version
```

If you have any problems here, check your `PATH`. `make install` will copy `wasmcli` to
`$HOME/go/bin` by default, please make sure that is set up in your `PATH` as well, which should
be the case in general for building Go code from source.

## Further Information on the Cosmos SDK

`wasmcli` and `wasmd` are forks of `gaiacli` and `gaiad`, which are the binaries that run the Cosmos Hub ([source](https://github.com/cosmos/gaia)). These represent an instance of a blockchain that utilizes all of the stable features of the [Cosmos SDK](https://github.com/cosmos/cosmos-sdk). As such, `wasmcli` and `wasmd` have all the same features (plus WASM smart contracts obviously). If you'd like to learn more about accessing those features take a look at the [Gaia docs](https://cosmos.network/docs/cosmos-hub/what-is-gaia.html). If you'd like to learn more about getting stared with the Cosmos SDK in general, take a look at the series of [Tutorials](https://tutorials.cosmos.network/) that show how to build custom modules for application-specific blockchains.
