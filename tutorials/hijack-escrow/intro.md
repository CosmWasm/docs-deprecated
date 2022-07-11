---
sidebar_position: 1
---

# Introduction

Throughout the [Getting Started](https://docs.cosmwasm.com/1.0/getting-started/intro) section we demonstrated the essential procedure that is required to use CosmWasm smart contracts: setup, compilation, deployment and interaction. We will take it one step further and edit the [Escrow Contract](https://github.com/InterWasm/cw-contracts/tree/main/contracts/escrow) in a way that enables a thief to hijack the funds saved in the contract. Before starting, make sure you read and followed the steps in the [Getting Started](https://docs.cosmwasm.com/1.0/getting-started/intro) section.

:::tip Reminder
The Rust plugins for the [recommended development environments](https://docs.cosmwasm.com/1.0/getting-started/installation#setting-up-your-ide) look for a Cargo.toml file in the root directory of your project workspace, and only parse rust code referenced by this Cargo.toml file (listed as a workspace, or imported by `src/lib.rs`).
The [`cw-examples`](https://github.com/CosmWasm/cw-examples) repository does not have a `Cargo.toml` file in the project root folder, but rather has one in each example contract sub-directory. To ensure proper IDE support when working on this example, you should only open the `escrow` directory in your preferred IDE and not the project root folder. In general, a good practice is to have one window open for each rust project, rooted in the same directory as its `Cargo.toml` file.
:::
