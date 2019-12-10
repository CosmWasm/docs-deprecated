---
id: smart-contracts
title: Deploying and Using Contracts
sidebar_label: Smart Contracts
---

Once you have a CosmWasm-enabled blockchain, you can deploy a custom contract. This is similar in principle to ethereum, but there are a number of differences in the details. Since most people are familiar with that flow, let us look at some of the main similarities and differences:

## Comparison with Solidity Contracts

First of all, the deploy-execute process consists of 3 steps rather than 2. While Ethereum was built around the concept of many unique contracts, each possibly custom-made for any bilateral agreement, the reality seems to show that writing a bug-free contract is harder than originally thought, and a majority are copies of standard templates like OpenZepellin. With that in mind, and conscious of the overhead of uploading and validating wasm code, we define the following 3 phases of a contract:

* Upload Code - Upload some optimized wasm code, no state nor contract address (example Standard ERC20 contract)
* Instantiate Contract - Instantiate a code reference with some initial state, creates new address (example set token name, max issuance, etc for *my* ERC20 token)
* Execute Contract - This may support many different calls, but they are all unprivileged usage of a previously instantiated contract, depends on the contract design (example: Send ERC20 token, grant approval to other contract)

Just like ethereum, contract instantiation and execution is metered and requires gas. Furthermore, both instantiation and execution allow the signer to send some tokens to the contract along with the message. Two key differences are that sending tokens directly to a contract, eg. via `SendMsg`, while possible, *does not trigger any contract code*. This is a clear design decision to reduce possible attack vectors. It doesn't make anything impossible,  but requires all execution of the contract to be *explicitly requested*.

## Avoiding Reentrancy Attacks

Another big difference is that we avoid all reentrancy attacks by design. This point deserves an article by itself, but in short [a large class of exploits in Ethereum is based on this trick](https://consensys.github.io/smart-contract-best-practices/known_attacks/). The idea is that in the middle of execution of a function on Contract A, it calls a second contract (explicitly or implicitly via send).  This transfers control to contract B, which can now execute code, and call into Contract A again.  Now there are two copies of Contract A running, and unless you are very, very careful about managing state before executing any remote contract or make very strict gas limits in sub-calls, this can trigger undefined behavior in Contract A, and a clever hacker can reentrancy this as a basis for exploits, such as the DAO hack.

Cosmwasm avoids this completely by preventing any contract from calling another one directly. Clearly we want to allow composition, but inline function calls to malicious code creates a security nightmare. The approach taken with CosmWasm is to allow any contract to *return* a list of messages *to be executed in the same transaction*. This means that a contract can request a send to happen after it is finished (eg. release escrow), or call into other contract. If the future messages fail, then the entire transaction reverts, including updates to the contract's state. This allows to atomic composition and quite a few security guarantees, with the only real downside that you cannot view the results of executing another contract, rather you can just do "revert on error".

Sometimes we will need information from another contract, and we plan to allow queries to other contracts or the underlying Cosmos SDK modules. These Queries will only have access to a read-only database image and be unable to delegate to other modules, thus avoiding any possible reentrancy concerns. For more detailed information, please look at the [Architecture documentation](https://github.com/confio/go-cosmwasm/blob/master/spec/Architecture.md) as well as the [API specification](https://github.com/confio/go-cosmwasm/blob/master/spec/Specification.md).

## Resource Limits

Beyond exploits (such as the reentrancy attack), another attack vector for smart contracts is denial of service attacks. A malicious actor could upload a contract that ran an infinite loop to halt the chain. Or wrote tons of data to fill up the disk. Web Assembly provides a tight sandbox with no default access to the OS, so we only need to really worry about providing tight resource limits for the smart contracts. All developers should be aware of these limits.

*Memory Usage* - When instantiating a Wasm VM, it is provided by 32MB of RAM by default. This is to store the byte code as well as all memory used by running the process (stack and heap). This should be plenty large for almost any contract, but maybe some complex zero knowledge circuits would hit limits there. It is also small enough to ensure that contracts have minimal impact of memory usage of the blockchain.

*CPU Usage* - The [Wasmer Runtime](https://github.com/wasmerio/wasmer) that we use, has ability to inject metering logic into the wasm code. It calculates prices for various operations and charges and checks limits before every jump statement (loop, function call, etc), to produce a deterministic gas price regardless of cpu speed, platform, etc. Before executing a contract, a wasm gas limit is set based on remaining cosmos sdk gas, and gas deducted at the end of the contract (there is a constant multiplier to convert, currently 100 wasm gas to 1 sdk gas). This puts a hard limit on any CPU computations as you must pay for the cycles used.

*Disk Usage* - All disk access is via reads and writes on the KVStore. The Cosmos SDK already [enforces gas payments for KVStore access](https://github.com/cosmos/cosmos-sdk/blob/4ffabb65a5c07dbb7010da397535d10927d298c1/store/types/gas.go#L154-L162). Since all disk access in the contracts is made via callbacks into the SDK, this is charged there. If one were to integrate CosmWasm in another runtime, you would have to make sure to charge for access there as well.

## Lessons Learned from Ethereum

Ethereum is the grandfather of all blockchain smart contract platforms and has far more usage and real world experience than any other platform. We cannot discount this knowledge, but instead learn from their successes and failures to produce a more robust smart contract platform.

They have compiled a list of [all known ethereum attack vectors](https://github.com/sigp/solidity-security-blog) along with mitigation strategies. We shall compare Cosmwasm against this list to see how much of this applies here. Many of these attack vectors are closed by design. A number remain and a section is planned on avoiding the remaining such issues. **TODO**

1. [Reentrancy](https://github.com/sigp/solidity-security-blog#reentrancy) SAFE

In cosmwasm, we return messages to execute other contracts, in the same atomic operation, but *after* the contract has finished. This is based on the actor model and avoid the possibility of reentrancy attacks - there is never volatile state when a contract is called.

1. [Arithmetic under/overflows](https://github.com/sigp/solidity-security-blog#ouflow) SAFE

Rust allows you to simply set `overflow-checks = true` in the [Cargo manifest](https://doc.rust-lang.org/cargo/reference/manifest.html#the-profile-sections) to abort the program if any overflow is detected. No way to opt-out of safe math.

1. [Unexpected Ether](https://github.com/sigp/solidity-security-blog#ether) OPEN

This involves a contract depending on complete control of it's balance. A design pattern that should be avoided in any contract system.

1. [Delegate Call](https://github.com/sigp/solidity-security-blog#delegatecall) SAFE

We don't have such Delegate Call logic in CosmWasm. You can import modules, but they are linked together at compile time, which allows them to be tested as a whole, and no subtle entry points inside of a contract's logic.

1. [Default Visibilities](https://github.com/sigp/solidity-security-blog#visibility) SAFE

Rather than auto-generating entry points for every function/method in your code (and worse yet, assuming public if not specified), the developer must clearly define a list of messages to be handled and dispatch them to the proper functions. It is impossible to accidentally expose a function this way.

1. [Entropy Illusion](https://github.com/sigp/solidity-security-blog#entropy) OPEN

The block hashes (and last digits of timestamps) are even more easily manipulated by block proposers in Tendermint, than with miners in Ethereum. They should definitely not be used for randomness. There is work planned to provide a secure random beacon, and expose this secure source of entropy to smart contracts.

1. [External Contract Referencing](https://github.com/sigp/solidity-security-blog#contract-reference) OPEN

**TODO** A way to look up and verify code at a remote address

1. [Short Address/Parameter Attack](https://github.com/sigp/solidity-security-blog#short-address) SAFE

This is an exploit that takes advantage of the RLP encoding mechanism and fixed 32-byte stack size. It does not apply to our type-checking json parser.

1. [Unchecked CALL Return Values](https://github.com/sigp/solidity-security-blog#unchecked-calls) SAFE

CosmWasm does not allow calling other contracts directly, but rather returning message to later be dispatched by a router. The router will check the result of all messages, and if **any** message in the chain returns an error, the entire transaction is aborted, and state changed rolled back. This allows you to safely focus on the success case when scheduling calls to other contracts, knowing all state will be rolled back if it does not go as planned.

1. [Race Conditions/Front Running](https://github.com/sigp/solidity-security-blog#race-conditions) OPEN

**TODO** Finish this list