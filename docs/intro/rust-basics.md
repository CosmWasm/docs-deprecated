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

Now that we have compiled the code to wasm, and tested the business logic as raw rust, we want to ensure the compiled wasm code is also correct. There is a bit of extra logic parsing input and reporting errors, so it is always good to add a few tests to make sure the happy path and failure path work well in wasm as well. Luckily, there are a number of helpers for integration tests, so you can pretty much copy a unit test and change a dozen lines or so and it will just work. (Planning to make this number even smaller).

This is also the point where you have to check if you want to test with gas metering (and thus can measure the expected usage of your contract), or just stick with stable and test without gas. Let's first stick with stable:

```
cargo wasm
cargo test
```

`cargo wasm` will run all unit tests, then it will run integration tests against the wasm binary stored in `target/wasm32-unknown-unknown/release/escrow.wasm` (you can adjust this to test optimized builds as well). If you want to test with gas metering enabled, you need to enable nightly and add some feature flags:

```
rustup run nightly cargo test --no-default-features --features singlepass
```

You should get the same output as above, just making sure you can run tests with gas metering.

## Setting up your IDE

Now that you can compile and test the code, it is time to edit it. But before that, we will need a good editor to make those changes. I highly recommend plugins that help you learn syntax, especially when just starting rust. There are two free editor environments I can recommend, choose the one that is more familiar to you.

If you use VSCode ([Download link](https://code.visualstudio.com/download)) you just need to add the rust plugin. This is the best supported environment for RLS (Rust Language Server) and uses the rust compiler to type-check all your code on save. This gives the same error messages as the actual compiler would and highlights along the line of the code, but it can be a bit slow to respond sometime (as it runs the compiler). It is quite good, and if you are used to VSCode, I highly recommend it:

[RLS for VSCode](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust)  

The other option I can recommend it Intellij IDEA Community Edition ([Download link](https://www.jetbrains.com/idea/download/)), along with the Rust Plugin. This has very nice and quick support for many language features directly inline. In particular, it shows the inferred types along variables, which can be very helpful, especially when working with (nested) generics. It catches most syntax errors very quickly, but not all of them. Which means sometimes you have to look at the compile failures to find the errors. If you are coming from another Intellij product (eg. Goland), I recommend this approach:

[RUST for Intellij](https://intellij-rust.github.io/)

There are many more editors out there and some have varying degrees of rust support, at least syntax highlighting, but I would recommend trying one of the two above, especially if you are new to rust. Once you are confident in the language, you can always use another editor and customize it to your liking.

## Learn More Rust

There are a number of standard references that most rust developers use. It is good to get acquainted with them, to get detailed explanations on language topics and the library APIs:

* ["The Book"](https://doc.rust-lang.org/book/)
* [Cargo Documentation](https://doc.rust-lang.org/cargo/) - make `cargo` your friend
* [Standard Library Documentation](https://doc.rust-lang.org/std/vec/struct.Vec.html)
* [Rust Docs](https://docs.rs/) - api docs for all external packages
* [Crates.io](https://crates.io) - package registry, look for libraries you want to import
* [Rustinomicon](https://doc.rust-lang.org/nomicon) - dig into more advanced rust topics

If you want a directed training, you can start one of these paths:

* [Rust by Example](https://doc.rust-lang.org/stable/rust-by-example/)
* [Rustlings - small excercises](https://github.com/rust-lang/rustlings/) 
