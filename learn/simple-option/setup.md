---
order: 2
---

# Setup

<iframe src="https://player.vimeo.com/video/457712351" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

## Coding Environment

### Rust and IDE
This section is a summary of [Getting Started / Installation and Setting Up Environment](../../getting-started/installation.md).
You can go to the doc, setup rust and preferred IDE then and come back here. We recommend using Intellij IDEA.

## Project Starter

Project starter template repo is there for spinning new smart contract quickly.
With one command, project layout, boiler plate, git, and even Circle CI for auto testing/formatting/linting will be set up. Cool huh.
Here is the repo: [cosmwasm-template](https://github.com/CosmWasm/cosmwasm-template)

Assuming you have a followed section above, then the following should get you a new repo to start a contract:

First, install **cargo-generate**. Unless you did that before, run this line now:

`cargo install cargo-generate --features vendored-openssl`

Now, use it to create your new contract. Go to the folder in which you want to place it and run:

`cargo generate --git https://github.com/CosmWasm/cosmwasm-template.git --name simple-option`

Initialize git repo:

```shell
git add .
git commit -m "Initial generation from cosmwasm-template"
```

Great, workstation is ready.
