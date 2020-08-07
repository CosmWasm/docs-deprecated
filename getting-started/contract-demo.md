---
order: 4
---

# Step by Step with a Sample Contract

In this section, we will download a sample contract, compile, and upload it to a running blockchain.

Please first review the [client setup instructions](./setting-env.md), and configure and verify a client, either Go CLI or
Node.JS console.

## Compiling and Testing a Contract

Let's download the repo which we collect [`cosmwasm-examples`](https://github.com/CosmWasm/cosmwasm-examples) and try out an existing simple escrow contract that can hold some native tokens and gives the power to an arbiter to release them to a pre-defined beneficiary. First clone the repo and try to build the wasm bundle:

```bash
# get the code
git clone https://github.com/CosmWasm/cosmwasm-examples
cd cosmwasm-examples/escrow
git checkout escrow-0.5.2

# compile the wasm contract with stable toolchain
rustup default stable
cargo wasm
```

After this compiles, it should produce a file in `target/wasm32-unknown-unknown/release/cw_escrow.wasm`. A quick `ls -l` should show around 2MB. This is a release build, but not stripped of all unneeded code. To produce a much smaller
version, you can run this which tells the compiler to strip all unused code out:

```bash
RUSTFLAGS='-C link-arg=-s' cargo wasm
```

This produces a file about 174kB. We use this and another optimizer to produce the final product uploaded to the blockchain.
You don't need to worry about running this yourself (unless you are curious), but you should have an idea of the final
size of your contract this way.

### Unit Tests

Let's try running the unit tests:

```bash
RUST_BACKTRACE=1 cargo unit-test
```

After some compilation steps, you should see:

```text
running 5 tests
test contract::tests::cannot_initialize_expired ... ok
test contract::tests::proper_initialization ... ok
test contract::tests::init_and_query ... ok
test contract::tests::handle_refund ... ok
test contract::tests::handle_approve ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

`RUST_BACKTRACE=1` will provide you with full stack traces on any error, which is super useful. This only works for unit tests (which test native rust code, not the compiled wasm). Also, if you want to know where `cargo wasm` and `cargo unit-test` come from, they are just aliases defined in `.cargo/config`. Take a look there to understand the cargo flags more.

### Setting Root Directory

Both of the above extensions look for a Cargo.toml file in the root directory of your workspace, and only parse rust code referenced by this Cargo.toml file (listed as a workspace, or imported by `src/lib.rs`). The [`cosmwasm-examples`](https://github.com/CosmWasm/cosmwasm-examples) repo does not have a `Cargo.toml` file, but rather one in each example sub-directory. To ensure proper IDE support when working on this example, you should open only the `escrow` directory. And in general, have one window open for one rust projects, rooted in the same directory as it's `Cargo.toml` file.

## Uploading the Code

### GO CLI

Before we upload the code, we need to compile the contract to binary.

```bash
# for the rest of this section, we assume you are in the same path as the rust contract (Cargo.toml)
# compile wasm
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.9.0
```

Then we upload the code to the blockchain. Afterwards you can download the bytecode to verify it is proper:

```bash
# see how many codes we have now
wasmcli query wasm list-code

# gas is huge due to wasm size... but auto-zipping reduced this from 1.8M to around 600k
# you can see the code in the result
RES=$(wasmcli tx wasm store contract.wasm --from fred --gas 900000 -y)
# you can also get the code this way
CODE_ID=$(echo $RES | jq -r '.logs[0].events[0].attributes[-1].value')
# no contracts yet, this should return `null`
wasmcli query wasm list-contract-by-code $CODE_ID

# you can also download the wasm from the chain and check that the diff between them is empty
wasmcli query wasm code $CODE_ID download.wasm
diff contract.wasm download.wasm
```

#### Instantiating the Contract

We can now create an instance of this wasm contract. Here the verifier will fund an escrow, that will allow fred to control payout and upon release, the funds go to bob.

```bash
# instantiate contract and verify
INIT=$(jq -n --arg fred $(wasmcli keys show -a fred) --arg bob $(wasmcli keys show -a bob) '{"arbiter":$fred,"recipient":$bob}')
wasmcli tx wasm instantiate $CODE_ID "$INIT" --from fred --amount=50000ucosm  --label "escrow 1" -y

# check the contract state (and account balance)
wasmcli query wasm list-contract-by-code $CODE_ID
CONTRACT=$(wasmcli query wasm list-contract-by-code $CODE_ID | jq -r '.[0].address')
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
wasmcli query wasm contract-state all $CONTRACT | jq -r '.[0].key' | xxd -r -ps
wasmcli query wasm contract-state all $CONTRACT | jq -r '.[0].val' | base64 -d

# or try a "smart query", executing against the contract
wasmcli query wasm contract-state smart $CONTRACT '{}'
# (since we didn't implement any valid QueryMsg, we just get a parse error back)
```

Once we have the funds in the escrow, let us try to release them. First, failing to do so with a key that is not the verifier, then using the proper key to release.

```bash
# execute fails if wrong person
APPROVE='{"approve":{"quantity":[{"amount":"50000","denom":"ucosm"}]}}'
wasmcli tx wasm execute $CONTRACT "$APPROVE" --from thief -y
# looking at the logs should show: "execute wasm contract failed: Unauthorized"
# and bob should still be broke (and broken showing the account does not exist Error)
wasmcli query account $(wasmcli keys show bob -a)

# but succeeds when fred tries
wasmcli tx wasm execute $CONTRACT "$APPROVE" --from fred -y
wasmcli query account $(wasmcli keys show bob -a)
wasmcli query account $CONTRACT
```

### Node Console

If you set up the Node Console / REPL in the
[client setup section](./using-the-sdk), you can use that
to deploy and execute your contract.
I think you will find that JSON manipulation and parsing
is a bit nicer in JavaScript than in Shell Script.

First, go to the cli directory and start up your console:

```sh
npx @cosmjs/cli --init https://raw.githubusercontent.com/CosmWasm/cosmjs/v0.22.0/packages/cli/examples/helpers.ts
```

Now, we make all the keys and initialize clients:

```js
const fredSeed = loadOrCreateMnemonic("fred.key");
const {address: fredAddr, client: fredClient} = await connect(fredSeed, {});

// bob doesn't have a client here as we will not
// submit any tx with this account, just query balance
const bobSeed = loadOrCreateMnemonic("bob.key");
const bobAddr = await mnemonicToAddress("cosmos", bobSeed);

const {address: thiefAddr, client: thiefClient} = await connect(thiefSeed, {});

console.log(fredAddr, bobAddr, thiefAddr);
```

Hit the faucet it needed for fred , so he has tokens to submit transactions:

```js
fredClient.getAccount();
// if "undefined", do the following
hitFaucet(defaultFaucetUrl, fredAddr, "COSM")
fredClient.getAccount();

thiefClient.getAccount();
// if "undefined", do the following
hitFaucet(defaultFaucetUrl, thiefAddr, "COSM")
thiefClient.getAccount();

// check bobAddr has no funds
fredClient.getAccount(bobAddr);

// we need this address to configure the contract properly
console.log("thief", thiefAddr);

// get the working directory (needed later)
process.cwd()
```

#### Uploading with JS

Now, we go back to the Node console and upload the
contract and instantiate it:

```js
const wasm = fs.readFileSync('contract.wasm');
// fake source, but this can be verified to be false
// by any careful observer
const up = await fredClient.upload(wasm, { source: "https://crates.io/api/v1/crates/cw-escrow/0.4.0/download", builder: "cosmwasm/rust-optimizer:0.9.0"});

console.log(up);
const { codeId } = up;

const initMsg = {arbiter: fredAddr, recipient: bobAddr};
const { contractAddress } = await fredClient.instantiate(codeId, initMsg, "Escrow 1", { memo: "memo", transferAmount: [{denom: "ucosm", amount: "50000"}]});

// check the contract is set up properly
console.log(contractAddress);
fredClient.getContract(contractAddress);
fredClient.getAccount(contractAddress);

// make a raw query - key length prefixed "config"
const key = new Uint8Array([0, 6, ...toAscii("config")]);
const raw = await fredClient.queryContractRaw(contractAddress, key);
JSON.parse(fromUtf8(raw))
// note the addresses are stored in base64 internally, not bech32, but the data is there... this is why we often implement smart queries on real contracts
```

#### Executing Contract with JS

Once we have properly configured the contract, let's
show how to use it, both the proper "approve" command:

```js
const approve = {approve: {quantity: [{amount: "20000", denom: "ucosm"}]}};

// thief cannot approve
thiefClient.execute(contractAddress, approve)

// but fred can (and moves money to bob)
fredClient.execute(contractAddress, approve);
// verify bob got the tokens
fredClient.getAccount(bobAddr);
// verify contract lost
fredClient.getAccount(contractAddress);
```

We have finished the first tutorial. As you've seen it's pretty easy.

## Next Steps

This is a very simple example for the escrow contract we developed, but it should show you what is possible, limited only by the wasm code you upload and the json messages you send. If you want a guided tutorial to build a contract from start to finish, check out the [name service tutorial](../tutorials/name-service/intro).

If you feel you understand enough (and have prior experience with rust), feel free to grab [`cosmwasm-template`](https://github.com/CosmWasm/cosmwasm-template) and use that as a configured project to start modifying. Do not clone the repo, but rather follow the [README](https://github.com/CosmWasm/cosmwasm-template/blob/master/README.md) on how to use `cargo-generate` to generate your skeleton.

In either case, there is some documentation in [`go-cosmwasm`](https://github.com/CosmWasm/go-cosmwasm/blob/master/spec/Index.md) and [`cosmwasm`](https://github.com/CosmWasm/cosmwasm/blob/master/README.md) that may be helpful. Any issues (either bugs or just confusion), please submit them on [`cosmwasm/issues`](https://github.com/CosmWasm/cosmwasm/issues) if they deal with the smart contract, and [`wasmd/issues`](https://github.com/CosmWasm/wasmd/issues) if they have to do with the SDK integration.

Happy Hacking!
