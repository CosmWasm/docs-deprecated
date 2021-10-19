---
sidebar_position: 2
---

# Indexes

Indexes are key structures that enable iteration over primary keys using value information. Here is an example for
understanding them.

Let's assume a model: there are multiple tokens in the system, each token has a unique owner. An owner must be related to
a token. Tokens must be queryable by owner.

```rust
struct Token {
  pub owner: Addr,
  pub ticker: String
}
```

Tokens can be identified by an auto incremented key, and this integer will be used as primary key. This will make each
token unique.

`(TokenPK) -> Token`

Here is the fun part, owner index:
`(owner, TokenPK) -> Token`

TokenPK points to a Token data, and `owner:TokenPK` key points to `Token`. With two database hits, Token data is
accessible. Now to retrieve all the tokens an owner manages, we run prefix range like we have shown above.

```rust
pub const TOKENS: Map<U8Key, Token> = Map::new("tokens");
// (owner Address, Token PK) -> u8 key
pub const OWNER_INDEX: Map<(&Addr, U8Key), &[u8]> = Map::new("owner_tokenpk");
```

Now tokens are easily accessible by **owner** information. On every state change to `TOKENS`,
`owner` must be modified accordingly.

## storage-plus indexing {#storage-plus-indexing}

The solution above will work but is not optimal. Too much code complexity and manual work. This is
where [storage-plus/IndexedMap](https://github.com/CosmWasm/cw-plus/blob/main/packages/storage-plus/src/indexed_map.rs)
comes into play. `IndexedMap` is a storage handler that indexes internally. Two types of indexes
are available: [Unique Indexes](#unique-indexes) and [Multi Indexes](#multi-indexes)

### Unique Indexes {#unique-indexes}

Uniqueness of a data field in a database is quite a common need.
[UniqueIndex](https://github.com/CosmWasm/cw-plus/blob/v0.7.0/packages/storage-plus/src/indexes.rs) is an indexing
helper for achieving this functionality.

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Token {
  pub owner: Addr,
  pub ticker: String,
  pub identifier: u8, // <---- unique value
}

// TokenIndexes structs keeps a list of indexers
pub struct TokenIndexes<'a> {
  // token.identifier
  pub identifier: UniqueIndex<'a, U8Key, Token>,
}

// IndexList is just boilerplate code for fetching a struct's indexes
impl<'a> IndexList<Token> for TokenIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item=&'_ dyn Index<Token>> + '_> {
    let v: Vec<&dyn Index<Token>> = vec![&self.identifier];
    Box::new(v.into_iter())
  }
}

// tokens() is the storage access function.
pub fn tokens<'a>() -> IndexedMap<'a, &'a [u8], Token, TokenIndexes<'a>> {
  let indexes = TokenIndexes {
    identifier: UniqueIndex::new(|d| U8Key::new(d.identifier), "token_identifier"),
  };
  IndexedMap::new(TOKEN_NAMESPACE, indexes)
}
```

Let's go over the code step by step:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Token {
  pub owner: Addr,
  pub ticker: String,
  pub identifier: u8, // <---- unique value
}
```

Token has a few values and `identifier` is a unique value the token has.

```rust
// TokenIndexes structs keeps a list of indexers
pub struct TokenIndexes<'a> {
  // token.identifier
  pub identifier: UniqueIndex<'a, U8Key, Token>,
}
```

`TokenIndexes` is a struct for defining indexes of `Token` struct.

```rust
impl<'a> IndexList<Token> for TokenIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item=&'_ dyn Index<Token>> + '_> {
    let v: Vec<&dyn Index<Token>> = vec![&self.identifier];
    Box::new(v.into_iter())
  }
}
```

`IndexList` is an interface for building the indexes.

```rust
pub fn tokens<'a>() -> IndexedMap<'a, &'a [u8], Token, TokenIndexes<'a>> {
  let indexes = TokenIndexes {
    identifier: UniqueIndex::new(|d| U8Key::new(d.identifier), "token_identifier"),
  };
  IndexedMap::new(TOKEN_NAMESPACE, indexes)
}
```

`tokens()` is storage function used to build `IndexedMap`.

```rust
    identifier: UniqueIndex::new( | d| U8Key::new(d.identifier), "token_identifier"),
```

The above code is an index builder function. It builds composite keys with the given function, and accepts a key to identify the
index bucket.

Here is some test code:

```rust
#[test]
fn test_tokens() {
  let mut store = MockStorage::new();

  let owner1 = Addr::unchecked("addr1");
  let ticker1 = "TOKEN1".to_string();
  let token1 = Token {
    owner: owner1.clone(),
    ticker: ticker1,
    identifier: 0,
  };

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();

  let ticker2 = "TOKEN2".to_string();
  let token2 = Token {
    owner: owner1.clone(),
    ticker: ticker2,
    identifier: 0,
  };

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  // identifier clashes, must return error
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();
}
```

The last line will crash with an error:

```
called `Result::unwrap()` on an `Err` value: GenericErr { msg: "Violates unique constraint on index" }
thread 'state::test::test_tokens' panicked at 'called `Result::unwrap()` on an `Err` value: GenericErr { msg: "Violates unique constraint on index" }', src/state.rs:197:90
stack backtrace:
```

### Multi Indexes {#multi-indexes}

Multi indexes are used when the structure is indexed by non-unique values. Here is a case from the `cw721` smart contract:

```rust
pub struct TokenIndexes<'a> {
  // secondary index by owner address
  // the last U64Key is the primary key which is an auto incremented token counter
  pub owner: MultiIndex<'a, (Vec<u8>, Vec<u8>), Token>,
}

// this may become a macro, not important just boilerplate, builds the list of indexes for later use
impl<'a> IndexList<Token> for TokenIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item=&'_ dyn Index<Token>> + '_> {
    let v: Vec<&dyn Index<Token>> = vec![&self.owner];
    Box::new(v.into_iter())
  }
}

const TOKEN_NAMESPACE: &str = "tokens";

pub fn tokens<'a>() -> IndexedMap<'a, &'a [u8], Token, TokenIndexes<'a>> {
  let indexes = TokenIndexes {
    owner: MultiIndex::new(
      |d, k| (index_string(d.owner.as_str()), k),
      TOKEN_NAMESPACE,
      "tokens__owner",
    )
  };
  IndexedMap::new(TOKEN_NAMESPACE, indexes)
}
```

We see that the owner index is a `MultiIndex`. A multi-index can have repeated values as keys. That's why the primary key
is added as the last element of the multi-index key. Like the name implies, this is an index over tokens, by owner. Given
that an owner can have multiple tokens, we need a `MultiIndex` to be able to list / iterate over all the tokens a given
owner has.

The important thing here is that the key (and its components, in the case of a combined key) must implement the
PrimaryKey trait. You can see that both the `2-tuple (_, _)` and `Vec<u8>` do implement PrimaryKey:

```rust
 impl<'a, T: PrimaryKey<'a> + Prefixer<'a>, U: PrimaryKey<'a>> PrimaryKey<'a> for (T, U) {
  type Prefix = T;
  type SubPrefix = ();

  fn key(&self) -> Vec<&[u8]> {
    let mut keys = self.0.key();
    keys.extend(&self.1.key());
    keys
  }
}
```

```rust
 pub fn tokens<'a>() -> IndexedMap<'a, &'a str, TokenInfo, TokenIndexes<'a>> {
  let indexes = TokenIndexes {
    owner: MultiIndex::new(
      |d, k| (Vec::from(d.owner.as_ref()), k),
      "tokens",
      "tokens__owner",
    ),
  };
  IndexedMap::new("tokens", indexes)
}
```

During index creation, we must supply an index function per index.

```rust
 owner: MultiIndex::new(|d, k| (Vec::from(d.owner.as_ref()), k),
```

which is the one that will take the value, and the primary key (always in `Vec<u8>` form) of the original map, and
create the index key from them. Of course, this mandates that the elements required for the index key are present in the
value (which makes sense).

Besides the index function, we must also supply the namespace of the pk, and the one for the new index.

```rust
 IndexedMap::new("tokens", indexes)
```

Here of course, the namespace of the pk must match the one used during index(es) creation. And we pass our
TokenIndexes (as a IndexList-type parameter) as second argument, connecting in this way the underlying Map with the pk,
with the defined indexes.

IndexedMap (and the other Indexed* types) is just a wrapper / extension around Map, that provides a number of index
functions and namespaces to create indexes over the original Map data. It also implements calling these index functions
during value storage / modification / removal, so that you can forget about it and just use the indexed data.

Here is a code example on using indexes:

```rust
#[test]
fn test_tokens() {
  let mut store = MockStorage::new();

  let owner1 = Addr::unchecked("addr1");
  let ticker1 = "TOKEN1".to_string();
  let token1 = Token {
    owner: owner1.clone(),
    ticker: ticker1,
  };

  let ticker2 = "TOKEN2".to_string();
  let token2 = Token {
    owner: owner1.clone(),
    ticker: ticker2,
  };

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();

  // want to load token using owner1 and ticker1
  let list: Vec<_> = tokens()
    .idx.owner
    .prefix(index_string(owner1.as_str()))
    .range(&store, None, None, Order::Ascending)
    .collect::<StdResult<_>>().unwrap();
  let (_, t) = &list[0];
  assert_eq!(t, &token1);
  assert_eq!(2, list.len());
}
```

### Composite Multi Indexing {#composite-multi-indexing}

Imagine the following situation:
we have a number of batches, each stored by its (numeric) batch id, that can change
after which they must be automatically promoted. Now imagine that we want to process all the pending batches at any
status from **Pending** to **Promoted**, depending on interactions over them. The batches also have an associated
expiration, given time. Of course, we are only interested in the pending ones that have already expired (so that we can promote
them). So, we can build an index over the batches, with a composite key composed of the batch status, and their
expiration timestamp. Using the composite key, we'll be discarding both, the already promoted batches, and the pending
but not yet expired ones.

So, we build the index, generate the composite key, and iterate over all pending batches that
have an expiration timestamp that is less than the current time.

Here's a code example on how to do this:

Batch struct:

```rust
/// A Batch is a group of members who got voted in together. We need this to
/// calculate moving from *Paid, Pending Voter* to *Voter*
#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
pub struct Batch {
  /// Timestamp (seconds) when all members are no longer pending
  pub grace_ends_at: u64,
  /// How many must still pay in their escrow before the batch is early authorized
  pub waiting_escrow: u32,
  /// All paid members promoted. We do this once when grace ends or waiting escrow hits 0.
  /// Store this one done so we don't loop through that anymore.
  pub batch_promoted: bool,
  /// List of all members that are part of this batch (look up ESCROWS with these keys)
  pub members: Vec<Addr>,
}
```

`IndexedMap` definitions:

```rust
// We need a secondary index for batches, such that we can look up batches that have
// not been promoted, ordered by expiration (ascending) from now.
// Index: (U8Key/bool: batch_promoted, U64Key: grace_ends_at) -> U64Key: pk
pub struct BatchIndexes<'a> {
  pub promotion_time: MultiIndex<'a, (U8Key, U64Key, U64Key), Batch>,
}

impl<'a> IndexList<Batch> for BatchIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item=&'_ dyn Index<Batch>> + '_> {
    let v: Vec<&dyn Index<Batch>> = vec![&self.promotion_time];
    Box::new(v.into_iter())
  }
}

pub fn batches<'a>() -> IndexedMap<'a, U64Key, Batch, BatchIndexes<'a>> {
  let indexes = BatchIndexes {
    promotion_time: MultiIndex::new(
      |b: &Batch, pk: Vec<u8>| {
        let promoted = if b.batch_promoted { 1u8 } else { 0u8 };
        (promoted.into(), b.grace_ends_at.into(), pk.into())
      },
      "batch",
      "batch__promotion",
    ),
  };
  IndexedMap::new("batch", indexes)
}
```

This example is similar to the previous one, above. The only differences are:

The composite key now has three elements: the batch status, the expiration timestamp, and the batch id (which is the
primary key for the Batch data). We're using a U64Key for the batch id / pk. This is just for convenience. We could as
well have used a plain `Vec<u8>` for it.

Now, here's how to use the indexed data:

```rust
let batch_map = batches();

// Limit to batches that have not yet been promoted (0), using sub_prefix.
// Iterate which have expired at or less than the current time (now), using a bound.
// These are all eligible for timeout-based promotion
let now = block.time.nanos() / 1_000_000_000;
// as we want to keep the last item (pk) unbounded, we increment time by 1 and use exclusive (below the next tick)
let max_key = (U64Key::from(now + 1), U64Key::from(0)).joined_key();
let bound = Bound::Exclusive(max_key);

let ready = batch_map
              .idx
              .promotion_time
              .sub_prefix(0u8.into())
              .range(storage, None, Some(bound), Order::Ascending)
              .collect::<StdResult<Vec<_ >>>() ?;
```

A couple of comments:

- `joined_key()` is being used to create the range key. This helper function transforms the (partial) composite key
  composed of batch expiration timestamp and batch id, into a `Vec<u8>` with the proper format. That is then used to
  create a range bound.
- `sub_prefix()` is used to fix the first element of the composite key (the batch status). This is required, because
  `prefix()` in this case (a 3-tuple), implies fixing the first two elements of the key, and we don't want / need that
  here.
- The iteration proceeds from None to the bound key created from the current timestamp. So that we effectively list only
  the still pending but already expired batches.

That's it. After that, we can iterate over the results and change their status from `Pending` to `Promoted`, or whatever we
need to do.
