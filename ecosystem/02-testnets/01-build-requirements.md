---
sidebar_position: 1
---

# Build Requirements

For minimum system requirements instances with 2 processor CPU and 4GB memory is recommended. Building code may require
larger instances, especially if you want to build a static instance (recompile Rust code).

# Installation

Node executable may vary between networks,
and [Option 1](#option-1-preferred-build-static-binary-using-docker-linux-only)
might become obsolete. Network details, configuration and information can be found
on [CosmWasm/testnets](https://github.com/CosmWasm/testnets). Please head over to the repo and explore before starting to setup up a node.

## Simplest {#simplest}

Use docker image, or build locally: `https://github.com/CosmWasm/wasmd/#dockerized`.

## Bare Metal {#bare-metal}

### Option 1 (preferred - build static binary using docker - Linux only) {#option-1-preferred---build-static-binary-using-docker---linux-only}

Constructing a `wasmd` is a tricky process and involves using Alpine Linux as a build environment and recompiling the
Rust dependencies as static libs. Using Dockerfile is suggested.

1. Clone the project `git clone https://github.com/CosmWasm/wasmd.git && cd wasmd`
2. Checkout to testnets version `git checkout vx.x.x`
3. Build docker image `docker build . -t wasmd-docker`
4. Extract the specific binaries from build environment:

   ```shell
   id=$(docker create wasmd-docker)
   docker cp $id:/usr/bin/wasmd .
   docker rm -v $id
   ```

5. Use the static binaries on any bare metal Linux box

### Option 2: (dev-style: dynamic binary - works on Linux and OSX) {#option-2-dev-style-dynamic-binary---works-on-linux-and-osx}

1. `git clone https://github.com/CosmWasm/wasmd.git && cd wasmd`
2. Checkout to testnets version `git checkout vx.x.x`
3. Compile dev build: `make build`
4. Move to binary to desired location
