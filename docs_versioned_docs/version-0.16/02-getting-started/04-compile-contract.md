---
sidebar_position: 4
---

# Downloading and Compiling Contract

In this section, we will download a sample contract, compile to it to wasm binary executable.

Please first review the [client setup instructions](03-setting-env.md), and configure and verify a client, either Go CLI or
Node.js console.

## Compiling and Testing Contract {#compiling-and-testing-contract}

Let's download the repo in which we collect
[`cw-examples`](https://github.com/CosmWasm/cw-examples) and try out an existing simple name service
contract where mimics a name service marketplace. Also this tutorials is the defacto cosmos-sdk entrance tutorial.
First, clone the repo and try to build the wasm bundle:

```shell
# get the code
git clone https://github.com/CosmWasm/cw-examples
cd cw-examples
git fetch --tags
git checkout nameservice-0.11.0
cd nameservice

cargo wasm
```

After this compiles, it should produce a file in
`target/wasm32-unknown-unknown/release/cw_nameservice.wasm`. A quick `ls -lh` should show around 1.7MB. This is a release
build,
but not stripped of all unneeded code. To produce a much smaller version, you can run this which tells the compiler to
strip all unused code out:

```shell
RUSTFLAGS='-C link-arg=-s' cargo wasm
```

This produces a file about 162kB. We use this and another optimizer in the next [last section](#optimized-compilation)
to produce the final product uploaded to the blockchain. You don't need to worry about running this yourself (unless you
are curious), but you should have an idea of the final size of your contract this way.

## Unit Tests {#unit-tests}

Let's try running the unit tests:

```shell
RUST_BACKTRACE=1 cargo unit-test
```

After some compilation steps, you should see:

```text

running 15 tests
test coin_helpers::test::assert_sent_sufficient_coin_works ... ok
test tests::tests::fails_on_register_already_taken_name ... ok
test tests::tests::fails_on_register_wrong_fee_denom ... ok
test tests::tests::fails_on_register_insufficient_fees ... ok
test tests::tests::fails_on_transfer_from_nonowner ... ok
test tests::tests::fails_on_transfer_non_existent ... ok
test tests::tests::proper_init_no_fees ... ok
test tests::tests::fails_on_transfer_insufficient_fees ... ok
test tests::tests::register_available_name_and_query_works ... ok
test tests::tests::proper_init_with_fees ... ok
test tests::tests::register_available_name_and_query_works_with_fees ... ok
test tests::tests::register_available_name_fails_with_invalid_name ... ok
test tests::tests::returns_empty_on_query_unregistered_name ... ok
test tests::tests::transfer_works_with_fees ... ok
test tests::tests::transfer_works ... ok

test result: ok. 15 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`RUST_BACKTRACE=1` will provide you with full stack traces on any error, which is super useful. This only works for unit
tests (which test native rust code, not the compiled wasm). Also, if you want to know where `cargo wasm`
and `cargo unit-test` come from, they are just aliases defined in
`.cargo/config`. Take a look there to understand the cargo flags more.

## Optimized Compilation {#optimized-compilation}

Optimized Compilation process will provide a binary ready to be deployed on a network.
Smart contract binary size must be as small as possible for reduced gas cost. This will not only cost less on
deployment, also for every single interaction. Simply, **optimize production code**
using [cosmwasm/rust-optimizer](https://github.com/CosmWasm/rust-optimizer).
**rust-optimizer** also produces reproducible builds of cosmwasm smart contracts. This means third parties can verify
the contract is actually the claimed code.


```shell
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.11.5
```

Binary will be at `artifacts` and its size will be `137k`.
