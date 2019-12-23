---
title: CosmWasm for Developers
author: Ethan Frey
authorURL: https://github.com/ethanfrey
---

CosmWasm is a new smart contracting platform built for the cosmos ecosystem. If you haven't yet heard of it, please [check out this intro](https://blog.cosmos.network/announcing-the-launch-of-cosmwasm-cc426ab88e12). The purpose of this article is to give a deep dive into the technology for developers who wish to try it out or integrate it into their product. Particularly, it is aimed at Go developers with experience with the Cosmos-SDK, as well as Rust developers looking for a blockchain platform.

CosmWasm was originally [prototyped by Team Gaians](https://github.com/cosmos-gaians/cosmos-sdk/tree/hackatom/x/contract) at the [Berlin Hackatom 2019](https://blog.cosmos.network/cosmos-hackatom-berlin-recap-4722882e7623). In particular, [Aaron Craelius](https://github.com/aaronc) came up with the architecture, especially avoiding reentrancy, [Jehan Tremback](https://github.com/jtremback) led the rust coding, and [Ethan Frey](https://github.com/ethanfrey) led the go side of the implementation. After the successful prototype, the [Interchain Foundation](https://interchain.io/) provided a grant to [Confio](http://confio.tech) to implement a robust version that would work in an adversarial environment. This article introduces developers to the output of that grant work, and lays out possible future directions.

## How to use CosmWasm

CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain, without adjusting existing logic. We also provide a sample binary of CosmWasm integrated into the `gaiad` binary, called [wasmd](https://github.com/cosmwasm/wasmd), so you can launch a new smart-contract enabled blockchain out of the box, using documented and tested tooling and the same security model as the Cosmos Hub.

You will need a running blockchain to host your contracts and use them from an app. We will explain how to set up a local "dev net" [in the tutorial](https://www.cosmwasm.com/docs/getting-started/intro). And plan to soon release a hosted testnet, to which all developers can simply upload their contracts, in order to easy run a demo and to share their contract with others.

Once you have a CosmWasm-enabled blockchain, you can deploy a custom contract. This is similar in principle to ethereum, but there are a number of differences in the details. Since most people are familiar with that flow, let us look at some of the main similarities and differences:

## Comparison with Solidity Contracts

Ethereum and Solidity are what most developers think of when they hear "Smart Contracts". Since most readers have some experience using this system, I will highlight the similarities and the differences.

First of all, the deploy-execute process consists of 3 steps rather than 2. While Ethereum was built around the concept of many unique contracts, each possibly custom-made for any bilateral agreement, the reality seems to show that writing a bug-free contract is harder than originally thought, and a majority are copies of standard templates like OpenZepellin. With that in mind, and conscious of the overhead of uploading and validating wasm code, we define the following 3 phases of a contract:

* Upload Code - Upload some optimized wasm code, no state nor contract address (example Standard ERC20 contract)
* Instantiate Contract - Instantiate a code reference with some initial state, creates new address (example set token name, max issuance, etc for *my* ERC20 token)
* Execute Contract - This may support many different calls, but they are all unprivileged usage of a previously instantiated contract, depends on the contract design (example: Send ERC20 token, grant approval to other contract)

Just like ethereum, contract instantiation and execution is metered and requires gas. Furthermore, both instantiation and execution allow the signer to send some tokens to the contract along with the message. Two key differences are that sending tokens directly to a contract, eg. via `SendMsg`, while possible, *does not trigger any contract code*. This is a clear design decision to reduce possible attack vectors. It doesn't make anything impossible,  but requires all execution of the contract to be *explicitly requested*.

## Contract Security

Code correctness is paramount in blockchain smart-contracts. As the source code is public and there is no "admin" to fix things, there must be no bugs in the execution paths that can be exploited to produced undesired (or undefined) behavior. Many teams look to use Turing incomplete languages to perform deeper analysis and remove many classes of bugs. We choose to use a Turing complete language, like Solidity, but with security as a primary goal. This includes limiting possible attack surface, but also very strong in-built unit test capabilities to easily shake out bugs before deployment.

While CosmWasm development has a steeper learning curve than Solidity (it definitely takes more work to get your first sample contract running), it is designed to be more productive for devs with a couple weeks of experience who wish to produce production-ready code. And we hope to have an architecture and tooling to avoid the need for a whole industry of "CosmWasm smart contract auditors", as it should be easy to just "do the right thing".

One major class of attacks in ethereum (and probably the most infamous) is reentrancy. CosmWasm was architected to [eliminate the possibility of this class of attacks](https://www.cosmwasm.com/docs/getting-started/smart-contracts#avoiding-reentrancy-attacks).

Much like Ethereum, we take resource usage seriously. As such, we provide [hard limits on memory usage, and gas-based limits on CPU and Storage](https://www.cosmwasm.com/docs/getting-started/smart-contracts#resource-limits).

For those who take security very seriously, you can read a longer list of [how CosmWasm stacks up against all known ethereum attack vectors](https://www.cosmwasm.com/docs/getting-started/smart-contracts#lessons-learned-from-ethereum).

## Getting Started with CosmWasm

If you are anxious to get started, you can [jump right in with our first tutorial](https://www.cosmwasm.com/docs/getting-started/intro). This will walk you through modifying an existing contract, compiling it, deploying it to a local "dev net" and running the contracts via a command line tool. If you want more theoretical background, you can [read up on the architecture design](https://www.cosmwasm.com/docs/intro/overview).

### Writing Contracts (Rust)

Writing your own contract is quite easy if you have a working knowledge of rust.  If you don't, it should still be relatively straightforward to make minor changes to existing contracts, just picking up syntax on the fly. We do [walk you through the basics](https://www.cosmwasm.com/docs/getting-started/rust-basics) and [explain editing a contract](https://www.cosmwasm.com/docs/intrgetting-startedo/editing-escrow-contract) in the tutorial, but if you are an advanced dev and want to jump right in with a few pointers, we explain some key points here and where to find the code.

[Confio/cosmwasm](https://github.com/confio/cosmwasm) is a library providing all modular code needed for building a contract. And [cosmwasm-template](https://github.com/confio/cosmwasm-template) contains a starter pack to quickly set up a minimal contract along with build system and unit tests, so you can start writing custom logic directly. Both of these libraries offer deeper documentation on how to build them. If you want to write you own contract, follow the instructions on [cosmwasm-template](https://github.com/confio/cosmwasm-template) and just start editing `contract.rs`.

To get a feel of how a contract can be built, take a look at the [code for a simple escrow](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs). [State](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L47-L54) is what is persisted in the database. [InitMsg](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L13-L22) is sent once to create the contract from the generic code. This contains info on the parties to the escrow, as well as the timeouts. [HandleMsg](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L24-L32) is an enum containing all possible messages that can be sent. Rather than calling functions directly, we can match on the enum to execute the proper logic for each call. Benefits here are the easy ability to serialize the call, as well as a clear definition of which functions are public. Finally, [QueryMsg](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L34-L38) provides an enum to allow multiple ways to query the state of the contract (each potentially executing code on a read-only store).

The [entry points are defined in lib.rs](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/lib.rs#L16-L32). They handle some standard translations between rust types and the wasm external "ffi" interface, but maintain no real logic there, just allow you to work with `Vec<u8>` and `Result<Response, Error>` rather than raw pointers and manually serializing error messages over the ffi boundary. The real logic is in your `contract.rs` file. [init](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L48-L66) is the entry point to construct a new contract from this code, and should define all configuration options. [handle](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L68-L79) loads state and matches over all supported enum values to execute an action on the contract. After which we can [try_approve](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L81-L105) to release the funds to the beneficiary, or [try_refund](https://github.com/confio/cosmwasm-examples/blob/master/escrow/src/contract.rs#L107-L126) to return the funds to the original sender, if the escrow has expired.

### Deeper Integration with your Chain (Go)

Now that we have covered developing custom contracts in Rust, let us turn to the potential extensibility on the Go side for experienced Cosmos SDK developers. The provided [cosmwasm module](https://github.com/cosmwasm/wasmd/tree/master/x/wasm) is a minimal, un-opinionated implementation of bindings between the sdk and the smart contract VM. It is embedded in [wasmd](https://github.com/cosmwasm/wasmd), which is a fork of `gaiad` with `x/wasmd` added. It takes care of all the implementation details, but leaves the field open for you to fork this repo and add custom business logic around it. Below are some ideas on how this could be customized:

*Add Permissioning or Fees* - Are you building a platform where anyone can upload a contract? Or do you intend to use this feature to let on-chain governance add new features without organizing a full chain upgrade process? Consider modifying the handler to deduct fees when uploading code or instantiating a contract. Or maybe just make uploading code a governance handler (proposal type). (Current implementation allows anyone to upload code and instantiate contracts for free - great for testnet, not so great for mainnet).

*Add storage limits* - Current gas limits in the sdk limit how many reads and writes can be performed in one tx (or one block). However, they do nothing to limit total storage. A contract could eg. write 20 chunks of 500 bytes to disk. And next time another 20, and so on. Since you pass in the KVStore to the contract, you could wrap it with a layer to provide some limitations. Like only one write (or one write to a new key) per contract execution. Or maybe a total limit of keys stored in the contracts KVStore over all executions. Or maybe the creator needs to pre-pay for storage space (buy or rent) and this defines the limits. All this business logic can be written in go without any changes to the underlying contracts (except preventing some that violate these limits)

*Support OpaqueMsg* - The current CosmWasm spec allows returning an `OpaqueMsg` variant. This is a message type that is never parsed or created by the smart contract code, just passed through from client to contract to sdk. You can use this for eg. multisigs, where the client proposes some message (maybe a staking issue), which must be approved to be executed with the permissions of the contract. Just as the contract then can dispatch a `SendMsg`, it can dispatch such an `OpaqueMsg` as well. This requires no changes in the VM or contracts, but a clear format that the SDK module parses out and then a router with multiple modules to dispatch it to. And then some client side support to construct (unsigned) messages in that format as part of the body of the contract calls. Is it go-amino json of an `sdk.Msg` implementation? Base64-encoded go-amino binary representation? Or some completely different encoding. As long as your module and your client agree on the format, it is totally opaque to the CosmWasm VM. The current implementation leaves it as a TODO, for chain developers to customize how they want.

Pretty much all the crypto-economic and governance design decisions can be implemented by forking the Go module. If you have ideas, please open issue, or just fork the code and implement it. We at Confio would be happy to discuss any approaches.

## Future Work

CosmWasm, both the VM as well as the platform, is at a usable alpha-state now and we are working on refining the last issues to make it production-ready, with your feedback. Smaller fixes needed to make it ready for mainnet [are being tracked in this project](https://github.com/orgs/confio/projects/1). In addition to that, we want to build tooling around it, and iterate on new features, ideally focused on the needs of real users. Some of the main points on the current roadmap are:

* Launch and maintain a public testnet, so anyone can experiment with contracts
* Add support for existing cosmos tools, like block explorer and wallet on this network.
* Build collection of standard contracts to inspire development (like OpenZeppelin), with documentation and tutorials to help onboard new developers
* Create a website to verify rust code behind wasm byte code, like etherscan. The [build system already built](https://github.com/cosmwasm/cosmos-sdk/issues/9), but a web frontend is needed.
* Set up a registry to share contracts (or provide a nice way to use [crates.io](https://crates.io))
* Provide simple JS APIs to instantiate and execute contracts to enable dApp development, along with a demo dApp.
* Provide integrations with IBC (when golang implementation is stable) to allow multi-chain interactions by smart contracts.

We are also very eager for feedback from the community to influence some designs, like [queries](https://github.com/confio/cosmwasm/issues/72), precompiles, and even a [second language for contract development](https://github.com/confio/cosmwasm/issues/74). As well as concrete use cases and apps that would motivate deeper integrations with the standard Cosmos SDK modules.

## Contact Us

Please [read the docs](https://www.cosmwasm.com), and play with [our starter kit](https://github.com/confio/cosmwasm-template). If you have any questions, or if you want some advice on integrating CosmWasm with your app, or building on top of it, please don't hesitate to get in touch.

You can email us at *cosmwasm@confio.tech* or join the [CosmWasm Telegram group](https://t.me/joinchat/AkZriEhk9qcRw5A5U2MapA). Also visit [confio.tech](http://confio.tech) on the web, or [follow our blog](https://medium.com/confio) to see what other projects we are up to.
