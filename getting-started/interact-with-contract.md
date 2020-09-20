---
order: 5
---

# Uploading and Interacting

We have the binary ready. Now it is time to see some wasm action. You can use [Go CLI](#go-cli) or
[Node Console](#node-console) as you wish.

## GO CLI

We generated a wasm binary executable in the previous chapter. Let's put it into use. Now, we will
upload the code to the blockchain. Afterwards, you can download the bytecode to verify it is proper:

```bash
# see how many codes we have now
coral query wasm list-code

# gas is huge due to wasm size... but auto-zipping reduced this from 1.8M to around 600k
# you can see the code in the result
RES=$(coral tx wasm store contract.wasm --from fred \
    --gas-prices="0.025ushell" --gas="auto" --gas-adjustment="1.2" -y)

# you can also get the code this way
CODE_ID=$(echo $RES | jq -r '.logs[0].events[0].attributes[-1].value')

# no contracts yet, this should return `null`
coral query wasm list-contract-by-code $CODE_ID

# you can also download the wasm from the chain and check that the diff between them is empty
coral query wasm code $CODE_ID download.wasm
diff contract.wasm download.wasm
```

### Instantiating the Contract

We can now create an instance of this wasm contract. Here the verifier will fund an escrow, that
will allow fred to control payout and upon release, the funds go to bob.

```bash
# instantiate contract and verify
INIT=$(jq -n --arg fred $(coral keys show -a fred) --arg bob $(coral keys show -a bob) '{"arbiter":$fred,"recipient":$bob}')
coral tx wasm instantiate $CODE_ID "$INIT" \
    --from fred --amount=50000ushell  --label "escrow 1" \
    --gas-prices="0.025ushell" --gas="auto" --gas-adjustment="1.2" -y

# check the contract state (and account balance)
coral query wasm list-contract-by-code $CODE_ID
CONTRACT=$(coral query wasm list-contract-by-code $CODE_ID | jq -r '.[0].address')
echo $CONTRACT

# we should see this contract with 50000ushell
coral query wasm contract $CONTRACT
coral query account $CONTRACT

# you can dump entire contract state
coral query wasm contract-state all $CONTRACT

# note that we prefix the key "config" with two bytes indicating it's length
# echo -n config | xxd -ps
# gives 636f6e666967
# thus we have a key 0006636f6e666967

# you can also query one key directly
coral query wasm contract-state raw $CONTRACT 0006636f6e666967 --hex

# Note that keys are hex encoded, and val is base64 encoded.
# To view the returned data (assuming it is ascii), try something like:
# (Note that in many cases the binary data returned is non in ascii format, thus the encoding)
coral query wasm contract-state all $CONTRACT | jq -r '.[0].key' | xxd -r -ps
coral query wasm contract-state all $CONTRACT | jq -r '.[0].val' | base64 -d

# or try a "smart query", executing against the contract
coral query wasm contract-state smart $CONTRACT '{}'
# (since we didn't implement any valid QueryMsg, we just get a parse error back)
```

Once we have the funds in the escrow, let us try to release them. First, failing to do so with a key
that is not the verifier, then using the proper key to release.

```bash
# execute fails if wrong person
APPROVE='{"approve":{"quantity":[{"amount":"50000","denom":"ushell"}]}}'
coral tx wasm execute $CONTRACT "$APPROVE" \
    --from thief \
    --gas-prices="0.025ushell" --gas="auto" --gas-adjustment="1.2" -y

# looking at the logs should show: "execute wasm contract failed: Unauthorized"
# and bob should still be broke (and broken showing the account does not exist Error)
coral query account $(coral keys show bob -a)

# but succeeds when fred tries
coral tx wasm execute $CONTRACT "$APPROVE" \
    --from fred \
    --gas-prices="0.025ushell" --gas="auto" --gas-adjustment="1.2" -y

coral query account $(coral keys show bob -a)

# contract coins must be empty
coral query account $CONTRACT
```

## Node Console

If you set up the Node Console / REPL in the [client setup section](./setting-env#setup-node-repl), you can use
that to deploy and execute your contract. I think you will find that JSON manipulation and parsing
is a bit nicer in JavaScript than in Shell Script.

First, go to the cli directory and start up your console:

```sh
npx @cosmjs/cli --init https://raw.githubusercontent.com/CosmWasm/testnets/master/coralnet/cli_helper.ts
```

Now, we make all the keys and initialize clients:

```js
const fredSeed = loadOrCreateMnemonic("fred.key");
const {address: fredAddr, client: fredClient} = await connect(fredSeed, {});

// bob doesn't have a client here as we will not
// submit any tx with this account, just query balance
const bobSeed = loadOrCreateMnemonic("bob.key");
const bobAddr = await mnemonicToAddress("coral", bobSeed);

const thiefSeed = loadOrCreateMnemonic("thief.key");

const {address: thiefAddr, client: thiefClient} = await connect(thiefSeed, {});

console.log(fredAddr, bobAddr, thiefAddr);
```

Hit the faucet it needed for fred , so he has tokens to submit transactions:

```js
fredClient.getAccount();
// if "undefined", do the following
hitFaucet(defaultFaucetUrl, fredAddr, "SHELL")
fredClient.getAccount();

thiefClient.getAccount();
// if "undefined", do the following
hitFaucet(defaultFaucetUrl, thiefAddr, "SHELL")
thiefClient.getAccount();

// check bobAddr has no funds
fredClient.getAccount(bobAddr);

// get the working directory (needed later)
process.cwd()
```

### Uploading with JS

Now, we go back to the Node console and upload the contract and instantiate it:

```js
const wasm = fs.readFileSync('contract.wasm');
// you can add extra information to contract details such as source and builder.
const up = await fredClient.upload(wasm, { source: "https://crates.io/api/v1/crates/cw-escrow/0.6.0/download", builder: "cosmwasm/rust-optimizer:0.9.0"});

console.log(up);
const { codeId } = up;

const initMsg = {arbiter: fredAddr, recipient: bobAddr};
const { contractAddress } = await fredClient.instantiate(codeId, initMsg, "Escrow 1", { memo: "memo", transferAmount: [{denom: "ushell", amount: "50000"}]});

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

### Executing Contract with JS

Once we have properly configured the contract, let's show how to use it, both the proper "approve"
command:

```js
const approve = {approve: {quantity: [{amount: "50000", denom: "ushell"}]}};

// thief cannot approve
thiefClient.execute(contractAddress, approve)

// but fred can (and moves money to bob)
fredClient.execute(contractAddress, approve);
// verify bob got the tokens
fredClient.getAccount(bobAddr);
// verify contract lost
fredClient.getAccount(contractAddress);
```
