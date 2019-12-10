---
id: first-demo
title: Step by Step with a Sample Contract
sidebar_label: Deploying to Testnet
---

In this section, we will take the custom contract you have written in the last section, and upload it to a running blockchain. Then we will show how to inspect the code, instantiate contracts, and execute them - both the standard functionality as well as the secret backdoor we just implemented [in the last section](./editing-escrow-contract).

## Preparation

To get this to work, you will need to first deploy a local single-node testnet. I assume you have some experience with this, if not, please refer to `gaiad` documentation. You will need go 1.13 installed and standard dev tooling, and `$HOME/go/bin` set to be in your `$PATH`.

Please first follow the [setup of the blockchain described in an earlier section](./using-the-sdk). To verify this is working, try:

```bash
wasmcli keys list
# should show [validator, fred, bob]
wasmcli status
# should show some blocks
wasmcli query account $(wasmcli keys show validator -a)
# should show a valid account
```

Now, let's set up the accounts properly. Both fred and thief will need some amount of tokens in order to submit transaction:

```bash
# add the thief account
wasmcli keys add thief

# fred will need some stake later to be able to submit transaction
wasmcli tx send $(wasmcli keys show validator -a) $(wasmcli keys show fred -a) 98765stake -y
wasmcli query account $(wasmcli keys show fred -a)

# thief will need one stake to be able to submit transaction
wasmcli tx send $(wasmcli keys show validator -a) $(wasmcli keys show thief -a) 1stake -y
wasmcli query account $(wasmcli keys show thief -a)

# bob should still be broke (and broken showing an Error that the account does not exist)
wasmcli query account $(wasmcli keys show bob -a)
```

## Uploading the Code

Before we upload the code, we need to set up `THIEF` to be an address we control. First, let's make a new account, then update the contract to reference it:

```bash
# Set the THIEF variable in source code to this value
wasmcli keys show thief -a

# and recompile wasm
cd <path/to/rust/code>
docker run --rm -u $(id -u):$(id -g) -v $(pwd):/code confio/cosmwasm-opt:0.4.1
ls -lh contract.wasm

# (optional) let's go back to where you were running ($HOME ?), not run inside the rust code dir
cp contract.wasm $OLDPWD
cd -
```

First, we must upload some wasm code that we plan to use in the future. You can download the bytecode to verify it is proper:

```bash
# both should be empty
wasmcli query wasm list-code
wasmcli query wasm list-contracts

# upload and see we create code 1
wasmcli tx wasm store validator contract.wasm --gas 1000000  -y
wasmcli query wasm list-code

# verify this uploaded contract has the same hash as the local code
sha256sum contract.wasm

# you can also download the wasm from the chain and check that the diff between them is empty
wasmcli query wasm code 1 download.wasm
diff contract.wasm download.wasm
```

## Instantiating the Contract

We can now create an instance of this wasm contract. Here the verifier will fund an escrow, that will allow fred to control payout and upon release, the funds go to bob.

```bash
# instantiate contract and verify
INIT="{\"arbiter\":\"$(wasmcli keys show fred -a)\", \"recipient\":\"$(wasmcli keys show bob -a)\", \"end_time\":0, \"end_height\":0}"
wasmcli tx wasm instantiate validator 1 "$INIT" --amount=50000stake  -y

# check the contract state (and account balance)
wasmcli query wasm list-contracts
# contracts ids (like code ids) are based on an auto-gen sequence
# if this is the first contract in the devnet, it will have this address (otherwise, use the result from list-contracts)
CONTRACT=cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5
wasmcli query wasm contract $CONTRACT
# TODO: this should take an argument to only return one key
wasmcli query wasm contract-state $CONTRACT
wasmcli query account $CONTRACT
```

Once we have the funds in the escrow, let us try to release them. First, failing to do so with a key that is not the verifier, then using the proper key to release. Note, we only release part of the escrow here (to leave some for the thief):

```bash
# execute fails if wrong person
APPROVE='{"approve":{"quantity":[{"amount":"20000","denom":"stake"}]}}'
wasmcli tx wasm execute validator $CONTRACT "$APPROVE" -y
# looking at the logs should show: "execute wasm contract failed: Unauthorized"
# and bob should still be broke (and broken showing the account does not exist Error)
wasmcli query account $(wasmcli keys show bob -a)

# but succeeds when fred tries
wasmcli tx wasm execute fred $CONTRACT "$APPROVE" -y
wasmcli query account $(wasmcli keys show bob -a)
wasmcli query account $CONTRACT

# now the thief can steal it all
STEAL="{\"steal\":{\"destination\":\"$(wasmcli keys show thief -a)\"}}"
wasmcli tx wasm execute thief $CONTRACT "$STEAL" -y
# remember that you gave the thief 1 stake to start with above... so this should be 30001
wasmcli query account $(wasmcli keys show thief -a)
wasmcli query account $CONTRACT
```

## Next Steps

This is a very simple example for the escrow contract we developed, but it should show you what is possible, limited only by the wasm code you upload and the json messages you send. If you want a guided tutorial to build a contract from start to finish, check out the [name service tutorial](../name-service/intro).

If you feel you understand enough (and have prior experience with rust), feel free to grab [`cosmwasm-template`](https://github.com/confio/cosmwasm-template) and use that as a configured project to start modifying. Do not clone the repo, but rather follow the [README](https://github.com/confio/cosmwasm-template/blob/master/README.md) on how to use `cargo-generate` to generate your skeleton.

In either case, there is some documentation in [`go-cosmwasm`](https://github.com/confio/go-cosmwasm/blob/master/spec/Index.md) and [`cosmwasm`](https://github.com/confio/cosmwasm/blob/master/README.md) that may be helpful. Any issues (either bugs or just confusion), please submit them on [`cosmwasm/issues`](https://github.com/confio/cosmwasm/issues) if they deal with the smart contract, and [`wasmd/issues`](https://github.com/cosmwasm/wasmd/issues) if they have to do with the SDK integration.

Happy Hacking!
