---
title: Build Requirements
order: 1
---

# Build Requirements

For minimum system requirements instances with 2 processor CPU and 4GB memory is recommended.
Building code may require larger instances, especially if you want to build a static instance (recompile rust code).

# Installation

Node executable may vary between networks, and [Option 1](#option-1-preferred---build-static-binary-using-docker---linux-only) 
might become obsolete. Please check for `wasm` executable instructions for specific networks on [CosmWasm/testnets](https://github.com/CosmWasm/testnets) 

## Simplest

Use docker image, or build locally: `https://github.com/CosmWasm/wasmd/#dockerized`.

## Bare Metal

### Option 1 (preferred - build static binary using docker - Linux only)

Constructing a `wasmd` is a tricky process and involves using alpine linux and recompiling the rust dependencies as static libs. Using Dockerfile is suggested.

1. Clone the project `git clone git@github.com:CosmWasm/wasmd`
2. Checkout to testnets version `git checkout vx.x.x`
3. Build docker image `docker build . -t wasmd-docker`
4. Extract the specific binary from docker:

```sh
id=$(docker create wasmd-docker)
docker cp $id:/usr/bin/wasmd - > wasmd 
docker cp $id:/usr/bin/wasmcli - > wasmcli
# docker cp $id:/usr/bin/corald - > corald 
# docker cp $id:/usr/bin/coralcli - > coralcli
docker rm -v $id
```

5. Use the static binary on any bare metal linux box

### Option 2: (dev-style: dynamic binary - works on Linux and OSX)

1. `git clone git@github.com:CosmWasm/wasmd`
2. Compile dev build: `make build`
3. `ldd build/wasmd`
4. Notice the line like: `libgo_cosmwasm.so => /home/USERNAME/go/pkg/mod/github.com/!cosm!wasm/go-cosmwasm@v0.9.1/api/libgo_cosmwasm.so`
this file must be in the library path along with wasmd
5. Copy `wasmd` to any location on the target system (that will run the node)
6. Copy `libgo_cosmwasm.so` (path above) to the target system under `/usr/lib/libgo_cosmwasm.so`
