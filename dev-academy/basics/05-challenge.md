---
sidebar_position: 5
---

# Challenge

Here is a basic challenge to test your might using the knowledge acquired in previous chapters.
## Performing a transaction using CosmJS CLI
Initialize the CosmJS interface session by running the following command:
```shell
npx @cosmjs/cli@^0.26 --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/base.ts --init https://raw.githubusercontent.com/InterWasm/cw-plus-helpers/main/cw20-base.ts
```
Import the necessary utilities.
```typescript
import { Bip39, Random } from "@cosmjs/crypto";
import { StdFee } from "@cosmjs/stargate";
import { Secp256k1HdWallet, coins } from "@cosmjs/amino";
```
The following lines of code will set up a client that speaks to cliffnet, generate an address and then request tokens from the faucet.
"password" is the password of the key file.
This key is different from the wasmd key that was previously generated.

```typescript
const [senderAddress, client] = await useOptions(cliffnetOptions).setup("password");
client.getAccount(senderAddress);
```

The response should be something similar to:
```json
{
  address: 'wasm1kfaqnxcsz6pwxyv0h468594g6g2drwxfrrwslv',
  pubkey: null,
  accountNumber: 326,
  sequence: 0
}
```
Check to see if the wallet address has *upebbles* in it.
```typescript
client.getBalance(senderAddress,"upebble");
```
The response should be as follows:
```json
{ denom: 'upebble', amount: '100000000' }
```
Now, executing the following lines of code, create a recipient wallet address from a random mnemonic and observe that it has no upebbles initially.
```typescript
const wallet = await Secp256k1HdWallet.fromMnemonic(Bip39.encode(Random.getBytes(24)).toString(),{prefix: "wasm"});
const [{ address: recipientAddress, pubkey }] = await wallet.getAccounts();
console.info("Recipient Address:", recipientAddress);
client.getBalance(recipientAddress,"upebble");
```
The response should be as follows:
```json
{ denom: 'upebble', amount: '0' }
```
Finally, a *send message* can be formed piece-by-piece and broadcasted to perform the transaction as follows:
```typescript
const memo = "My very first tx!";

const msgSend = {fromAddress: senderAddress, toAddress: recipientAddress, amount: coins(10000000, "upebble"),};

const msgAny = {typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSend,};

const defaultFee: StdFee = { amount: [{amount: "1000000", denom: "upebble",},], gas: "89000",};

const broadcastResponse = await client.signAndBroadcast( senderAddress, [msgAny], defaultFee,  memo,);
```
The transfer of funds should be complete and the recipient should have the amount of upebbles that was sent. Let us check the balances of both parties.
```typescript
client.getBalance(senderAddress,"upebble");
client.getBalance(recipientAddress,"upebble");
```
The responses should be as follows:
```json
{ denom: 'upebble', amount: '89000000' }
{ denom: 'upebble', amount: '10000000' }
```
The broadcast response can also be used to check if the transaction was successful. Run the following command and observe the output.
```typescript
console.info(broadcastResponse);
```
The *transactionHash* can now be carried over to the [Cliffnet Block Explorer](https://block-explorer.cliffnet.cosmwasm.com/) in order to examine the transaction in detail.



