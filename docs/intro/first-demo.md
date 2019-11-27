---
id: first-demo
title: Step by Step with a Sample Contract
sidebar_label: Deploying to Testnet
---

In this section, we will take the custom contract you have writen in the last section, and upload it to a running blockchain. Then we will show how to inspect the code, instantiate contracts, and execute them - both the standard functionality as well as the secret backdoor we just implemented [in the last section](./editing-escrow-contract).

## Preparation

To get this to work, you will need to first deploy a local single-node testnet. I assume you have some experience with this, if not, please refer to gaiad documentation. You will need go 1.13 installed and standard dev tooling, and `$HOME/go/bin` set to be in your `$PATH`.

Please first follow the [setup of the blockchain described in an earlier section](./using-the-sdk). To verify this is working, try:

```
wasmcli keys list
# should show [validator, fred, bob]
wasmcli status
# should show some blocks
wasmcli query account $(wasmcli keys show validator -a)
# should show a valid account
```

Now, let's set up the accounts properly. Both fred and thief will need some amount of tokens in order to submit transaction:

```
# add the thief account
wasmcli keys add thief

# fred will need some stake later to be able to submit transaction
wasmcli tx send $(wasmcli keys show validator -a) $(wasmcli keys show fred -a) 98765stake
wasmcli query account $(wasmcli keys show fred -a)

# thief will need one stake to be able to submit transaction
wasmcli tx send $(wasmcli keys show validator -a) $(wasmcli keys show thief -a) 1stake
wasmcli query account $(wasmcli keys show fred -a)

# bob should still be broke
wasmcli query account $(wasmcli keys show bob -a)
```

## Uploading the Code

Before we upload the code, we need to set up `THIEF` to be an address we control. First, let's make a new accout, then update the contract to reference it:

```
# Set the THIEF variable in source code to this value
wasmcli keys show thief -a

# and recompile wasm
docker run --rm -u $(id -u):$(id -g) -v $(pwd):/code confio/cosmwasm-opt:0.4.1
```

First, we must upload some wasm code that we plan to use in the future. You can download the bytecode to verify it is proper:

```
# both should be empty
wasmcli query wasm list-code
wasmcli query wasm list-contracts

# upload and see we create code 1
wasmcli tx wasm store validator contract.wasm --gas 800000
wasmcli query wasm list-code

# verify this uploaded contract has the same hash as the local code
sha256sum contract.wasm

# you can also download the wasm from the chain
wasmcli query wasm code 1 download.wasm
diff contract.wasm download.wasm
```

## Instantiating the Contract

**TODO** update from here below

We can now create an instance of this wasm contract. Here the verifier will fund an escrow, that will allow fred to control payout and upon release, the funds go to bob.

```bash
# instantiate contract and verify
INIT="{\"verifier\":\"$(wasmcli keys show fred -a)\", \"beneficiary\":\"$(wasmcli keys show bob -a)\"}"
wasmcli tx wasm instantiate validator 1 "$INIT" --amount=50000stake

# check the contract state (and account balance)
sleep 3
wasmcli query wasm list-contracts
CONTRACT=cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5
wasmcli query wasm contract $CONTRACT
wasmcli query wasm contract-state $CONTRACT
wasmcli query account $CONTRACT
```

Once we have the funds in the escrow, let us try to release them. First, failing to do so with a key that is not the verifier, then using the proper key to release:

```bash
# execute fails if wrong person
wasmcli tx wasm execute validator $CONTRACT "{}"
sleep 3
wasmcli query tx <hash from above>
wasmcli query account $(wasmcli keys show bob -a)

# but succeeds when fred tries
wasmcli tx wasm execute fred $CONTRACT "{}"
sleep 3
wasmcli query account $(wasmcli keys show bob -a)
wasmcli query account $CONTRACT
```

This is a very simple example for the escrow contract we developed, but it should show you what is possible, limited only by the wasm code you upload and the json messages you send. You can start hacking away on your own now, or try to build a contract from scratch by following along the [namecoin tutorial](../namecoin/intro).

