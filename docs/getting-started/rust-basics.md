---
title: Rust Basics
order: 4
---

# Rust Basics

## Installing Rust

Assuming you have never worked with rust, you will first need to install some tooling. The standard approach is to use `rustup` to maintain dependencies and handle updating multiple version of `cargo` and `rustc`, which you will be using.

First [install rustup](https://rustup.rs/). Once installed, make sure you have the wasm32 target:

```bash
rustup default stable
cargo version
# If this is lower than 1.41, update
rustup update stable

rustup target list --installed
rustup target add wasm32-unknown-unknown
```

For those new to rust, the `stable` channel comes out every 6 weeks with a stable release (as of 7. May 2020 it is 1.43.1 - we support 1.41+). The `nightly` channel is the bleeding edge and not only is it a version or two ahead (for testing), but it allows some extra unstable features, whose APIs may change. For compiling `wasm`, you will want to use `stable`. We use
`nightly` to compile the runtime for `wasmd`, which needs it for the singlepass compiler with gas metering and more.

## Compiling and Testing an Existing Contract

To make sure all the tooling is working properly, let's start with the [`cosmwasm-examples`](https://github.com/CosmWasm/cosmwasm-examples) repo and try out an existing simple escrow contract. First clone the repo and try to build the wasm bundle:

```bash
# get the code
git clone https://github.com/CosmWasm/cosmwasm-examples
git checkout escrow-0.4.0
cd cosmwasm-examples/escrow

# compile the wasm contract with stable toolchain
rustup default stable
cargo wasm
```

After this compiles, it should produce a file in `target/wasm32-unknown-unknown/release/cw_escrow.wasm`. A quick `ls -l` should show around 2MB. This is a release build, but not stripped of all unneeded code. To produce a much smaller
version, you can run this which tells the compiler to strip all unused code out:

```bash
RUSTFLAGS='-C link-arg=-s' cargo wasm
```

This produces a file about 174kB. We use this and another optimizer to produce the final product uploaded to the blockchain.
You don't need to worry about running this yourself (unless you are curious), but you should have an idea of the final
size of your contract this way.

### Unit Tests

Let's try running the unit tests:

```bash
RUST_BACKTRACE=1 cargo unit-test
```

After some compilation steps, you should see:

```text
running 4 tests
test contract::tests::proper_initialization ... ok
test contract::tests::cannot_initialize_expired ... ok
test contract::tests::handle_approve ... ok
test contract::tests::handle_refund ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

`RUST_BACKTRACE=1` will provide you with full stack traces on any error, which is super useful. This only works for unit tests (which test native rust code, not the compiled wasm). Also, if you want to know where `cargo wasm` and `cargo unit-test` come from, they are just aliases defined in `.cargo/config`. Take a look there to understand the cargo flags more.

## Setting up your IDE

Now that you can compile and test the code, it is time to edit it. But before that, we will need a good editor to make those changes. I highly recommend plugins that help you learn syntax, especially when just starting rust. There are two free editor environments I can recommend, choose the one that is more familiar to you.

If you use VSCode ([Download link](https://code.visualstudio.com/download)) you just need to add the rust plugin. This is the best supported environment for RLS (Rust Language Server) and uses the rust compiler to type-check all your code on save. This gives the same error messages as the actual compiler would and highlights along the line of the code, but it can be a bit slow to respond sometime (as it runs the compiler). It is quite good, and if you are used to VSCode, I highly recommend it:

[RLS for VSCode](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust)

The other option I can recommend it Intellij IDEA Community Edition ([Download link](https://www.jetbrains.com/idea/download/)), along with the Rust Plugin. This has very nice and quick support for many language features directly inline. In particular, it shows the inferred types along variables, which can be very helpful, especially when working with (nested) generics. It catches most syntax errors very quickly, but not all of them. Which means sometimes you have to look at the compile failures to find the errors. If you are coming from another Intellij product (eg. Goland), I recommend this approach:

[RUST for Intellij](https://intellij-rust.github.io/)

There are many more editors out there and some have varying degrees of rust support, at least syntax highlighting, but I would recommend trying one of the two above, especially if you are new to rust. Once you are confident in the language, you can always use another editor and customize it to your liking.

### Setting Root Directory

Both of the above extensions look for a Cargo.toml file in the root directory of your workspace, and only parse rust code referenced by this Cargo.toml file (listed as a workspace, or imported by `src/lib.rs`). The [`cosmwasm-examples`](https://github.com/CosmWasm/cosmwasm-examples) repo does not have a `Cargo.toml` file, but rather one in each example sub-directory. To ensure proper IDE support when working on this example, you should open only the `escrow` directory. And in general, have one window open for one rust projects, rooted in the same directory as it's `Cargo.toml` file.

## Learn More Rust

There are a number of standard references that most rust developers use. It is good to get acquainted with them, to get detailed explanations on language topics and the library APIs:

* ["The Book"](https://doc.rust-lang.org/book/)
* [Cargo Documentation](https://doc.rust-lang.org/cargo/) - make `cargo` your friend
* [Standard Library Documentation](https://doc.rust-lang.org/std/vec/struct.Vec.html)
* [Rust Docs](https://docs.rs/) - api docs for all external packages
* [Crates.io](https://crates.io) - package registry, look for libraries you want to import

If you want a directed training, you can start one of these paths:

* [Rust by Example](https://doc.rust-lang.org/stable/rust-by-example/)
* [Rustlings - small exercises](https://github.com/rust-lang/rustlings/) 
