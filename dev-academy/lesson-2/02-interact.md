---
sidebar_position: 2
---

# Smart Contract Interaction

As mentioned before smart contracts are executable codes.
In the next lessons, we will learn how to write one. Until then best to use already written to keep things simple.

## Where to find smart contracts?

Normally, we compile smart contracts using rust compilers then code optimizers.
Now we will just download a precompiled one by cosmwasm team.

## Download

We provide smart contract binary executable
at [cw-plus](https://github.com/CosmWasm/cw-plus/) repo alongside the code.
cw-plus repository is a collection of production grade smart contracts that has been heavily testes on real mainnets.
You will see a list of available contracts on the repository page.
Go click **Releases** button to see tagged binary executables. You can download binaries and deploy to
compatible blockchains.

Let's download cw20-base binary code here
[cw20-base](https://github.com/CosmWasm/cw-plus/releases/download/v0.8.0/cw20_base.wasm)

Please don't pay attention to cw20-base details, just focus on getting a contract out there.

## Store

We will deploy the code using `wasmd` CLI we installed earlier.
```sh
RES=$(wasmd tx wasm store cw20_base.wasm --from wallet $TXFLAG -y)

# get code id
CODE_ID=$(echo $RES | jq -r '.logs[0].events[0].attributes[-1].value')

# print code id
echo $CODE_ID

# no contracts yet, this should return an empty list
wasmd query wasm list-contract-by-code $CODE_ID $NODE --output json

```

Now the code stored on the network. `CODE_ID` is the identifier of the code.

## Instantiate

**Smart contract code != usable smart contract instance**

Smart contract code is just a blueprint of a smart contract. We *instantiate* a smart contract based on smart
contract code.

Here is the instantiation message:
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
    "minter": "addr"
  }
}
```
This message contains initial state of the contract.

```shell
INIT=$(jq -n --arg wallet $(wasmd keys show -a wallet) '{"name":"Golden Stars","symbol":"STAR","decimals":2,"initial_balances":[{"address":"wasm1n8aqd9jq9glhj87cn0nkmd5mslz3df8zm86hrh","amount":"10000"},{"address":"wasm13y4tpsgxza44yq76qvj69sakq4jmeyqudwgwpk","amount":"10000"},{"address":$wallet,"amount":"10000"}],"mint":{"minter":$wallet}}')

wasmd tx wasm instantiate $CODE_ID "$INIT" --from wallet $TXFLAG --label "first cw20"
```

You will see this output indicating that instantiation transaction is success:

```json
{
  "height": "1350700",
  "txhash": "82D7240A35BDC6DE307AA725FE52590E83B60D4B682ABB0B0F6DCA28A66212D9",
  "data": "0A3C0A0B696E7374616E7469617465122D0A2B7761736D3170657A74676C397661677768346B3574677765366E367475397338686A7779716D6C6D72686B",
  "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"instantiate\"},{\"key\":\"module\",\"value\":\"wasm\"},{\"key\":\"signer\",\"value\":\"wasm10qhh60sexwtzd6nqr4r34z6t2d7nfrqp684twu\"},{\"key\":\"code_id\",\"value\":\"135\"},{\"key\":\"contract_address\",\"value\":\"wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk\"}]},{\"type\":\"wasm\",\"attributes\":[{\"key\":\"contract_address\",\"value\":\"wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk\"}]}]}]",
  "logs": [
    {
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "action",
              "value": "instantiate"
            },
            {
              "key": "module",
              "value": "wasm"
            },
            {
              "key": "signer",
              "value": "wasm10qhh60sexwtzd6nqr4r34z6t2d7nfrqp684twu"
            },
            {
              "key": "code_id",
              "value": "135"
            },
            {
              "key": "contract_address",
              "value": "wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk"
            }
          ]
        },
        {
          "type": "wasm",
          "attributes": [
            {
              "key": "contract_address",
              "value": "wasm1peztgl9vagwh4k5tgwe6n6tu9s8hjwyqmlmrhk"
            }
          ]
        }
      ]
    }
  ],
  "gas_wanted": "185650",
  "gas_used": "155257"
}
```

Now we purposed the aim of this lesson. You now know how smart contracts interaction looks like.
Of course there are other ways to achieve this, like CosmJS clients.

We will stop here, contract execution is the topic of another course.
