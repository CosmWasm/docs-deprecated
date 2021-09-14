---
sidebar_position: 2
---

# Hints

## Hint 1

Reward vouchers are 16 character hexadecimal number (like `c0ad2205922223b2`).

## Hint 2: Endpoints

RPC: https://rpc.pebblenet.cosmwasm.com:443

Faucet: https://faucet.pebblenet.cosmwasm.com

Explorer: https://block-explorer.pebblenet.cosmwasm.com

## Hint 3: Formats

### Transactions, Addresses, Block Heights

In this event you will see strings like: `8B74EA4E6EC2B8940E6963DF813FE158171C1FEBEAFA36B38DFE80EA0521970C`
This is 32 bytes, hexadecimal string. Tendermint/cosmos-sdk hashes the txs and blocks in this format.
The hash above is a pebblenet transaction hash. These values always indexed by block explorers.
Run a search with the hash to see it’s content: https://block-explorer.pebblenet.cosmwasm.com/transactions/8B74EA4E6EC2B8940E6963DF813FE158171C1FEBEAFA36B38DFE80EA0521970C

Another value: `wasm1….` strings. These strings are bech32 account addresses.
Go ahead and see one: https://block-explorer.pebblenet.cosmwasm.com/account/wasm1k8lesl0wsspcpdfpuh8es3k4ymfsfkryydhw03

Block height is a sequential unsigned integer value that indexes a block. There could be many transactions in a single block.
Here is one: https://block-explorer.pebblenet.cosmwasm.com/blocks/334748

### Base64

From Wikipedia: Base64 is a group of binary-to-text encoding schemes that represent binary data (more specifically, a sequence of 8-bit bytes) in an ASCII string format by translating the data into a radix-64 representation

Basically if you see a string like this: `aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2hcP3ZcPU5VWXZiVDZ2VFBzCg==` this is a base64 encoded string.
To decode `echo “aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2hcP3ZcPU5VWXZiVDZ2VFBzCg==” | base64 -d`

## Hint 4: Queries

Querying on chain data

cosmos-sdk/CosmWasm based projects all have similar client apis: `terracli`, `wasmd`, `wasmd` and more.
Query and tx interfaces are very similar.

Query block:

```bash
wasmd query block 15 --node https://rpc.pebblenet.cosmwasm.com
```

Query tx:

```bash
wasmd query tx 8B74EA4E6EC2B8940E6963DF813FE158171C1FEBEAFA36B38DFE80EA0521970C --node https://rpc.pebblenet.cosmwasm.com
````

### Smart Query

Smart Query interface is defined by the contract itself thus you can run complex queries.

Sample cw20 query:

```bash
QUERY='{“token_info”:{}}’
wasmd query wasm contract-state smart [bech32_address] ‘$QUERY’
```

### Json Schema

Smart contract execute or query interface is defined by Json Schema that is found in the smart contract repo.
Smart contract developer should provide schema to the users: https://github.com/CosmWasm/cosmwasm-plus/tree/master/contracts/cw20-base/schema

### Execute Smart Contract

You can execute smart contracts using cli. Some riddles needs this skill for the solution:

Sending tokens from cw20

You need

```bash
SEND_MSG='{“transfer”: {“amount”:”1000″, “recipient”:”wasm170n6mk4k97kvrtj25t9ghm54ewmewt6yq9g6kt”}}’
wasmd tx wasm execute $CONTRACT_ADDR “$SEND_MSG” –from wallet
```

## Hint 5: Recovery and Signing

### Recovering Mnemonic

The mnemonic seed phrase is the only access to a wallet. You can recover access to an account if you have the mnemonic of the wallet.

You can recover an account using mnemonic with this command below:
```bash
wasmd keys add show --recover
> Enter your bip39 mnemonic
chef sense chicken net around sting course someone question badge hand also nation siren remember famous bird eagle phrase kidney devote damp sugar throw
```

### Signing offline transactions

Offline signing is a cool functionality. It is like a delayed payment, where you sign a transaction and only submit it later to the network. 
One use case: create a transaction that will send
from account A to B and send the unsigned tx to the account A owner to approve and sign the transaction then broadcast to the chain

```bash
# –generate-only flag creates tx and only prompts unsigned tx
wasmd tx bank send wasm134rsdpu5xfhegdclxmdeqxn0j6gmenkmcdmpuz wasm103hx72nfk0mypwlfa3qwyx4rzvv35gvyy83ral 100upebble --memo “you found me” --chain-id pebblenet-1 --generate-only > unsigned_tx.json
# {“body”:{“messages”:[{“@type”:”/cosmos.bank.v1beta1.MsgSend”,”from_address”:”wasm134rsdpu5xfhegdclxmdeqxn0j6gmenkmcdmpuz”,”to_address”:”wasm103hx72nfk0mypwlfa3qwyx4rzvv35gvyy83ral”,”amount”:[{“denom”:”upebble”,”amount”:”100″}]}],”memo”:”you found me”,”timeout_height”:”0″,”extension_options”:[],”non_critical_extension_options”:[]},”auth_info”:{“signer_infos”:[],”fee”:{“amount”:[],”gas_limit”:”81363″,”payer”:””,”granter”:””}},”signatures”:[]}

# signs the tx and posts it to the chain
wasmd tx sign unsigned_tx.json --from wasm134rsdpu5xfhegdclxmdeqxn0j6gmenkmcdmpuz --chain-id pebblenet-1
````
