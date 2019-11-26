---
id: rust-basics
title: Rust Basics
sidebar_label: Rust Basics
---

## Installing Rust

Assuming you have never worked with rust, you will first need to install some tooling. The standard approach is to use `rustup` to maintain dependencies and handle updating multiple version of `cargo` and `rustc`, which you will be using.

First [install rustup](https://rustup.rs/). Once installed, make sure you have the wasm32 target, both on stable and nightly:

```bash
rustup target list --installed
rustup target add wasm32-unknown-unknown

rustup install nightly
rustup default nightly
rustup target add wasm32-unknown-unknown
```

For those new to rust, the `stable` channel comes out every 6 weeks with a stable release (as of 27. Novemeber 2019 it is 1.39). The `nightly` channel is the bleeding edge and not only is it a version or two ahead (for testing), but it allows some extra unstable features, whose APIs may change. For compiling `wasm`, you will want to use `stable`. For running integration tests, the implementation of gas metering for the wasmer VM requires nightly, so you will want to use that, or choose to disable metering with feature flags (more below). 

## Compiling and Testing an Existing Contract

To make sure all the tooling is working properly, let's start with the [cosmwasm-examples](https://github.com/confio/cosmwasm-examples) repo and try out an existing simple escrow contract. First clone the repo and try to build the wasm bundle:

```bash
# get the code
git clone https://github.com/confio/cosmwasm-examples
cd cosmwasm-examples/escrow

# compile the wasm contract with stable toolchain
rustup default stable
cargo wasm
```

After this compiles, it should produce a file in `target/wasm32-unknown-unknown/release/escrow.wasm`. A quick `ls -l` should show around 1.5MB. This is a release build, but not stripped of all unneeded code (we get to shrinking it in the next section, for now just ensure it is there).

### Unit Tests

Let's try running the unit tests:

```
RUST_BACKTRACE=1 cargo unit-test
```

After some compilation steps, you should see:

```
running 5 tests
test contract::tests::proper_initialization ... ok
test contract::tests::cannot_initialize_expired ... ok
test contract::tests::fails_on_bad_init_data ... ok
test contract::tests::handle_refund ... ok
test contract::tests::handle_approve ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

`RUST_BACKTRACE=1` will provide you with full stack traces on any error, which is super useful. This only works for unit tests (which test native rust code, not the compiled wasm). Also, if you want to know where `cargo wasm` and `cargo unit-test` come from, they are just aliases defined in `.cargo/config`. Take a look there to understand the cargo flags more.

### Integration Tests

Now that we have compiled the code to wasm, and tested the business logic as raw rust, we want to ensure the compiled wasm code is also correct. There is a bit extra logic parsing input and reporting errors, so it is always good to add a few tests to make sure the happy path and failure path work well in wasm as well. Luckily, there are a number of helpers for integration tests, so you can pretty much copy a unit test and change a dozen lines or so and it will just work. (Planning to make this number even smaller).

This is also the point where you have to check if you want to test with gas metering (and thus can measure the expected usage of your contract), or just stick with stable and test without gas. Let's first stick with stable:

```
cargo wasm
cargo test
```

`cargo wasm` run all unit test, then it will run integration tests against the wasm binary stored in `target/wasm32-unknown-unknown/release/escrow.wasm` (you can adjust this to test optimized builds as well). If you want to test with gas metering enabled, you need to enable nightly and add some feature flags:

```
rustup run nightly cargo test --no-default-features --features singlepass
```

You should get the same output as above, just making sure you can run tests with gas metering.

## Editing Code

Now that you can compile and run tests, let's try to make some changes to the code and you can see if they work. But before that, we will need a good editor to make those changes. I highly recommend plugins that help you learn syntax, especially when just starting rust.

TODO

### Setting up your IDE

TODO

### Some basic edits

The integration tests can also use feature flags to test gas metering with singlepass - give an example

## Compiling for Production

TODO: wasm-pack, twilly, cosmwasm-opt

## Learn More Rust


TODO
