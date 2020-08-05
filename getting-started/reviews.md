---
title: Reviewing Code
order: 8
---

# Submitting a Cryptographic Code Review

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

IntelliJ: (only works when no IntelliJ window is currently open)

```sh 
cargo crev crate open -u cw-erc20 0.1.0 --cmd "idea.sh" --cmd-save
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
[standard build process](https://github.com/CosmWasm/cosmwasm-opt):

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
and/or [`cosmwasm-opt`](https://github.com/CosmWasm/cosmwasm-opt) if you suspect
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
[`cw-storage`](https://github.com/CosmWasm/cw-storage) crate provides a helper
for just this case to help avoid such bugs:
[`TypedStorage.update`](https://github.com/CosmWasm/cw-storage/blob/master/src/typed.rs#L72-L81).

Please make sure to file issues on the crates github account for any issue you discover,
and link them to the review. If the crate owner responds with a new version fixing the filed bugs, 
please review the changes, and submit a new review for the next published version. This may, for example,
signal to other users than `0.1.0` has some security warnings, but `0.1.1` is safe to use - valuable
information for everyone.

## Write your review

Once you have finished reviewing the code above and lodged any issues on the official repo,
you can write up a code review to share with the world. Close the editor and go back to the
terminal where you ran `cargo crev crate open ...`. Now, let's go write our review:

```sh
# Clean up any edits you made while testing
cargo crev crate clean -u cw-erc20

# Write a review
cargo crev crate review -u cw-erc20
```

In particular, make sure to correctly note your `thoroughness` and `understanding`
as `high`, `medium`, `low` or `none`. And your `rating` as `strong`, `positive`,
`neutral`, `negative`, or `dangerous`. There is a description of the meaning at
the bottom of the document in your editor. Please add a decent comment explaining
your results, and you can also add a section to link to any issues you registered on github.

Please be honest. If you just did a brief check, please mark thoroughness as `low`.
This is better than no review, but if you claim a detailed review, it can be misleading.
Honesty counts and bad reviews can get you removed or isolated on the web of trust.

Here is my submission for `cw-erc20`, please note you must indent every line in the comment block:

```toml
# Package Review of cw-erc20 0.1.0
review:
  thoroughness: medium
  understanding: high
  rating: strong
flags:
  unmaintained: false
comment: |-
  Good test coverage and simple, straight-forward code. This makes a solid base for other contracts to build on.
  Some work may be needed to enable easier reuse in other contracts, but it is very solid to run it as-is.
```

Verify this was saved properly with `cargo crev repo query review cw-erc20` and if it looks good,
make sure to publish it.

## Publishing

Once you have created a review, you will want to share it with the world.
You can see which updates you have not yet published, but reviewing your local
git history:

```sh
cargo crev repo git log
```

Once you are sure these updates are ready to share, you need to publish it to your personal `crev-proofs` repo:

```sh
cargo crev repo publish
```

Then, make sure other developers can find your review, by publishing your repo and ID
on the [list of CosmWasm developers](./verify#cosmwasm-developers).

## Visibility of contract reviews

The `crev` tool is largely designed to validate dependencies. That is, crates
that are imported by the current crate. You will notice that the current crate
always shows up as `local`, even if there are reviews. Thus, if you check out
a contract you wish to review and run the `crate verify` command on it,
you will not see info on the contract itself. 

You can see info on any contract you wish to reuse (not import),
by querying the reviews directly:

```sh
cargo crev repo query review cw-erc20
```

(Interestingly, these reviews do not show up via `cargo crev crate info -u cw-erc20`).

One take-away of this, is that the most essential crates to review (besides anything
you immediately intend to put on a production blockchain), are those crates which
are imported by others. This includes libraries, such as
[`cw-storage`](https://github.com/CosmWasm/cw-storage), as well as contracts designed
to be imported by others and extended (which will likely be true of a future version
of `cw-erc20`). Doing so leverages the value of the review not just for one contract,
but for many contracts that depend on that code.

## Updating your review

There are two reasons to update a review. Either you found more time and did a deeper, more thorough review
of the same version, or a new version was published, possibly in response to issues you logged in the first version.
In either case, you can just run the same commands as above, especially `cargo crev crate review -u cw-erc20` to submit a review.

If there is a new version out there, this will submit a second review for the new version.
This preserves important information, such as `0.2.0` fixed some important security issues that were
present in `0.1.0`. The combination of a negative and positive review on different versions is very helpful 
for anyone looking to reuse this code. When making the second review, you should notice that the `package.version`
in the review file is updated.

If there is no new version published to [crates.io](https://crates.io), you will see a notice in the header:

```toml
# Overwriting existing proof created on 2020-01-09T12:47:39.924625388+01:00
# Package Review of cw-erc20 0.1.0
```

This warns you that you are about to overwrite an existing proof, rather than review a new version.
If this is not what you expect, make sure that the crate owner has published the new version of their
crate to [crates.io](https://crates.io). Maybe the fixes are just in `master` and you will have to
wait for an official release to add a new review on that.
