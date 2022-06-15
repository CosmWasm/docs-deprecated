---
sidebar_position: 2
---

# Basics of Smart Contract Interaction

Smart contracts are executable codes. Normally, smart contracts are developed using Rust, compiled into WebAssembly (wasm) and finally code-optimized before being uploaded to the chain. Before moving forward and learning how to develop one, let us first deploy and interact with an existing smart contract to keep things simple. There are currently two options for deploying and interacting with contracts: `wasmd` and `CosmJS`.

## Where to find smart contracts?
A good number of smart contract binary executables are provided in the [cw-plus](https://github.com/CosmWasm/cw-plus/) repository alongside the code.
The [cw-plus](https://github.com/CosmWasm/cw-plus/) repository is a collection of production-grade smart contracts that has been heavily tested on real mainnets.
You will see a list of available contracts on the repository page.
You may click on the **Releases** button to see tagged binary executables, download the binaries and deploy them to
compatible blockchains.
## Download
Now, let us download a pre-built smart contract developed by the CosmWasm team. Click on the following link to download the cw20 pre-built binary.

* [cw20_base.wasm](https://github.com/CosmWasm/cw-plus/releases/download/v0.10.0/cw20_base.wasm)

Please don't pay attention to cw20-base details for now, just focus on getting a contract on the testnet first.
## Deployment

We will deploy the code using the `wasmd` CLI that was installed [earlier](/dev-academy/basics/environment#wasmd). Please make sure you've set up a wallet and requested some `umlg`s from the faucet beforehand.

Open a new terminal window and make sure the present working directory contains the cw20_base.wasm binary.
```sh
# Setting up the correct parameters
export TXFLAG="--node https://rpc.malaga-420.cosmwasm.com:443 --chain-id malaga-420 --gas-prices 0.25umlg --gas auto --gas-adjustment 1.3 -y --output json -b block"

# Storing the binary on chain
RES=$(wasmd tx wasm store cw20_base.wasm --from wallet $TXFLAG)

# Getting the code id for the stored binary
CODE_ID=$(echo $RES | jq -r '.logs[0].events[1].attributes[0].value')

# Printing the code id
echo $CODE_ID

# Querying the list of contracts instantiated with the code id above
wasmd query wasm list-contract-by-code $CODE_ID --node https://rpc.malaga-420.cosmwasm.com:443 --output json

# This should return an empty list, for now.
```

Now, the code is stored on the network and the `CODE_ID` is the identifier of the code.
### Instantiate
Smart contract code is just the blueprint of a smart contract. We *instantiate* the smart contract based on this smart contract code. Before the smart contract can be utilized, an instance of the smart contract must be present with a smart contract address. 

Here is a sample instantiation message for the cw20-base contract:
```json
{
  "name": "Golden Stars",
  "symbol": "STAR",
  "decimals": "2",
  "initial_balances": [
    {"address": "wasm1ez03me7uljk7qerswdp935vlaa4dlu48mys3mq", "amount": "10000"},
    {"address": "wasm1tx7ga0lsnumd5hfsh2py0404sztnshwqaqjwy8", "amount": "10000"},
    {"address": "wasm1mvjtezrn8dpateu0435trlw5062qy76gf738n0", "amount": "10000"}
  ],
  "mint": {
    "minter": "wasm1mvjtezrn8dpateu0435trlw5062qy76gf738n0"
  }
}
```
This message contains the initial state of the contract.

```shell
# Modifying the instantiation message to include the current wallet address
INIT=$(jq -n --arg wallet $(wasmd keys show -a wallet) '{"name":"Golden Stars","symbol":"STAR","decimals":2,"initial_balances":[{"address":"wasm1n8aqd9jq9glhj87cn0nkmd5mslz3df8zm86hrh","amount":"10000"},{"address":"wasm13y4tpsgxza44yq76qvj69sakq4jmeyqudwgwpk","amount":"10000"},{"address":$wallet,"amount":"10000"}],"mint":{"minter":$wallet}}')

# Instantiating the contract
wasmd tx wasm instantiate $CODE_ID "$INIT" --from wallet $TXFLAG --label "Our first cw20" --no-admin
```

You will see an output that is similar to the one below, indicating that the instantiation was successful:

```json
{
   "height":"1837751",
   "txhash":"9999EFF51367C40940478788A4E2FA3D9D5EA63C7B82D2891AB0E7F9C928011F",
   "data":"0A6D0A282F636F736D7761736D2E7761736D2E76312E4D7367496E7374616E7469617465436F6E747261637412410A3F7761736D31327967757A7171676E76336A7130763476746130646B667776683861343365727466637577746B7A746564653571357475727773376364643577",
   "raw_log":"[{\"events\":[{\"type\":\"instantiate\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"wasm12yguzqqgnv3jq0v4vta0dkfwvh8a43ertfcuwtkztede5q5turws7cdd5w\"},{\"key\":\"code_id\",\"value\":\"1268\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmwasm.wasm.v1.MsgInstantiateContract\"},{\"key\":\"module\",\"value\":\"wasm\"},{\"key\":\"sender\",\"value\":\"wasm1t9jfuyv8xqas7j7pf4jrt7r4sq7s6epeatkz9y\"}]}]}]",
   "logs":[
      {
         "events":[
            {
               "type":"instantiate",
               "attributes":[
                  {
                     "key":"_contract_address",
                     "value":"wasm12yguzqqgnv3jq0v4vta0dkfwvh8a43ertfcuwtkztede5q5turws7cdd5w"
                  },
                  {
                     "key":"code_id",
                     "value":"1268"
                  }
               ]
            },
            {
               "type":"message",
               "attributes":[
                  {
                     "key":"action",
                     "value":"/cosmwasm.wasm.v1.MsgInstantiateContract"
                  },
                  {
                     "key":"module",
                     "value":"wasm"
                  },
                  {
                     "key":"sender",
                     "value":"wasm1t9jfuyv8xqas7j7pf4jrt7r4sq7s6epeatkz9y"
                  }
               ]
            }
         ]
      }
   ],
   "gas_wanted":"230828",
   "gas_used":"192365"
```
This command from before should now output the instantiated contract address.
```sh
wasmd query wasm list-contract-by-code $CODE_ID --node https://rpc.malaga-420.cosmwasm.com:443 --output json
```
```json
{
  "contracts": [
    "wasm12yguzqqgnv3jq0v4vta0dkfwvh8a43ertfcuwtkztede5q5turws7cdd5w"
  ],
  "pagination": {}
}
```

Now, we have a ready-to-use, instantiated contract. As you no doubt have observed, a lot of JSON manipulation is required to interact with smart contracts using `wasmd` CLI. Luckily, we have a better option.

## CosmJS
CosmJS is the Swiss Army knife to power JavaScript based client solutions ranging from web-apps and block-explorers to server-side clients like faucets/scrapers in the Cosmos ecosystem. CosmJS contains all the functions you need to interact with Cosmos SDK clients. Making transactions, querying the blockchain and interacting with smart contracts can all be achieved using CosmJS.

For this tutorial, we will mainly explore the CosmWasm related capabilities of CosmJS.
### Setting up the CosmJS CLI Client

The first step should be to ensure that we can create an account and connect to the chain. You can always use the following command to start up the `@cosmjs/cli` with some cw20-specific helpers preloaded
(along with the generic ones).

```bash
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts
```
Now, the REPL client will be initialized.

```js
const [addr, client] = await useOptions(malagaOptions).setup('password');
client.getAccount(addr);
```

This will take a few seconds as credits are requested from the faucet, in order to ensure that you have some `umlg`s in your account to pay
fees with. When it returns, the output should be similar to the one below:

```json
{
  address: 'wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp',
  pubkey: {
    type: 'tendermint/PubKeySecp256k1',
    value: 'AkjSrJA0XT612qHvnHieHAebZ+cIA2jq3LRj0g4V/lOF'
  },
  accountNumber: 323,
  sequence: 4
}
```

### Reloading your Wallet {#reloading-your-wallet}
You can keep the current session active, or close and get back to it again some time later. As long as you run the following line with the same password, you can always use the same wallet address:

```js
const [addr, client] = await useOptions(malagaOptions).setup("password");
```
`useOptions()` with `malagaOptions` passed in handles everything that we manually had to specify before, using the `wasmd` CLI. When the function `setup` is called with a password, it checks for the file `~/.malaga.key` and loads the key from the file. In case the `~/.malaga.key` file is missing, a new one is created to encrypt and store your randomly-generated private key (actually mnemonic). During future sessions, you will need to use the same password to gain access to your private key again. Try `cat ~/.malaga.key` to prove yourself that it is indeed encrypted, or try running the line above with a different password and see how it fails.

:::caution
The line above encrypts and stores the key in the `~/.malaga.key` file. If you forget the password, either delete the `~/.malaga.key` file or pass a `filename` along with the password to create a new key as below:
```js
const [addr, client] = await useOptions(malagaOptions).setup("password","new_file_path_and_name");
```

:::

If you want the mnemonic, you can recover it anytime, as long as you still have the `~/.malaga.key` file and the correct password. This option can later be used to recover and use the same mnemonic to import the key into the `wasmd` CLI.

```js
useOptions(malagaOptions).recoverMnemonic("password");
```
Now that you feel a bit more secure about your keys (and the ability to load them later), we can start interacting with smart contracts using CosmJS CLI.

### Example: STAR {#example-star}

:::note
The example below is not meant to be copied verbatim, but to show how such a contract is set up and deployed the first time.
:::

If you haven't initialized one already, initialize a CosmJS CLI session with the following command:
```bash
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts 
```

```js
//Generate a wallet address or load an existing one
const [addr, client] = await useOptions(malagaOptions).setup("password");

//Create a new cw20 contract
const cw20 = CW20(client, malagaOptions);
//Deploy the contract
const codeId = await cw20.upload(addr, malagaOptions);
//Print the Code Id
console.log(`CodeId: ${codeId}`);
//Make sure to note the Code Id down, you will need it to interact with the binary later on

//Enable REPL editor mode to edit multiple lines of code
.editor
//Define the cw20 instantiation message parameters
const initMsg = {
  name: "Golden Stars",
  symbol: "STAR",
  decimals: 2,
  // List of addresses with positive initial balance - 100 STARs each!
  initial_balances: [
    {address: "wasm13krn38qhu83y5xvmjgydnk5vjau2u3c0tv5jsu", amount: "10000"},
    {address: "wasm1ppgpwep3yzh8w3d89xlzlens3420j5vs5q3p4j", amount: "10000"},
    {address: "wasm1fnx5jzqsdkntlq2nspjgswtezf45u5ug3kq9sw", amount: "10000"},
  ],
  //Your wallet address has the minting rights
  mint: {
    minter: addr,
  },
};

//Exit editor using `^D` to execute the code entered
^D

const contract = await cw20.instantiate(addr, codeId, initMsg, "STAR", malagaOptions);
console.log(`Contract: ${contract.contractAddress}`);
// Contract: wasm1etfpx2smcwualafpld2mn2prnrc3yyed084a083g5p2vcht79n9qck6h55

// Check the balance for one of the addresses with positive initial balance
console.log(await contract.balance("wasm13krn38qhu83y5xvmjgydnk5vjau2u3c0tv5jsu"));
// 10000
console.log(await contract.tokenInfo());
// {
//   name: 'Golden Stars',
//   symbol: 'STAR',
//   decimals: 2,
//   total_supply: '30000'
// }
console.log(await contract.minter());
// Should output your wallet address

// End the CosmJS CLI session
.exit
```

### Instantiating a New Contract

Now that the binary is uploaded and has a Code Id, we can easily instantiate a second contract. Again, please do go through the example below and feel free to customize the values before executing the code.

Initialize a new CosmJS CLI session with the following command:
```bash
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts 
```
```js
//Generate a wallet address or load an existing one
const [addr, client] = await useOptions(malagaOptions).setup("password");
//Create a new cw20 contract instance
const cw20 = CW20(client, malagaOptions);

//Enable REPL editor mode to edit multiple lines of code
.editor
//Define the cw20 instantiation message parameters
const initMsg = {
  name: "My Coin",
  symbol: "MINE",
  decimals: 6,
  initial_balances: [
    {address: addr, amount: "12345678000"},
  ],
  mint: {
    minter: addr,
    cap: "99900000000"
  },
};

//Exit editor using `^D` to execute the code entered
^D

//Enter the Code Id for the binary you have uploaded previously
const codeId = 55;
//Instantiate a new contract with the given Code Id and instantiation message parameters
const mine = await cw20.instantiate(addr, codeId, initMsg, "MINE", malagaOptions);
console.log(`Contract: ${mine.contractAddress}`);
// Contract: wasm1al2jl5kmhume74hdj6lspadmymz4attqpp9xuj6keqdgjwe9xalqlkle2h

// Check the balance for your wallet address and make sure the contract is instantiated correctly
mine.balance(addr);
//'12345678000'
mine.tokenInfo()
// {
//   name: 'My Coin',
//   symbol: 'MINE',
//   decimals: 6,
//   total_supply: '12345678000'
// }
mine.minter()
// {
//   minter: <Your wallet address>,
//   cap: '99900000000'
// }

//You may end the CosmJS CLI session for now.
.exit
```
We have successfully instantiated a second contract using the same Code Id. 

Now, it's time to go beyond instantiating a contract.
### Utilizing Contract Functions {#utilizing-contract-functions}

This section will focus on utilizing the query and execute functions provided by our newly constructed token.

Let's re-initialize the CosmJS CLI session first.
```bash
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts 
```

```js
const [addr, client] = await useOptions(malagaOptions).setup("password");
const cw20 = CW20(client, malagaOptions);

// List of instantiated contracts with a given Code Id
// You may pass in the Code Id you noted down earlier to get the list of contracts you instantiated
const contracts = await client.getContracts(55)
console.log(contracts);
// [
//   'wasm1etfpx2smcwualafpld2mn2prnrc3yyed084a083g5p2vcht79n9qck6h55',
//   'wasm1al2jl5kmhume74hdj6lspadmymz4attqpp9xuj6keqdgjwe9xalqlkle2h'
// ]

// Copy the address of your contract from the output above
const contractAddress = "wasm1al2jl5kmhume74hdj6lspadmymz4attqpp9xuj6keqdgjwe9xalqlkle2h"

// Now, invoke the cw20.use() function to start utilizing contract functions 
const mine = cw20.use(contractAddress);

// Note that we haven't instantiated any new contracts. We are using the same contract that was instantiated previously.
mine.balance(addr);
mine.tokenInfo();
mine.minter();
```
Now that we are able to invoke contract functions, let us see what other capabilities a cw20 contract has. 

Since your wallet address was designated as a *minter*, we can try minting tokens for an address. We can also try transferring tokens from our wallet address to other addresses.

```js
// Define the addresses the tokens will be minted or transferred to
const some_address = "wasm1wrvhq03qww59ullrrmshajk3kqts83tqehc7ef";
const another_address = "wasm15e2fadm9lxgz4rtgglvsak3j5ec7uh2epphqd6";

// Check the balances of the addresses before minting or transferring tokens
mine.balance(addr)
mine.balance(some_address)
mine.balance(another_address)
// The total amount of tokens
mine.tokenInfo()

// Minting some tokens for some_address_
mine.mint(addr, some_address, "999888000")
// The output should be the transaction hash, which can be carried over to https://block-explorer.malaga-420.cosmwasm.com/ to observe the details of the transaction
// e.g., "07236649C79D259B8F4CEE81E789F4798D18D14C911F8E77D10474FCFFC0FE71"

// See the updated balances
mine.balance(some_address)
mine.balance(addr)
// Note that the total supply is increased, while the balance of the minter remains the same
mine.tokenInfo()

//Now, let us transfer some tokens instead of minting, before checking the balances again
mine.transfer(addr, another_address, "4567000");
// The output should be another transaction hash, which, again, can be carried over to https://block-explorer.malaga-420.cosmwasm.com/ to observe the details of the transaction
// e.g., "434FF36D79E2D92F0F29E38C478DD75F6829AB0E9EFE274218250E7EC9F7CD4C"

// See the updated balances
mine.balance(another_address)
mine.balance(addr)
//Note that the total supply hasn't changed
mine.tokenInfo()
```
With that, we have covered some of the main capabilities of a cw20 contract and learned how to utilize them.

