---
sidebar_position: 2
---

# Indexes

Indexes are key structures that enables iteration over primary keys using value information.
Here is an example for understanding it.

Let's assume a model: there are multiple tokens in the system, each token has unique owner.
An owner must be related to a token. Tokens must be queryable by owner.

```rust
struct Token {
  pub owner: Addr,
  pub ticker: String
}
```

Tokens can be identified an auto incremented key, and this integer will be used as primary key.
Let's use ticker as key, this will make each token unique.

`(TokenPK) -> Token`

Here is the fun part, owner index:
`(owner, TokenPK) -> TokenPK`

TokenPK points to a Token data, and `owner:TokenPK` key points to `TokenPK`. With two database hits, Token data is
accessible.
Now to retrieve all the tokens an owner manages, we run prefix range like we have shown above.

```rust
pub const TOKENS: Map<U8Key, Token> = Map::new("tokens");
// (owner Address, Token PK) -> u8 key
pub const OWNER_INDEX: Map<(&Addr, U8Key), &[u8]> = Map::new("owner_tokenpk");
```

Now tokens are easily accessible by **owner** information. On every state change to `TOKENS`,
`owner` must be modified accordingly.

## Plus-storage Indexing {#plus-storage-indexing}

Solution above will do the work but not optimal. Too much code complexity and manuel work.
This is where [plus-storage/IndexedMap](https://github.com/CosmWasm/cosmwasm-plus/blob/main/packages/storage-plus/src/indexed_map.rs)
comes in to the play. `IndexedMap` is a storage handler that indexes internally.
Two types of indexes available: [Unique Indexes](#unique-indexes) and [Multi Indexes](#multi-indexes)

### Unique Indexes

Uniqueness of data field in database is a quite common case.
[UniqueIndex](https://github.com/CosmWasm/cosmwasm-plus/blob/v0.7.0/packages/storage-plus/src/indexes.rs) is an
indexing helper for achieving this functionality.

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

// IndexList is just a boiler plate code for fetching structs indexes
impl<'a> IndexList<Token> for TokenIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item = &'_ dyn Index<Token>> + '_> {
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

Now `tokens` are secondary indexed with two values: `owner` and a unique `identifier`.

Here is a test code:

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
  // identifier clashes, must throw error
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();
}
```

Last line will crash with error:

```
called `Result::unwrap()` on an `Err` value: GenericErr { msg: "Violates unique constraint on index" }
thread 'state::test::test_tokens' panicked at 'called `Result::unwrap()` on an `Err` value: GenericErr { msg: "Violates unique constraint on index" }', src/state.rs:197:90
stack backtrace:
```

### Multi Indexes

Composite indexing used when combination of keys needed.
Here is a case from cw721 smart contract:

```rust
pub struct TokenIndexes<'a> {
  // secondary indexed by owner address
  // last U64Key is the primary key which is auto incremented token counter
  pub owner: MultiIndex<'a, (Vec<u8>, Vec<u8>), Token>,
}

// this may become macro, not important just boilerplate, builds the list of indexes for later use
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

We see that the owner index is a MultiIndex. A multi-index can have repeated values as keys.
That's why the primary key added as the last element of the multi-index key.
Like the name implies, this is an index over tokens, by owner. Given that an owner can have multiple tokens,
we need a `MultiIndex` to be able to list / iterate over all the tokens a given owner has.

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
Here tokens`()` is just a helper function, that simplifies the IndexedMap construction for us. First the index(es)
is(are) created, and then, the `IndexedMap` is created (using `IndexedMap::new`), and returned.

During index creation, we must supply an index function per index
```rust
 owner: MultiIndex::new(
     |d, k| (Vec::from(d.owner.as_ref()), k),
```
which is the one that will take the value, and the primary key (always in `Vec<u8>` form) of the original map,
and create the index key from them. Of course, this requires that the elements required for the index key are
present in the value (which makes sense).

Besides the index function, we must also supply the namespace of the pk, and the one for the new index.
```rust
 IndexedMap::new("tokens", indexes)
```

Here of course, the namespace of the pk must match the one used during index(es) creation. And, we pass our
TokenIndexes(as a IndexList-type parameter) as second argument. Connecting in this way the underlying Map for the pk,
with the defined indexes.

o, IndexedMap (and the other Indexed* types) is just a wrapper / extension around Map, that provides a number of index
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
