---
sidebar_position: 3
---

# Advanced State Modeling

:::warning
Under Construction
:::

Key Value storage design might be found difficult by SQL background people at the first sight.
Even though Mongo DB or other streamlined databases are Key Value storage, libraries hide the internal complexity
away from the developers.
This is why Cosmos-SDK storage is not easy in the beginning. Once you get a hold of the concept, it is simple.

While implementing state model, take a step back and ask these questions before implementation:

- Do you really need to save that information to blockchain state?
- Is that connection really needed? Can it be served to UI by an off-chain database collector?

These question will prevent you from writing unnecessary data to the state, and using excess storage.
Less storage means cheaper execution.

In this tutorial, I will be showing you how to state model for those coming from Mongo DB background

Business Case as follows:
- The system will contain persons
- Persons can become member of multiple groups
- Group can contain multiple member person
- Member can have role in a group: admin, super-admin, regular...

## Naive Implementation {#naive-implementation}

Here is any-to-any relation design with saving data using IDs.

Person data indexed using auto incremented ID:

```rust
#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct Person {
    pub name: String,
    pub age: i32,
    pub membership_ids: Vec<String>
}

pub const PEOPLE: Map<&[u8], Person> = Map::new("people");
```

Groups indexed with ID too.

```rust
#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct Group {
    pub name: String,
    pub membership_ids: Vec<String>
}

pub const GROUPS: Map<&[u8], Group> = Map::new("groups");
```

Group and person relation established using membership structure:

```rust
#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct Membership {
  pub person_id: String,
  pub group_id: String,
  pub membership_status_id: String
}

pub const MEMBERSHIPS: Map<&[u8], Membership> = Map::new("memberships");
```

Membership status defined using status **String** field.

```rust
#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct MembershipStatus {
  pub status: String,
  pub membership_ids: Vec<String>
}

pub const MEMBERSHIP_STATUSES: Map<&[u8], MembershipStatus> = Map::new("membership_statuses");
```

## Optimized Implementation {#optimized-implementation}

Firstly, using ID for identifying persons might seem intuitive, but it creates redundancy.
ID is just a value for identifying a user but users already identified by a unique value: `Address`.
Instead of indexing with auto incremented integers, best is to index with `Addr`.

```rust
#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct Person {
    pub name: String,
    pub age: u8, // changed to u8 since ages are unsigned and 100 years max.
}

// Addr -> Person
pub const PEOPLE: Map<&[u8], Person> = Map::new("people");
```

Removed membership_id. Changed i32 to u8. We don't want to heat up the planet right?
Optimizing variable types improves gas consumption results as fewer fees.

---

Now for the `Group`:

Group does not have an address, it makes sense to identify groups using auto-incremented IDs.
If you want groups name to be unique, better use name as index.

```rust
pub const GROUP_COUNTER: Item<u64> = Item::new("group_counter");

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
pub struct Group {
  pub name: String,
}

// u64 ID -> Group
pub const GROUPS: Map<U64Key, Group> = Map::new("groups");
```

When a group saved, required auto incremented ID saved to `GROUP_COUNTER` item. Best to put this logic under
a function:

```rust

pub fn next_group_counter(store: &mut dyn Storage) -> StdResult<u64> {
  let id: u64 = GROUP_COUNTER.may_load(store)?.unwrap_or_default() + 1;
  GROUP_COUNTER.save(store, &id)?;
  Ok(id)
}

pub fn save_group(store: &mut dyn Storage, group: &Group) -> StdResult<()> {
  let id = next_group_counter(store)?;
  let key = U64Key::new(id);
  NEW_GROUPS.save(store, key, group)
}
```

Now need to set up relation between group and person also define person's role.
What exactly we want?
- Listing users under a group
- Listing groups of a user

This could be done by building secondary indexes.

## Back To Business Case {#back-to-business-case}



