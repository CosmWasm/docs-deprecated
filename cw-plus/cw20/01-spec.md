---
order: 1
---

# CW20 Spec: Fungible Tokens

cw20 package source code: [https://github.com/CosmWasm/cosmwasm-plus/tree/master/packages/cw20](https://github.com/CosmWasm/cosmwasm-plus/tree/master/packages/cw20)

CW20 is a specification for fungible tokens based on CosmWasm.
The name and design is loosely based on Ethereum's ERC20 standard,
but many changes have been made. The types in here can be imported by
contracts that wish to implement this  spec, or by contracts that call
to any standard cw20 contract.

The specification is split into multiple sections, a contract may only
implement some of this functionality, but must implement the base.

::: tip
This section contains CW20 spec implementation details.
If you are around to play with the contract,
skip this section and go to the [next page](03-cw20-base-tutorial.md)
:::

## Base

This handles balances and transfers. Note that all amounts are
handled as `Uint128` (128 bit integers with JSON string representation).
Handling decimals is left to the UI and not interpreted

### Messages

`Transfer{recipient, amount}` - Moves `amount` tokens from the
`env.sender` account to the `recipient` account. This is designed to
send to an address controlled by a private key and *does not* trigger
any actions on the recipient if it is a contract.

`Send{contract, amount, msg}` - Moves `amount` tokens from the
`env.sender` account to the `recipient` account. `contract` must be an
address of a contract that implements the `Receiver` interface. The `msg`
will be passed to the recipient contract, along with the amount.

`Burn{amount}` - Remove `amount` tokens from the balance of `env.sender`
and reduce `total_supply` by the same amount.

### Queries

`Balance{address}` - Returns the balance of the given address.
Returns "0" if the address is unknown to the contract. Return type
is `BalanceResponse{balance}`.

`TokenInfo{}` - Returns the token info of the contract. Return type is
`TokenInfoResponse{name, symbol, decimal, total_supply}`.

### Receiver

The counter-part to `Send` is `Receive`, which must be implemented by
any contract that wishes to manage CW20 tokens. This is generally *not*
implemented by any CW20 contract.

`Receive{sender, amount, msg}` - This is designed to handle `Send`
messages. The address of the contract is stored in `env.sender`
so it cannot be faked. The contract should ensure the sender matches
the token contract it expects to handle, and not allow arbitrary addresses.

The `sender` is the original account requesting to move the tokens
and `msg` is a `Binary` data that can be decoded into a contract-specific
message. This can be empty if we have only one default action,
or it may be a `ReceiveMsg` variant to clarify the intention. For example,
if I send to a uniswap contract, I can specify which token I want to swap
against using this field.

## Allowances

A contract may allow actors to delegate some of their balance to other
accounts. This is not as essential as with ERC20 as we use `Send`/`Receive`
to send tokens to a contract, not `Approve`/`TransferFrom`. But it
is still a nice use-case, and you can see how the Cosmos SDK wants to add
payment allowances to native tokens. This is mainly designed to provide
access to other public-key-based accounts.

There was an issue with race conditions in the original ERC20 approval spec.
If you had an approval of 50 and I then want to reduce it to 20, I submit a
Tx to set the allowance to 20. If you see that and immediately submit a tx
using the entire 50, you then get access to the other 20. Not only did you quickly
spend the 50 before I could reduce it, you get another 20 for free.

The solution discussed in the Ethereum community was an `IncreaseAllowance`
and `DecreaseAllowance` operator (instead of `Approve`). To originally set
an approval, use `IncreaseAllowance`, which works fine with no previous allowance.
`DecreaseAllowance` is meant to be robust, that is if you decrease by more than
the current allowance (eg. the user spent some in the middle), it will just round
down to 0 and not make any underflow error.

### Messages

`IncreaseAllowance{spender, amount, expires}` - Set or increase the allowance
such that `spender` may access up to `amount + current_allowance` tokens
from the `env.sender` account. This may optionally come with an `Expiration`
time, which if set limits when the approval can be used (by time or height).

`DecreaseAllowance{spender, amount, expires}` - Decrease or clear the allowance
such that `spender` may access up to `current_allowance - amount` tokens
from the `env.sender` account. This may optionally come with an `Expiration`
time, which if set limits when the approval can be used (by time or height).
If `amount >= current_allowance`, this will clear the allowance (delete it).

`TransferFrom{owner, recipient, amount}` - This makes use of an allowance
and if there was a valid, un-expired pre-approval for the `env.sender`,
then we move `amount` tokens from `owner` to `recipient` and deduct it
from the available allowance.

`SendFrom{owner, contract, amount, msg}` - `SendFrom` is to `Send`, what
`TransferFrom` is to `Transfer`. This allows a pre-approved account to
not just transfer the tokens, but to send them to another contract
to trigger a given action. **Note** `SendFrom` will set the `Receive{sender}`
to be the `env.sender` (the account that triggered the transfer)
rather than the `owner` account (the account the money is coming from).
This is an open question whether we should switch this?

`BurnFrom{owner, amount}` - This works like `TransferFrom`, but burns
the tokens instead of transfering them. This will reduce the owner's
balance, `total_supply` and the caller's allowance.

### Queries

`Allowance{owner, spender}` - This returns the available allowance
that `spender` can access from the `owner`'s account, along with the
expiration info. Return type is `AllowanceResponse{balance, expiration}`.

## Mintable

This allows another contract to mint new tokens, possibly with a cap.
There is only one minter specified here, if you want more complex
access management, please use a multisig or other contract as the
minter address and handle updating the ACL there.

### Messages

`Mint{recipient, amount}` - If the `env.sender` is the allowed minter,
this will create `amount` new tokens (updating total supply) and
add them to the balance of `recipient`.

### Queries

`Minter{}` - Returns who and how much can be minted. Return type is
`MinterResponse {minter, cap}`. Cap may be unset.
