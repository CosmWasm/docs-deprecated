---
id: reviews
title: Cryptographic Code Reviews
sidebar_label: Code Reviews
---

An essential component to creating secure, trustable smart contracts are audits
and code reviews. We don't believe that audits should be the sole domain of a
niche group of companies, but that many developers are also capable of reviewing each
others code and help spot bugs and security holes. With CosmWasm, we aim to nurture
a culture of collective code reviews to aid in our goal of open, highly secure contracts.

## CRev

[`crev`](https://news.ycombinator.com/item?id=18824923) is an idea of decentralized,
cryptographically verifiable code reviews, centered around a web of trust.
More specifically [`cargo-crev`](https://github.com/crev-dev/cargo-crev/tree/master/cargo-crev)
is a set of tooling to enable the `crev` design with existing rust tooling,
notably the ubiquitous `cargo` command. We support using `cargo-crev` to review all
smart contracts and common dependencies, and will be providing a seed node of trust that
you can sync with, and maintain a directory of some well-known CosmWasm developers. You
can always find others by traversing the web of trust.

The idea is anyone can sign and publish a review of any crate. Each developer can also
assign trust (`low`, `medium`, `high` or `distrust`) to other developers, based on how
much they trust the other's reviews (both honesty and quality). From this, we can pull
in many reviews on various crates and `cargo crev crate verify` will show the current
status of the current crate and all dependencies. Ideally all dependencies of `cosmwasm`
and the major contracts / libraries built on it, like [cw-erc20](https://crates.io/crates/cw-erc20)
and [cw-storage](https://crates.io/crates/cw-storage) will have multiple, public reviews,
so we can build a solid base for security.

## Getting Started

I highly recommend going through the [Getting Started](https://github.com/crev-dev/cargo-crev/blob/master/cargo-crev/src/doc/getting_started.md)
page on `cargo-crev` to understand all the elements, but we will lead you through a simple usage of it here,
tailored to CosmWasm developers. Please note that this will assign trust to the core
CosmWasm developer, [Ethan Frey](https://github.com/ethanfrey), but you can skip that part and
use another seed if you already know other developers using `crev`.
I hope the trust graph will soon be less centralized, but it is best to start with a seed
to produce a highly connected clique. Also, please verify the trust ID in at least 2 places before
adding it.

### Installation

You will first need to have `openssl` installed on your system for TLS (HTTPS) support.

Ubuntu: `sudo apt-get install openssl libssl-dev`

MacOS: `brew install openssl`

Now, you can build the `cargo-crev` command:

```sh
cargo install cargo-crev
cargo crev --help
```

### Creating a `CRevID`

The first step to using `crev` is to create and publish your identity. We will be using
cryptographic keys stored on your local computer to sign the trust proofs, and publishing
the trust graph and code reviews over multiple git repositories (one for each user).
I recommend just [following the official instructions here](https://github.com/crev-dev/cargo-crev/blob/master/cargo-crev/src/doc/getting_started.md#creating-a-crevid),
but if you just want to cut and paste, this should get you up.

[Fork the crev-proofs repo](https://github.com/crev-dev/crev-proofs/fork) to your personal github account.

Or you can copy it to another git server via:

```sh
git clone https://github.com/crev-dev/crev-proofs
cd crev-proofs
git remote set-url origin YOUR_EMPTY_GIT_REPO_HERE
git push -u origin master
```

Now, you can create your personal id (local to your computer, and add it to the repo:

```sh
# you need the https variant, not the git@ (ssh) variant
cargo crev id new --url https://github.com/YOUR_NAME/crev-proofs
```

## Bootstrapping your Web of Trust

You will need at least one trusted developer to get started.
Let's pick a few reputable ones and assign them a trust level of `medium`.
You can feel free to use different seeds if you wish, but these are the commands:

Trust [`dpc`](https://github.com/dpc), one of the core `cargo-crev` developers. This will pull in many
reviews of standard rust crates:

```sh
cargo crev repo fetch url https://github.com/dpc/crev-proofs
cargo crev id trust FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE
```

Trust [`ethanfrey`](https://github.com/ethanfrey), the main CosmWasm developer. This will pull
in reviews of many `cosmwasm` related packages:

```sh
cargo crev repo fetch url https://github.com/ethanfrey/crev-proofs
cargo crev id trust aXPP9kgM2ENNWug1ltY3AiHBDFP6NWoDcoaHM7b_i08
```

Once you have trusted one (or both) of the above seeds, you can pull in their trust graph.
This will show up as a number of `medium` and `low` level trust rankings. We can
then fetch all their reviews to get a large net of reviews. This cannot be used to provide
high trust, but can definitely help spread the word on any malicious packages discovered:

```sh
cargo crev id query trusted
cargo crev repo fetch trusted
```

It takes a while, but now you should be rewarded with some shared knowledge.

## Verifying a Crate

Once we have seeded the trust graph, let's try it out. Go into a local rust project
and try to verify it. If you don't have one in particular, I suggest to
`git clone https://github.com/confio/cosmwasm` in a new directory.
Now that we are in the root of a rust project (in the same directory as `Cargo.toml`),
let's check out what reviews we find in the web of trust:

```sh
cargo crev crate verify --no-dev-dependencies
```

You will see a few green `pass`, quite a few `none` (some with reviews, but from lower trusted devs),
and maybe even a `warn`. When I first ran this, I found a `warn` message by `redox_syscall`
and `smallvec`. Let's investigate further:

```sh
cargo crev crate info smallvec
cargo crev crate info hex
```

TODO: how to get the reviews that caused pass/warn

## Publishing your Web of Trust

TODO

```sh
cargo crev repo publish
```

## Reviewing a Crate

TODO