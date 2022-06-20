---
sidebar_position: 2
---

# DAO Smart Contract

DAOs are social constructs that consist of more than one entity. Collecting your friends' and colleagues' blockchain addresses to form a DAO for this section would be ideal. If that's not possible, we'll generate several new keys to emulate the participation of different parties for this section.  

## Environment Setup

Open up two Terminal windows. The first one will be reserved for DAO admin actions; and the other window will contain 4 tabs, one for each DAO member.

On each of the 4 tabs of Terminal window #2, initialize a CosmJS CLI session and run the following commands to create 4 unique wallet addresses to act as DAO members:

```shell
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw3-flex-multisig.ts
```
```typescript
# Tab 1
const [addr, client] = await useOptions(malagaOptions).setup('password', '.account1.key');
console.log(addr);
```
```typescript
# Tab 2
const [addr, client] = await useOptions(malagaOptions).setup('password', '.account2.key');
console.log(addr);
```
```typescript
# Tab 3
const [addr, client] = await useOptions(malagaOptions).setup('password', '.account3.key');
console.log(addr);
```
```typescript
# Tab 4
const [addr, client] = await useOptions(malagaOptions).setup('password', '.account4.key');
console.log(addr);
```
Copy and note the wallet addresses down.

## Architecture

We will use `cw4-group` and `cw3-flex-multisig` contracts for the DAO. The advantage of having two separate governance contracts is the provided flexibility. The `cw4-group` contract contains member details, while the `cw3-flex-multisig` contract contains the cw4-group address, the voting threshold and the voting period. With this architecture, one group can have multiple multisig accounts with different voting parameters.
## cw4-group Setup

On the first Terminal window, let us set up a wallet address to act as the group administrator and launch the DAO with the 4 member addresses generated earlier.

Initialize the CosmJS CLI session:

```shell
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw4-group.ts
```

Now set up a wallet address before deploying and instantiating the cw4-group contract:

```typescript
const [addr, client] = await useOptions(malagaOptions).setup('password', '.main.key');
const contract = CW4Group(client, malagaOptions);
const codeId = await contract.upload(addr, malagaOptions);
console.log(codeId);

//Preparing the instantiation message, make sure to 
//replace the member addresses with the ones generated earlier for each member
.editor

const initMsg = {
    admin: addr,
    members: [
        {
            addr: "Member Address #1",
            weight: 10, // weight is the voting power an address has
        },
        {
            addr: "Member Address #2",
            weight: 10,
        },
        {
            addr: "Member Address #3",
            weight: 10,
        },
        {
            addr: "Member Address #4",
            weight: 10,
        },
    ]
};
//Exit editor using `^D` to execute the code entered
^D

const instance = await contract.instantiate(addr, codeId, initMsg, 'Council', malagaOptions);
```

```shell
>> instance
```
```js
{
  contractAddress: 'wasm1vguuxez2h5ekltfj9gjd62fs5k4rl2zy5hfrncasykzw08rezpfskn7x0n',
  admin: [AsyncFunction: admin],
  totalWeight: [AsyncFunction: totalWeight],
  member: [AsyncFunction: member],
  listMembers: [AsyncFunction: listMembers],
  hooks: [AsyncFunction: hooks],
  updateAdmin: [AsyncFunction: updateAdmin],
  updateMembers: [AsyncFunction: updateMembers],
  _addHook: [AsyncFunction: _addHook],
  _removeHook: [AsyncFunction: _removeHook]
}
```

Copy and save the `contractAddress` and the `codeId`.

## cw3-flex-multisig Setup

Now switch back to the second Terminal window and on the first tab run the following commands to set up and instantiate the `cw3-flex-multisig` contract:

```typescript
const contract = CW3Flex(client, malagaOptions);
const codeId = await contract.upload(addr, malagaOptions);
console.log(codeId);

.editor
//The property "group_addr" holds the address of the cw4-group contract that was instantiated earlier
//Make sure to replace the group address with address of the cw4-group contract instance
//Make sure to replace the member addresses with the ones generated earlier for each member

const initMsg = {
    group_addr: "wasm1vguuxez2h5ekltfj9gjd62fs5k4rl2zy5hfrncasykzw08rezpfskn7x0n",
    threshold: { absolute_percentage: { percentage: "0.5" }},
    max_voting_period: {time: 300},
    members: [
        {
            addr: "Member Address #1",
            weight: 10, // weight is the voting power an address has
        },
        {
            addr: "Member Address #2",
            weight: 10,
        },
        {
            addr: "Member Address #3",
            weight: 10,
        },
        {
            addr: "Member Address #4",
            weight: 10,
        },
    ]
};
//Exit editor using `^D` to execute the code entered
^D

const instance = await contract.instantiate(addr, codeId, initMsg, 'Council Flex Multisig', malagaOptions);
```

`threshold` sets the total percentage of the votes that is required for a proposal to pass. There are [options](https://docs.rs/cw-utils/0.12.1/cw_utils/enum.Threshold.html) other than `absolute_percentage` in the contract for threshold type.

`max_voting_period` defines the default voting period for a proposal in terms of time or block-height. The value was set to 300 seconds in this case for practical purposes.

```shell
>> instance
{
  contractAddress: 'wasm1vhndln95yd7rngslzvf6sax6axcshkxqpmpr886ntelh28p9ghuq0rxlxs',
  threshold: [AsyncFunction: threshold],
  proposal: [AsyncFunction: proposal],
  query_vote: [AsyncFunction: query_vote],
  listProposals: [AsyncFunction: listProposals],
  reverseProposals: [AsyncFunction: reverseProposals],
  voter: [AsyncFunction: voter],
  listVoters: [AsyncFunction: listVoters],
  listVotes: [AsyncFunction: listVotes],
  propose: [AsyncFunction: propose],
  vote: [AsyncFunction: vote],
  execute: [AsyncFunction: execute],
  close: [AsyncFunction: close],
  _memberChangedHook: [AsyncFunction: _memberChangedHook]
}
```

Copy and save the cw3-flex-multisig `contractAddress`. We will utilize the `propose()` function of this contract instance later on.

Notice that the contract was instantiated on the Terminal window tab for the first member. Now let us prepare the other three member tabs to interact with the cw3-flex-multisig instance.

Run the following commands on each of the other three member tabs to define and use the `cw3-flex-multisig` contract instance.

```typescript
// Make sure to replace the cw3-flex-multisig contract address with the one you copied earlier
const contractAddress = "wasm1vhndln95yd7rngslzvf6sax6axcshkxqpmpr886ntelh28p9ghuq0rxlxs";
const contract = CW3Flex(client, malagaOptions);
const instance = contract.use(contractAddress);
```
## Govern other Smart Contracts

In the [Smart Contract Interaction](../develop-smart-contract/01-intro.md) section, we've learned how to set up and interact with a `cw20-base` contract instance. 

Remember that the `minter` of a cw20 contract is the address that is privileged to mint/create new tokens on the contract.
As you no doubt will agree, a single user having the ability to mint an unlimited number of tokens is neither secure nor reasonable.
Only multiple parties and organizations should be allowed to run mint operations and this is where setting up DAOs as smart contract administrators comes into play.

Let us open up a third Terminal window and set up a cw20 contract that grants our cw3-flex-multisig contract instance minter privileges.

```shell
npx @cosmjs/cli@^0.28.1 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts
```
```typescript

const [addr, client] = await useOptions(malagaOptions).setup("password",".cw20.key");
const cw20 = CW20(client, malagaOptions);
const codeId = await cw20.upload(addr, malagaOptions);
console.log(codeId);

.editor
//Define the cw20 instantiation message parameters
const initMsg = {
  name: "Tokens",
  symbol: "TKN",
  decimals: 2,
  // No initial balances
  initial_balances: [],
  //cw3-flex-multisig contract address has the minting rights
  mint: {
    minter: "wasm1vhndln95yd7rngslzvf6sax6axcshkxqpmpr886ntelh28p9ghuq0rxlxs"
  },
};

//Exit editor using `^D` to execute the code entered
^D

const contract = await cw20.instantiate(addr, codeId, initMsg, "TKN", malagaOptions);
console.log(contract);
```
```js
{
  contractAddress: 'wasm13we0myxwzlpx8l5ark8elw5gj5d59dl6cjkzmt80c5q5cv5rt54qhmta7s',
  balance: [AsyncFunction: balance],
  allowance: [AsyncFunction: allowance],
  allAllowances: [AsyncFunction: allAllowances],
  allAccounts: [AsyncFunction: allAccounts],
  tokenInfo: [AsyncFunction: tokenInfo],
  minter: [AsyncFunction: minter],
  mint: [AsyncFunction: mint],
  transfer: [AsyncFunction: transfer],
  burn: [AsyncFunction: burn],
  increaseAllowance: [AsyncFunction: increaseAllowance],
  decreaseAllowance: [AsyncFunction: decreaseAllowance],
  transferFrom: [AsyncFunction: transferFrom],
  send: [AsyncFunction: send],
  sendFrom: [AsyncFunction: sendFrom]
}
```
```typescript
console.log(await contract.minter())
```
```js
{
  minter: 'wasm1vhndln95yd7rngslzvf6sax6axcshkxqpmpr886ntelh28p9ghuq0rxlxs',
  cap: null
}
```
We have successfully instantiated a cw20 contract with the `cw3-flex-multisig` contract instance assigned as the minter.
## Propose

Now we will set up a proposal on the `cw3-flex-multisig` contract to mint 9999 TKNs to a random address. 
Switch to the first tab of the second terminal window (i.e., the tab for the first member of the cw3-flex-multisig contract.

Let us specify the proposal details first. Notice the contract address in the `msgs` points to our cw20 contract instance and the message inside is the base64 encoded version of the following cw20 `mint{}` message:

```typescript
{"mint":{"recipient":"wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp","amount":"9999"}}
```

```typescript
.editor

let title = "Mint tokens"
let description = "Mint 9999 tokens to address wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp";
let msgs = [
  {
    wasm: {
      execute: {
        contract_addr: "wasm13we0myxwzlpx8l5ark8elw5gj5d59dl6cjkzmt80c5q5cv5rt54qhmta7s",
        msg: "eyJtaW50Ijp7InJlY2lwaWVudCI6Indhc20xdzc0MGg1Nmo5bmh1ZHlra204MGo1cmY2bXMyNW5oZTlodXV2Z3AiLCJhbW91bnQiOiI5OTk5In19Cg==",
        funds: []
      }
    }
  }];

//Exit editor using `^D` to execute the code entered
^D
```

Now that the proposal contents are set up, we can submit the proposal.
```typescript
const fee = calculateFee(malagaOptions.fees.exec, malagaOptions.gasPrice)
const result = await client.execute(addr, instance.contractAddress, { propose: {title, description, msgs}}, fee)

instance.listProposals()
```
```json
{
  proposals: [
    {
      id: 1,
      title: 'Mint tokens',
      description: 'Mint 9999 tokens to address wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp',
      msgs: [Array],
      status: 'open',
      expires: [Object],
      threshold: [Object]
    }
  ]
}
```
The proposal is created and is open for voting. Remember that the threshold for our cw3-flex-multisig contract instance was set to 50% meaning that only 2 of the 4 members should vote 'Yes' for the proposal to pass. The act of creating a proposal already counts a `Yes` vote, so the proposal only needs another `Yes` vote to pass.

Let us switch to the tab for the second member of the cw3-flex-multisig contract and cast a `Yes` vote on the proposal.

```typescript
let proposalId = 1
instance.vote(addr, proposalId, "yes")
```

Checking the list of proposals again, the proposal status should've been updated as follows:
```typescript
instance.listProposals()
```
```json
{
  proposals: [
    {
      id: 1,
      title: 'Mint tokens',
      description: 'Mint 9999 tokens to address wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp',
      msgs: [Array],
      status: 'passed',
      expires: [Object],
      threshold: [Object]
    }
  ]
}
```
The proposal has passed, and is ready for execution. You may execute the action on any one of the member tabs at this point.

```typescript
instance.execute(addr, proposalId)
```

Now, let us switch to the cw20 terminal window and check the balance of the address that the tokens were minted to:

```typescript
contract.balance("wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp")
```
The result should be as follows:
```js
'9999'
```
## Summary
With that, we have successfully formed a DAO that is in control of a cw20 contract; before setting up, voting for and executing a proposal to mint tokens to a random address. 

Throughout this brief entry to the CosmWasm DAO and Governance smart contracts, we've only covered a small portion of the functionalities of cw3 and cw4 DAO contracts. It is highly recommended that you go ahead and explore the related [cw-plus](https://github.com/CosmWasm/cw-plus/tree/main/contracts) repository to learn more about their capabilities.

## Challenge
As a challenge, you can create other instances of governance contracts and experiment on new proposals to explore different threshold parameters.