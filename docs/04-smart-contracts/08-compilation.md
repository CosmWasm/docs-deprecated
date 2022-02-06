---
sidebar_position: 8
---

# Compilation

Before your contract can be used, it has to be compiled, and then stored on chain.

The easiest way of compiling is of course with `cargo`.

```sh
cargo wasm
```

This is sufficient for dev use. However, this will not be optimised, and in production gas costs matter. It's possible
to strip unnecessary code and produce a more lean build like so:

```sh
RUSTFLAGS='-C link-arg=-s' cargo wasm
```

In most cases, however, you will want to use the optimiser docker image. Note that you might need to change the paths in
the snippet below to better fit your code paths.

```sh
sudo docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/workspace-optimizer:0.12.4
```
