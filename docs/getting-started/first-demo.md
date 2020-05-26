---
id: first-demo
title: Step by Step with a Sample Contract
sidebar_label: Deploying to Testnet
---

In this section, we will take the custom contract you have written in the last section, and upload it to a running blockchain. Then we will show how to inspect the code, instantiate contracts, and execute them - both the standard functionality as well as the secret backdoor we just implemented [in the last section](./editing-escrow-contract).

## Preparation

Please first review the [client setup instructions](./using-the-sdk), and configure and verify a client, either Go CLI or
Node.JS console. Once you confirm that is working, try one of the following paths:

## Go CLI

```bash
wasmcli keys list
# should show [fred, bob]
wasmcli status
# should show some blocks
```

Now, let's set up the accounts properly. Both fred and thief will need some amount of tokens in order to submit transaction:

```bash
# add the thief account
wasmcli keys add thief

# check if fred and thief are empty (does not exist message) and hit faucet if so
wasmcli query account $(wasmcli keys show fred -a)
wasmcli query account $(wasmcli keys show thief -a)

# fred hits the faucet (JSON manipulation in bash is odd..)
JSON=$(jq -n --arg addr $(wasmcli keys show -a fred) '{"ticker":"COSM","address":$addr}')
curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.demo-08.cosmwasm.com/credit
wasmcli query account $(wasmcli keys show fred -a)

# thief will need some coins to be able to submit transaction
JSON=$(jq -n --arg addr $(wasmcli keys show -a thief) '{"ticker":"COSM","address":$addr}')
curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.demo-08.cosmwasm.com/credit
wasmcli query account $(wasmcli keys show thief -a)

# bob should still be broke (and broken showing an Error that the account does not exist)
wasmcli query account $(wasmcli keys show bob -a)
```

## Uploading the Code

Before we upload the code, we need to set up `THIEF` to be an address we control. First, let's make a new account, then update the contract to reference it:

```bash
# for the rest of this section, we assume you are in the same path as the rust contract (Cargo.toml)
cd <path/to/rust/code>

# Set the THIEF variable in source code to this value
wasmcli keys show thief -a

# and recompile wasm
docker run --rm -v $(pwd):/code \
  --mount type=volume,source=$(basename $(pwd))_cache,target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.8.0

# ensure the hash changed
cat hash.txt
```

First, we must upload some wasm code that we plan to use in the future. You can download the bytecode to verify it is proper:

```bash
# see how many codes we have now
wasmcli query wasm list-code

# gas is huge due to wasm size... but auto-zipping reduced this from 1.8M to around 600k
# you can see the code in the result
wasmcli tx wasm store contract.wasm --from fred --gas 600000  -y
# you can also get the code this way
CODE_ID=$(wasmcli query wasm list-code | jq .[-1].id)
# no contracts yet, this should return `null`
wasmcli query wasm list-contract-by-code $CODE_ID

# you can also download the wasm from the chain and check that the diff between them is empty
wasmcli query wasm code $CODE_ID download.wasm
diff contract.wasm download.wasm
```

## Instantiating the Contract

We can now create an instance of this wasm contract. Here the verifier will fund an escrow, that will allow fred to control payout and upon release, the funds go to bob.

```bash
# instantiate contract and verify
INIT=$(jq -n --arg fred $(wasmcli keys show -a fred) --arg bob $(wasmcli keys show -a bob) '{"arbiter":$fred,"recipient":$bob}')
wasmcli tx wasm instantiate $CODE_ID "$INIT" --from fred --amount=50000ucosm  --label "escrow 1" -y

# check the contract state (and account balance)
wasmcli query wasm list-contract-by-code $CODE_ID
CONTRACT=$(wasmcli query wasm list-contract-by-code $CODE_ID | jq -r .[0].address)
echo $CONTRACT
# we should see this contract with 50000ucosm
wasmcli query wasm contract $CONTRACT
wasmcli query account $CONTRACT

# you can dump entire contract state
wasmcli query wasm contract-state all $CONTRACT

# note that we prefix the key "config" with two bytes indicating it's length
# echo -n config | xxd -ps
# gives 636f6e666967
# thus we have a key 0006636f6e666967

# you can also query one key directly
wasmcli query wasm contract-state raw $CONTRACT 0006636f6e666967 --hex

# Note that keys are hex encoded, and val is base64 encoded.
# To view the returned data (assuming it is ascii), try something like:
# (Note that in many cases the binary data returned is non in ascii format, thus the encoding)
wasmcli query wasm contract-state all $CONTRACT | jq -r .[0].key | xxd -r -ps
wasmcli query wasm contract-state all $CONTRACT | jq -r .[0].val | base64 -d

# or try a "smart query", executing against the contract
wasmcli query wasm contract-state smart $CONTRACT '{}'
# (since we didn't implement any valid QueryMsg, we just get a parse error back)
```

Once we have the funds in the escrow, let us try to release them. First, failing to do so with a key that is not the verifier, then using the proper key to release. Note, we only release part of the escrow here (to leave some for the thief):

```bash
# execute fails if wrong person
APPROVE='{"approve":{"quantity":[{"amount":"20000","denom":"ucosm"}]}}'
wasmcli tx wasm execute $CONTRACT "$APPROVE" --from thief -y
# looking at the logs should show: "execute wasm contract failed: Unauthorized"
# and bob should still be broke (and broken showing the account does not exist Error)
wasmcli query account $(wasmcli keys show bob -a)

# but succeeds when fred tries
wasmcli tx wasm execute $CONTRACT "$APPROVE" --from fred -y
wasmcli query account $(wasmcli keys show bob -a)
wasmcli query account $CONTRACT

# check what the thief has before
wasmcli query account $(wasmcli keys show thief -a)

# now the thief can steal all that is left
STEAL=$(jq -n --arg thief $(wasmcli keys show -a thief) '{"steal":{"destination":$thief}}')
wasmcli tx wasm execute $CONTRACT "$STEAL" --from thief -y
# remember we hit the faucet above, but this should raise the funds by 30000 ucosm
wasmcli query account $(wasmcli keys show thief -a)
# and this is empty
wasmcli query account $CONTRACT
```

## Next Steps

This is a very simple example for the escrow contract we developed, but it should show you what is possible, limited only by the wasm code you upload and the json messages you send. If you want a guided tutorial to build a contract from start to finish, check out the [name service tutorial](../name-service/intro).

If you feel you understand enough (and have prior experience with rust), feel free to grab [`cosmwasm-template`](https://github.com/CosmWasm/cosmwasm-template) and use that as a configured project to start modifying. Do not clone the repo, but rather follow the [README](https://github.com/CosmWasm/cosmwasm-template/blob/master/README.md) on how to use `cargo-generate` to generate your skeleton.

In either case, there is some documentation in [`go-cosmwasm`](https://github.com/CosmWasm/go-cosmwasm/blob/master/spec/Index.md) and [`cosmwasm`](https://github.com/CosmWasm/cosmwasm/blob/master/README.md) that may be helpful. Any issues (either bugs or just confusion), please submit them on [`cosmwasm/issues`](https://github.com/CosmWasm/cosmwasm/issues) if they deal with the smart contract, and [`wasmd/issues`](https://github.com/CosmWasm/wasmd/issues) if they have to do with the SDK integration.

Happy Hacking!
