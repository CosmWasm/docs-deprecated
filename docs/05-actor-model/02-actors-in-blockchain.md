---
title: Actors in blokchain
---

# Actors in blockchain

Previously we was talking about actors mostly in abstraction of any blockchain
specific terms. However before we would dive into the code, we need to establish
some common language, and to do so we would look at contracts from the perspective
of external user, instead of their implementation.

In this part I would use the `wasmd` binary to communicate with cliffnet testnet.
To properly set it up, check the
[Setting up Environment](https://docs.cosmwasm.com/docs/1.0/getting-started/setting-env).

## Blockchain as database

It is kind of starting from the end, but I would start about the state part of actor
model. Relating to traditional systems, there is one particular thing I like to compare
blockchain to - it is a database.

Going back to previous section we learned, that the most important part of
contract is its state. Manipulating the state is the only way to persistently
manifest work performed to the world. But What is the thing which purpose is to
keep the state? It is Database!

So here is my (as contract developer) point of view on contracts: it is distributed
database, with some magical mechanisms to make it democratic. Obviously those "magical
mechanisms" are crucial for BC existence and they make they are reasons why to even
use blockchain, but they are not relevant from contract creator point of view -
for us, everything matters is the state.

But you can say: what about financial part?! Isn't blockchain (wasmd in particular)
basically the currency implementation? All of those gas costs, sending funds seems
very much like money transfer, not database updates. And yes, you are kind of right,
but I have a solution for that too. Just imagine, that for every native token (by
"native tokens" we meant tokens handled directly by blockchain, in contradiction
to for example cw20 tokens) there is special database bucket (or table if you prefer)
with mapping of address to how much of a token the address possess. You can query
this table (querying for token balance), but you cannot modify it directly. To modify
it you just send message to special build-in bank contract. And everything is still
a database.

But if blockchain is a database, then where smart contracts are stored?
Obviously - in the database itself! So now imagine another special table - this
one would contain single table of code-ids mapped to blobs of wasm binaries. And
again - to operate on this table, you use "special contract" which is not accessible
from another contract, but you can use it via wasmd binary.

Now there is a question - why do I even care about BC being a DB? So the reason is
that it makes reasoning about everything in blockchain very natural. Do you
remember, that every message in actor model is transactional? It perfectly matches
to traditional database transactions (meaning: every message starts new transaction)!
Also when we would later talk about migrations, it would turn out, tha
migrations in CosmWasm are very much equivalents of schema migrations in
traditional databases.

So thing to remember - blokchain is very similar to database, having some special
reserved tables (like native tokens, code repository), with special bucket created
for every contract. Contract can look at every table in every bucket in whole
blokchain, but it can modify the only one he created.

## Compile the contract

I will not go into the code for now, but to start with something we need compiled
contract binary. The `cw4-group` contract from
[cw-plus](https://github.com/CosmWasm/cw-plus) is simple enough to work with for
now, so we will start with compiling it. Start with cloning the repository:

```bash
$ git clone git@github.com:CosmWasm/cw-plus.git
```

Then go to `cw4-group` contract and build it:

```bash
$ cd cw-plus/contracts/cw4-group
$ cargo wasm
```

Your final binary should be located in the
`cw-plus/target/wasm32-unknown-unknown/release` folder (`cw-plus` being where you
cloned your repository.

## Contract code

When the contract binary is build, the first interaction with CosmWasm is uploading
it to the blockchain (assuming you have your wasm binary in working directory):

```bash
$ wasmd tx wasm store ./cw4-group.wasm --from wallet $TXFLAG -y
```

As a result of such an operation you would get json output like this:

```
..
logs:
- events:
  ..
  - attributes:
    - key: code_id
      value: "1069"
    type: store_code
```

I ignored most of not fields as they are not relevant for now - what we actually
care about is event emitted by blockchain with information about `code_id` of
stored contract - in my case the contract code was stored in blockchain under
id of `1069`. I can now look at the code by querying for it:

```bash
$ wasmd query wasm code 1069 code.wasm
```

And now the important thing - the contract code is not an actor. So what is a
contract code? I think that the easiest way to think about that is a `class` or
a `type` in programming. It defines some stuff about what can be done, but the
class on itself is in most cases not very useful, unless we create an instance
of a type, on which we can call class methods. So now let move forward to
instances of such contract-classes.

## Contract instance

Now we have contract code, but what we want is an actual contract itself.
To create it, we need to instantiate it. Continuing analogy to programming,
instantiation is calling a constructor. To do that, I would send an
instantiate message to my contract:

```bash
$ wasmd tx wasm instantiate 1069 '{"members": []}' --from wallet --label "Group 1" --no-admin $TXFLAG -y
```

What I do here is creating a new contract and immediately calling the
`Instantiate` message on it. The structure of such message is different for
every contract code. In particular, the `cw4-group` Instantiate message
contains two fields:

* `members` field which is list if initial group members
* optional `admin` field which defines an address who can add or remove
  group member

In this case, I created an empty group with no admin - so which could never
change! It may seems like not very useful contract, but it serves us as
a contract example.

As the result of instantiate I got json:

```
..
logs:
- events:
  ..
  - attributes:
    - key: _contract_address
      value: wasm1u0grxl65reu6spujnf20ngcpz3jvjfsp5rs7lkavud3rhppnyhmqqnkcx6
    - key: code_id
      value: "1069"
    type: instantiate
```

As you can see we again look at `logs[].events[]` field, looking for
interesting event and extracting information from it - it is the common case.
I will talk about events and their attributes in the future, but in general
it is a way to notify the world that something happened. Do you remember the
KFC example? If waiter is serving our dish, he would put tray on the bar,
and she would yell (or put on the screen) the order number - this would be
announcing an event, so you know some summary of operation, so you can go and
do something useful with it.

So what useful can we do with contract? We obviously can call it! But first
I want to tell about addresses.

## Addresses in CosmWasm

Address in CosmWasm are way to refer entities in blockchain. There are two
types of addresses: contract addresses, and non-contracts. The difference is,
that you can send messages to contract addresses, as there is some smart contract
code associated to them, and non-contract are just users of the system. In actor
model, contract addresses represents actors, and non-contracts represents clients
of the system.

When operating with blockchain using `wasmd`, you also have an address - you
got one when you added the key to wasmd:

```bash
# add wallets for testing
$ wasmd keys add wallet
- name: wallet3
  type: local
  address: wasm1dk6sq0786m6ayg9kd0ylgugykxe0n6h0ts7d8t
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"Ap5zuScYVRr5Clz7QLzu0CJNTg07+7GdAAh3uwgdig2X"}'
  mnemonic: ""
```

You can always check your address:

```bash
$ wasmd keys show walle
- name: wallet
  type: local
  address: wasm1um59mldkdj8ayl5gknp9pnrdlw33v40sh5l4nx
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A5bBdhYS/4qouAfLUH9h9+ndRJKvK0co31w4lS4p5cTE"}'
  mnemonic: ""
t
```

Having an address is very important, because it is preretirement to being able
to call anything. When we send a message to a contract it always knows an address
who send this message so it can identify it - not to mention, that this sender
is an address which would play a gas cost.

## Querying the contract

So we have our contract, let try to do something with it - query would be the
easiest thing to do. Let's do it:

```bash
$ wasmd query wasm contract-state smart wasm1u0grxl65reu6spujnf20ngcpz3jvjfsp5rs7lkavud3rhppnyhmqqnkcx6 '{ "list_members": {} }'
data:
  members: []
```

The `wasm...` string is contract address, and you have to substitute it with
your contract address. `{ "list_members": {} }` is query message we send to
contract. Typically CW smart contract queries are in the form of single json
object, with one field: the query name (`list_members` in our case). The value
of this field is another object, being query parameters - if there are any.
`list_members` query handles two parameters: `limit`, and `start_after`, which
are both optional and which supports result pagination. However in our case of
empty group they doesn't matter.

The query result we got is in human readable text form (if we want to get the
json from - for eg to process it further with jq, just pass the `-o json` flag).
As you can see response contains one field: `members` which is an empty array.

So can we do anything more with this contract? Not much. But let try to do
something with new one!

## Executions to perform some actions

The problem with our previous contract is, that for `cw4-group` contract, the
only one who can perform executions on it, is an admin, but our contract
doesn't have one. So let make new group contract, but let make us an admin.
First check our wallet address:

```bash
$ wasmd keys show wallet
```
