---
title: Actors in blokchain
---

# Actors in blockchain

Previously we was talking about actors mostly in abstraction of any blockchain
specific terms. However before we would dive into the code, we need to establish
some common language, and to do so we would look at contracts from the perspective
of external user, instead of their implementation.

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
with mapping of address to how much of a token the address posseses. You can query
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

## Contract code

When the contract binary is build, the first interaction with CosmWasm is uploading
it to the blockchain (process is described in detail in
[Getting Started](https://docs.cosmwasm.com/docs/1.0/getting-started/intro) section:

```bash
wasmd tx wasm store contract.wasm --from wallet $TXFLAG
```

As a result of such an operation you would get json output like this:

```json
{
    ..,
    "logs":[
        {
            "events":[
                ..,
                {
                    "type":"store_code",
                    "attributes":[{"key":"code_id","value":"1068"}]
                }]
        }
    ]
}
```

I ignored most of not fields as they are not relevant for now - what we actually
care about is event emitted by blockchain with information about `code_id` of
stored contract - in my case the contract code was stored in blockchain under
id of `1068`. I can now look at the code by querying for it:

```bash
wasmd query wasm code 1068 code.wasm --node $RPC
```

And now the important thing - the contract code is not an actor. As I told
before - the significant part of an actor is its state. Even if a state of
a contract is empty, it should be there. So what is a contract code? I think
that the easiest way to think about that is a `class` or a `type` in programming.
It defines some stuff about what can be done, but the class on itself is
in most cases not very useful, unless we create an instance of a type, on
which we can call class methods. So now let move forward to instances of such
contract-classes.
