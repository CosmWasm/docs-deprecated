---
id: first-demo
title: Step by Step with a Sample Contract
sidebar_label: First Demo
---

**TODO: go through and clean this up**

To get this to work, you will need to first deploy a local single-node testnet. I assume you have some experience with this, if not, please refer to gaiad documentation. You will need go 1.13 installed and standard dev tooling, and `$HOME/go/bin` set to be in your `$PATH`.

**WARNING** The server will only work on osx and linux. Windows support is on the roadmap (but you should be able to use a Windows client).

Checkout code and compile:

```
git clone https://github.com/cosmwasm/wasmd.git
cd wasmd
make install
```

Set up a single-node local testnet:

```bash
cd $HOME
wasmd init --chain-id=testing testing

wasmcli keys add validator

wasmd add-genesis-account $(wasmcli keys show validator -a) 1000000000stake,1000000000validatortoken

wasmd gentx --name validator
wasmd collect-gentxs
wasmd start
```

Now, open up another window and set up your client:

```bash
wasmcli config chain-id testing
wasmcli config trust-node true
wasmcli config node tcp://localhost:26657
wasmcli config output json
wasmcli config indent true

wasmcli keys add fred
wasmcli keys add bob
wasmcli keys list

# verify initial setup
wasmcli query account $(wasmcli keys show validator -a)
wasmcli query wasm list-code
wasmcli query wasm list-contracts

# give some tokens to fred for later
wasmcli tx send $(wasmcli keys show validator -a) $(wasmcli keys show fred -a) 98765stake
wasmcli query account $(wasmcli keys show fred -a)
wasmcli query account $(wasmcli keys show bob -a)
```

Now we have a running node and a prepare cli client, let's upload some contracts and let them run. First, we must upload some wasm code that we plan to use in the future. You can download the bytecode to verify it is proper:

```bash
curl -L https://github.com/cosmwasm/wasmd/blob/master/x/wasm/internal/keeper/testdata/contract.wasm?raw=true > upload.wasm
wasmcli tx wasm store validator upload.wasm --gas 800000
wasmcli query wasm list-code
wasmcli query wasm code 1 download.wasm
sha256sum upload.wasm download.wasm
```

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

This is a very simple example for the [minimal demo contract](https://github.com/confio/cosmwasm/blob/master/contracts/hackatom/src/contract.rs), but it should show you what is possible, limited only by the wasm code you upload and the json messages you send.

