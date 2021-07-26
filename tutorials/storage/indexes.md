---
sidebar_position: 2
---

# Indexes

Indexes are key structures that enables iteration over primary keys using value information.
Here is an example for understanding it.

Let's assume a model: there are multiple tokens in the system, each token has unique admin.
An admin must be related to a token. Tokens must be queryable by admin.

```rust
struct Token {
  pub admin: Addr,
  pub ticker: String
}
```

Tokens can be identified an auto incremented key, and this integer will be used as primary key.
Let's use ticker as key, this will make each token unique.

`(TokenPK) -> Token`

Here is the fun part, admin index:
`(admin, TokenPK) -> TokenPK`

TokenPK points to a Token data, and `admin:TokenPK` key points to `TokenPK`. With two database hits, Token data is
accessible.
Now to retrieve all the tokens an admin manages, we run prefix range like we have shown above.

```rust
pub const TOKENS: Map<U8Key, Token> = Map::new("tokens");
// (Admin Address, Token PK) -> u8 key
pub const ADMIN_INDEX: Map<(&Addr, U8Key), &[u8]> = Map::new("admin_tokenpk");
```

Now tokens are easily accessible by **admin** information. On every state change to `TOKENS`,
`ADMIN` must be modified accordingly.

## Plus-storage Indexing

Solution above would work but not beautiful...
This is where [plus-storage/IndexedMap](https://github.com/CosmWasm/cosmwasm-plus/blob/main/packages/storage-plus/src/indexed_map.rs)
comes in to the play. `IndexedMap` is a storage handler that indexes internally. Code below contains indexing code,
also some boilerplate.

### Composite Indexes

```rust
pub struct TokenIndexes<'a> {
  // secondary indexed by admin address
  // last U64Key is the primary key which is auto incremented token counter
  pub admin: MultiIndex<'a, (Vec<u8>, Vec<u8>), Token>,
}

// this may become macro, not important just boilerplate, builds the list of indexes for later use
impl<'a> IndexList<Token> for TokenIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item = &'_ dyn Index<Token>> + '_> {
    let v: Vec<&dyn Index<Token>> = vec![&self.admin];
    Box::new(v.into_iter())
  }
}

const TOKEN_NAMESPACE: &str = "tokens";

pub fn tokens<'a>() -> IndexedMap<'a, &'a [u8], Token, TokenIndexes<'a>> {
  let indexes = TokenIndexes {
    admin: MultiIndex::new(
      |d, k| (index_string(d.admin.as_str()), k),
      TOKEN_NAMESPACE,
      "tokens__admin",
    )
  };
  IndexedMap::new(TOKEN_NAMESPACE, indexes)
}
```

Now `tokens` will index admin internally. On `token.admin` updates index will be updated too.

Here is a code example on using indexes:

```rust
#[test]
fn test_tokens() {
  let mut store = MockStorage::new();

  let admin1 = Addr::unchecked("addr1");
  let ticker1 = "TOKEN1".to_string();
  let token1 = Token {
    admin: admin1.clone(),
    ticker: ticker1,
  };

  let ticker2 = "TOKEN2".to_string();
  let token2 = Token {
    admin: admin1.clone(),
    ticker: ticker2,
  };

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();

  // want to load token using admin1 and ticker1
  let list: Vec<_> = tokens()
    .idx.admin
    .prefix(index_string(admin1.as_str()))
    .range(&store, None, None, Order::Ascending)
    .collect::<StdResult<_>>().unwrap();
  let (_, t) = &list[0];
  assert_eq!(t, &token1);
  assert_eq!(2, list.len());
}
```

### Unique Indexes

Above example covers the case which one admin can own multiple tokens.
What if we want to ensure data is unique for a value? This is a common case.
For that, there is `UniqueIndex`

Here is an example:

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Token {
    pub admin: Addr,
    pub ticker: String,
    pub identifier: u8, // <---- unique value
}

pub struct TokenIndexes<'a> {
  // secondary indexed by admin address
  // last U64Key is the primary key which is auto incremented token counter
  pub admin: MultiIndex<'a, (Vec<u8>, Vec<u8>), Token>,
  // token.identifier
  pub identifier: UniqueIndex<'a, U8Key, Token>,
}

// this may become macro, not important just boilerplate, builds the list of indexes for later use
impl<'a> IndexList<Token> for TokenIndexes<'a> {
  fn get_indexes(&'_ self) -> Box<dyn Iterator<Item = &'_ dyn Index<Token>> + '_> {
    let v: Vec<&dyn Index<Token>> = vec![&self.admin, &self.identifier];
    Box::new(v.into_iter())
  }
}

pub fn tokens<'a>() -> IndexedMap<'a, &'a [u8], Token, TokenIndexes<'a>> {
  let indexes = TokenIndexes {
    admin: MultiIndex::new(
      |d, k| (index_string(d.admin.as_str()), k),
      TOKEN_NAMESPACE,
      "tokens__admin",
    ),
    identifier: UniqueIndex::new(|d| U8Key::new(d.identifier), "token_identifier"),
  };
  IndexedMap::new(TOKEN_NAMESPACE, indexes)
}
```

Now `tokens` are secondary indexed with two values: `admin` and a unique `identifier`
Here is a test code:

```rust
#[test]
fn test_tokens() {
  let mut store = MockStorage::new();

  let admin1 = Addr::unchecked("addr1");
  let ticker1 = "TOKEN1".to_string();
  let token1 = Token {
    admin: admin1.clone(),
    ticker: ticker1,
    identifier: 0,
  };

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();

  let ticker2 = "TOKEN2".to_string();
  let token2 = Token {
    admin: admin1.clone(),
    ticker: ticker2,
    identifier: 0,
  };

  let token_id = increment_tokens(store.borrow_mut()).unwrap();
  tokens().save(store.borrow_mut(), &U64Key::from(token_id).joined_key(), &token1).unwrap();
}
```

Last line will crash with error:

```
called `Result::unwrap()` on an `Err` value: GenericErr { msg: "Violates unique constraint on index" }
thread 'state::test::test_tokens' panicked at 'called `Result::unwrap()` on an `Err` value: GenericErr { msg: "Violates unique constraint on index" }', src/state.rs:197:90
stack backtrace:
```
