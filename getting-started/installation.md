---
order: 2
---

# Installation

In this section, we will gear up your workhorse for developing, deploying and, enjoying smart
contracts on Cosmos SDK.

## Go

You can setup golang following [official
documentation](https://github.com/golang/go/wiki#working-with-go). The latest versions of `wasmd`
require go version `v1.15`.

## Rust

Assuming you have never worked with rust, you will first need to install some tooling. The standard
approach is to use `rustup` to maintain dependencies and handle updating multiple versions of
`cargo` and `rustc`, which you will be using.

### Installing Rust in Linux and Mac

First, [install rustup](https://rustup.rs/). Once installed, make sure you have the wasm32 target:

```shell
rustup default stable
cargo version
# If this is lower than 1.50.0+, update
rustup update stable

rustup target list --installed
rustup target add wasm32-unknown-unknown
```

### Installing Rust in Windows 10

First, download and execute `rustup-init.exe` from [rustup.rs](https://rustup.rs/)
or [rust-lang.org](https://www.rust-lang.org/tools/install).

If requested, manually download and install Visual C++ Build Tools 2019,
from https://visualstudio.microsoft.com/visual-cpp-build-tools/ .
Make sure "Windows 10 SDK" and "English language pack" are selected.

Continue running `rustup-init.exe`, and proceed with the installation.

Optionally:
- Download and install [gvim](https://www.vim.org/download.php#pc), and modify the Env vars to add \<gvim folder\>
to the PATH.
- Download and install [git for windows](https://git-scm.com/download/win). Modify the Env vars to add \<git folder\>\bin
to PATH.
- Turn on Developer Mode (Settings -> Update and Security: For Developers) and enable Device Discovery, to be able to
access the Windows 10 server through ssh (https://www.ctrl.blog/entry/how-to-win10-ssh-service.html#section-mssshserv-enable).

Install the wasm32 target:
```shell
rustup default stable
cargo version
# If this is lower than 1.51.0, update
rustup update stable

rustup target list --installed
rustup target add wasm32-unknown-unknown
```

For those new to rust, the `stable` channel comes out every 6 weeks with a stable release.
 The `nightly` channel is the bleeding edge and not
only is it a version or two ahead (for testing), but it allows some extra unstable features, whose
APIs may change. For compiling `wasm`, you will want to use `stable`. We use `nightly` to compile
the runtime for `wasmd`, which needs it for the singlepass compiler with gas metering and more.

## wasmd

`wasmd` is the backbone of CosmWasm platform. It is the implementation of a Cosmoszone with wasm
smart contracts enabled.

This code was forked from the `cosmos/gaia` repository as a basis and then added x/wasm and cleaned
up many gaia-specific files. However, the wasmd binary should function just like gaiad except for
the addition of the x/wasm module.

If you intend to develop or edit a contract, you need wasmd.

```shell
git clone https://github.com/CosmWasm/wasmd.git
cd wasmd
# replace the v0.16.0 with the most stable version on https://github.com/CosmWasm/wasmd/releases
git checkout v0.16.0
make install

# verify the installation
wasmd version
```

::: tip
If you have any problems here, check your `PATH`. `make install` will copy `wasmd` to
`$HOME/go/bin` by default, please make sure that is set up in your `PATH` as well, which should be
the case in general for building Go code from source.
:::

## Using Testnets

Testing network [Musselnet](https://github.com/CosmWasm/testnets/tree/master/musselnet) is launched to
save you of the hassle of running a local network and speed up your development.

::: warning
Use go 1.15+ for compiling `wasmd` executable
:::

```shell
# clone wasmd repo
git clone https://github.com/CosmWasm/wasmd.git && cd wasmd

# oysternet runs on wasmd v0.16.0
git checkout v0.16.0

# build wasmd executable
make install
```

## Further Information on the Cosmos SDK

These represent an instance of a blockchain that
utilizes all of the stable features of the [Cosmos SDK](https://github.com/cosmos/cosmos-sdk). As
such, `wasmd` have all the same features (plus WASM smart contracts obviously). If
you'd like to learn more about accessing those features take a look at the [Gaia
docs](https://github.com/cosmos/gaia/tree/main/docs/gaia-tutorials). If you'd like to learn more about
getting started with the Cosmos SDK in general, take a look at the series of
[Tutorials](https://tutorials.cosmos.network/) that show how to build custom modules for
application-specific blockchains.

## Setting up your IDE

We will need a good editor to guide us through the experience. We highly recommend plugins that help
you learn syntax, especially when just starting rust. There are two free editor environments we
recommend, choose the one that is more familiar to you.

If you use VSCode ([Download link](https://code.visualstudio.com/download)) you just need to add the
rust plugin. This is the best supported environment for RLS (Rust Language Server) and uses the rust
compiler to type-check all your code on save. This gives the same error messages as the actual
compiler would and highlights along the line of the code, but it can be a bit slow to respond
sometime (as it runs the compiler). It is quite good, and if you are used to VSCode, I highly
recommend it:

[RLS for VSCode](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust)

The other option I can recommend it Intellij IDEA Community Edition ([Download
link](https://www.jetbrains.com/idea/download/)), along with the Rust Plugin. This has very nice and
quick support for many language features directly inline. In particular, it shows the inferred types
along variables, which can be very helpful, especially when working with (nested) generics. It
catches most syntax errors very quickly, but not all of them. Which means sometimes you have to look
at the compile failures to find the errors. If you are coming from another Intellij product (eg.
Goland), I recommend this approach:

[RUST for Intellij](https://intellij-rust.github.io/)

There are many more editors out there and some have varying degrees of rust support, at least syntax
highlighting, but I would recommend trying one of the two above, especially if you are new to rust.
Once you are confident in the language, you can always use another editor and customize it to your
liking.
