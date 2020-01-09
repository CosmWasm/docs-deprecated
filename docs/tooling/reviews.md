---
id: reviews
title: Submitting a Cryptographic Code Review
sidebar_label: Reviewing Code
---

As mentioned in [the last section](./verify), an essential component to creating secure,
trustable smart contracts are audits and code reviews. We described how to install
`cargo-crev`, create your own ID, bootstrap your web of trust, and verify dependencies
on your contract. All of this makes use of the work of others. Once you have seen
the utility of such an approach, we invite you to add your own review on some crate,
ideally one used by your contract.

There is a good description of how to [submit a review in the official docs](https://github.com/crev-dev/cargo-crev/blob/master/cargo-crev/src/doc/getting_started.md#reviewing-code),
but here we will lead you through an example relevant to CosmWasm. In this example,
we will do a review of the `cw-erc20` crate.

## Select your editor

I [recommended two free editors with good Rust support](../getting-started/rust-basics#setting-up-your-ide), VSCode and IntelliJ.
Assuming you are using one of those, you can load up the code to review with one
of the following commands. Not that the `--cmd` and `--cmd-save` flags are only
needed once, after that you can omit all flags and it will remember your preference.
You only need to include them again if you want to open with a different editor.

VSCode:

```sh 
cargo crev crate open -u cw-erc20 0.1.0 --cmd "code --wait -n" --cmd-save
```

IntelliJ:

```sh 
cargo crev crate open -u cw-erc20 0.1.0 --cmd "code --wait -n" --cmd-save
```

*Note:* you must be in the directory of some rust project to use `cargo crev crate`
(it needs a "current crate" for context). If the crate you are reviewing is not a 
dependency of your current crate, then you must include the `-u` flag.

## Go through the code

If you are reviewing a smart contract, the first step is to check that the boilerplate
looks reasonable. Check `Cargo.toml` for dependencies. If you see a `build.rs` file
(or other script mentioned in `Cargo.toml`) do a close inspection. Ensure `lib.rs`
looks standard (there is no real need to change it, but we need to make sure that
eg. the `extern handle` calls `contract::handle`). Ensure the `examples/schema.rs`
file imports types from this same contract. If you see any issues here, 
please flag them.

As a second step, you can review the submitted artifacts are correct, using the
[standard build process](https://github.com/confio/cosmwasm-opt):

```sh
# these should be the same
sha256sum contract.wasm
cat hash.txt

# ensure we generate the same wasm hash with a fresh build
mv hash.txt hash_old.txt
rm contract.wasm
docker run --rm -v $(pwd):/code \
  --mount type=volume,source=$(basename $(pwd))_cache,target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  confio/cosmwasm-opt:0.6.0
diff hash.txt hash_old.txt
```

If there is a mismatch, please file an issue on the crate you are reviewing 
and/or [`cosmwasm-opt`](https://github.com/confio/cosmwasm-opt) if you suspect
a non-determinism in their output. It may be a simple oversight and the `contract.wasm` 
from an older version, so give the author a chance to fix it before flagging a
negative review.

Once you have done the basic sanity-checks, you can focus on the `src/contract.rs`
file (or directory) and go through, with a special eye for logic errors, and test
coverage. Run the tests yourself as well to make sure they all pass.
(Note: if you have a permission issue with the `target` dir, just `rm -rf target` 
and try running the tests again).

```sh
# Change the target for integration tests to use the production build
# static WASM: &[u8] = include_bytes!("../contract.wasm");
vi tests/integration.rs

# Then run the unit and integration tests
cargo test
```

One issue I came across in some contracts (it is subtle) is the order of load and
save. If I do `load A, B, update A, B, save A, B`, this is usually
correct. But what if `A` and `B` are the same? In the case of a token transfer,
this may mean sending to myself will decrease and increment the same account, but
only the last save will count (just the increment). To be more secure, make sure
you save one object before loading the next one if there is any chance of them being
the same: `load, update, save A. load, update, save B`. Note that the 
[`cw-storage`](https://github.com/confio/cw-storage) crate provides a helper
for just this case to help avoid such bugs:
[`TypedStorage.update`](https://github.com/confio/cw-storage/blob/master/src/typed.rs#L72-L81).

Please make sure to file issues on the crates github account for any issue you discover,
and link them to the review. If the crate owner responds with a new version fixing the filed bugs, 
please review the changes, and submit a new review for the next published version. This may, for example,
signal to other users than `0.1.0` has some security warnings, but `0.1.1` is safe to use - valuable
information for everyone.

## Write your review


### Updating the review


## Publishing

Once you have created a review, you will want to share it with the world.
First, you need to publish it to your personal `crev-proofs` repo:

```sh
cargo crev repo publish
```

Then, make sure other developers can find your review, by publishing your repo and ID
on the [list of CosmWasm developers](./verify#cosmwasm-developers).