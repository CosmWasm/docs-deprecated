---
title: Rust Basics
order: 4
---

# Rust Basics

## Compiling and Testing an Existing Contract

To make sure all the tooling is working properly, let's start with the [`cosmwasm-examples`](https://github.com/CosmWasm/cosmwasm-examples) repo and try out an existing simple escrow contract. First clone the repo and try to build the wasm bundle:

```bash
# get the code
git clone https://github.com/CosmWasm/cosmwasm-examples
cd cosmwasm-examples/escrow
git checkout escrow-0.5.2

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
running 5 tests
test contract::tests::cannot_initialize_expired ... ok
test contract::tests::proper_initialization ... ok
test contract::tests::init_and_query ... ok
test contract::tests::handle_refund ... ok
test contract::tests::handle_approve ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

`RUST_BACKTRACE=1` will provide you with full stack traces on any error, which is super useful. This only works for unit tests (which test native rust code, not the compiled wasm). Also, if you want to know where `cargo wasm` and `cargo unit-test` come from, they are just aliases defined in `.cargo/config`. Take a look there to understand the cargo flags more.

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
