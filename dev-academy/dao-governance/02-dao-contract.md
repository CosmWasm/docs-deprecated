---
sidebar_position: 2
---

# DAO Smart Contract

DAOs are social constructs that consist of more than one entity. Ideally, collect your friends' and colleagues' blockchain addresses for this course. Or set up several keys like we will do right now.

## Environment Setup

Spin two terminal tabs, one should contain a single pane, DAO admin. Another tab will contain 4 panes, these are
the members. We will use `CosmJS/cli` helpers.

## Architecture

We will use `cw4-group` and `cw3-flex-multisig` contracts for the DAO. The advantage of having two separate contracts is
flexibility. `cw4-group` contains members' information. `cw3-flex-multisig` contains cw4 group address, voting
threshold, and voting_period. With this architecture, one group can have multiple multisig accounts with different
parameters.

## cw4-group Setup

On the first terminal, let us start setting up a wallet and launch the DAO.

Launch CosmJS client:

```shell
npx @cosmjs/cli@^0.26 --init https://raw.githubusercontent.com/CosmWasm/cw-plus/master/contracts/cw4-group/helpers.ts
```

Now store and instantiate the contract:

```typescript
const [addr, client] = await useOptions(pebblenetOptions).setup('password', '.main.key');
const contract = CW4Group(client, pebblenetOptions.fees);
const codeId = await contract.upload(addr);

// .editor
const initMsg = {
    admin: addr,
    members: [
        {
            addr: "wasm19pxmaaq8v6zgs5umtz8eqtpwcfgdj2nlhqhff3",
            weight: 10, // weight is the voting power an address has
        },
        {
            addr: "wasm1zmtuez3qsquumcsn0tlees2mcpjfr4360vg63y",
            weight: 10,
        },
        {
            addr: "wasm16ycd7qpmdr0p7lj7x2peah8q8yjzfdt7zcmmy3",
            weight: 10,
        },
        {
            addr: "wasm1qzzafwky7hjzkaa7r9ldv2urdjn8333v8scwdn",
            weight: 10,
        },
    ]
};
// ^D

const instance = await contract.instantiate(addr, codeId, initMsg, 'Council');
```

```shell
>> instance
{
  contractAddress: 'wasm1p9c7e9hutpnlsk6twhwc3ehlx3fp00fusk9e8c',
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

Copy and save `contractAddress` and `codeId`.

## cw3-flex-multisig Setup

Now go to the second tab. And on the first tab run these commands:

```shell
npx @cosmjs/cli@^0.26 --init https://raw.githubusercontent.com/CosmWasm/cw-plus/cw3-helper/contracts/cw3-flex-multisig/helpers.ts
```

```typescript
const [addr, client] = await useOptions(pebblenetOptions).setup('password', '.account4.key');
const contract = CW3Flex(client, pebblenetOptions.fees);
const codeId = <CODE_ID_HERE>

// .editor
const initMsg = {
    group_addr: "wasm1p9c7e9hutpnlsk6twhwc3ehlx3fp00fusk9e8c",
    threshold: { absolute_percentage: { percentage: "0.5" }},
    max_voting_period: {time: 300},
    members: [
        {
            addr: "wasm19pxmaaq8v6zgs5umtz8eqtpwcfgdj2nlhqhff3",
            weight: 10, // weight is the voting power an address has
        },
        {
            addr: "wasm1zmtuez3qsquumcsn0tlees2mcpjfr4360vg63y",
            weight: 10,
        },
        {
            addr: "wasm16ycd7qpmdr0p7lj7x2peah8q8yjzfdt7zcmmy3",
            weight: 10,
        },
        {
            addr: "wasm1qzzafwky7hjzkaa7r9ldv2urdjn8333v8scwdn",
            weight: 10,
        },
    ]
};
// ^D

const instance = await contract.instantiate(addr, codeId, initMsg, 'Council Flex Multisig');
```

`threshold` sets the total percentage of the vote that is required for a proposal to pass. There are more options in the
contract for threshold value, not only `absolute_percentage`. Go check it out.
`max_voting_period` is the total voting period. I set it up 300 for setting this up fast.

```shell
>> instance
{
  contractAddress: 'wasm10j4xn72f29v56wt9xd9dg2fgv5y8qjttrcl0mp',
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

Copy the `contractAddress`. As you can see in the available command list, we will propose using this client.

For the other users, you don't need to instantiate a contract. We will use the one created above.

Other tabs:

```typescript
const [addr, client] = await useOptions(pebblenetOptions).setup('password', '.account1.key');
const contractAddress = "wasm10j4xn72f29v56wt9xd9dg2fgv5y8qjttrcl0mp"

const instance = contract.use(contractAddress);
```

Repeat the same for the other tabs, but remember to change `.account1.key` part. This is the key to the wallet.

## Govern Smart Contracts

In the [smart contract interaction](../develop-smart-contract/01-intro.md) section, we learned to set up and interacting with
`cw20-base` contract.
Do you
remember the `minter` field in instantiate message?

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

Minter is the address that is privileged to mint/create new tokens in the system.
As you guessed, a simple user having the ability to mint billions of dollars worth of tokens is not secure or reasonable.
Multiple parties and organizations should be allowed to run mint operations.
This is where the magic is: use DAO addresses as contract admin.

I will skip cw20 setup phase.

## Propose

Now we will set up a proposal to mint 9999 tokens to an address.
Go the tab 2 pane 1, to cw3-flex-multisig terminal.

First, specify proposal details. Notice `msg` is a base64 encoded cw20 mint msg.

```typescript
// .editor
let title = "Mint tokens"
let description = "Mint 9999 tokens to address wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp";
let msg4 = [
  {
    wasm: {
      execute: {
        contract_addr: "wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp",
        msg: "eyJtaW50Ijp7InJlY2lwaWVudCI6Indhc20xdzc0MGg1Nmo5bmh1ZHlra204MGo1cmY2bXMyNW5oZTlodXV2Z3AiLCJhbW91bnQiOiI5OTk5In19Cg==",
        funds: []
      }
    }
  }];
```

```typescript
instance.propose(addr, title, description, msg4)
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

Now the proposal is created. Let's start voting:

```typescript
let proposalId = 1
instance.vote(addr, proposalId, "yes")
```

Since the threshold is **%50**, only half of the voters required to vote yes for proposal to pass.

Check proposal again:

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

Proposal has passed, and it is ready for execution. Execute the action:

```typescript
instance.execute(addr, proposalId)
```

Now go to cw20 terminal pane and check the bank balance of the empty cw20 address that you minted tokens to:

```typescript
>> contract.balance("wasm1w740h56j9nhudykkm80j5rf6ms25nhe9huuvgp")
'9999'
```

## Challenge

As a challenge, you can explore other threshold parameters, setup several smart contracts and see what changes?

## Summary

Congrats! Welcome to the decentralized democracy.

We have given a brief entry to the CosmWasm DAO and Governance smart contracts. We only covered a small portion of
functionalities of cw3 and cw4 DAO contracts, I encourage you to go ahead and explore the code to learn more about
capabilities.

