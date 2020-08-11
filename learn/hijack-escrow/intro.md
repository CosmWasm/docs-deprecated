---
order: 1
---

# Introduction

In [getting started section](../../getting-started/intro.md) we demonstrated the essential procedure that is required to use CosmWasm smart contracts: setup, compilation, development, and interacting. We will take it once step further and edit the escrow contract in a way that enables a thief to hijack the funds saved in the contract. Before starting, make sure you read and followed the steps in [getting started](../../getting-started/intro.md).

## Setting up your IDE

Now that you can compile and test the code, it is time to edit it. But before that, we will need a good editor to make those changes. I highly recommend plugins that help you learn syntax, especially when just starting rust. There are two free editor environments I can recommend, choose the one that is more familiar to you.

If you use VSCode ([Download link](https://code.visualstudio.com/download)) you just need to add the rust plugin. This is the best supported environment for RLS (Rust Language Server) and uses the rust compiler to type-check all your code on save. This gives the same error messages as the actual compiler would and highlights along the line of the code, but it can be a bit slow to respond sometime (as it runs the compiler). It is quite good, and if you are used to VSCode, I highly recommend it:

[RLS for VSCode](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust)

The other option I can recommend it Intellij IDEA Community Edition ([Download link](https://www.jetbrains.com/idea/download/)), along with the Rust Plugin. This has very nice and quick support for many language features directly inline. In particular, it shows the inferred types along variables, which can be very helpful, especially when working with (nested) generics. It catches most syntax errors very quickly, but not all of them. Which means sometimes you have to look at the compile failures to find the errors. If you are coming from another Intellij product (eg. Goland), I recommend this approach:

[RUST for Intellij](https://intellij-rust.github.io/)

There are many more editors out there and some have varying degrees of rust support, at least syntax highlighting, but I would recommend trying one of the two above, especially if you are new to rust. Once you are confident in the language, you can always use another editor and customize it to your liking.

### Setting Root Directory

Both of the above extensions look for a Cargo.toml file in the root directory of your workspace, and only parse rust code referenced by this Cargo.toml file (listed as a workspace, or imported by `src/lib.rs`). The [`cosmwasm-examples`](https://github.com/CosmWasm/cosmwasm-examples) repo does not have a `Cargo.toml` file, but rather one in each example sub-directory. To ensure proper IDE support when working on this example, you should open only the `escrow` directory. And in general, have one window open for one rust projects, rooted in the same directory as it's `Cargo.toml` file.
