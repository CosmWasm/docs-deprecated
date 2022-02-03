---
sidebar_position: 9
---

# Deployment

When compiling is complete (it may take a while) `cd` into the `artifacts` directory. `ls` should show you binaries for
the contract.

In the following examples, remember to switch `<your-contract>` for the name of the binary you just compiled.

## Store using the CLI

Using `wasmd` you can now store it on the blockchain:

```sh
wasmd tx wasm store <your-contract>.wasm  --from <your-key> --chain-id <chain-id> --gas auto
```

You will need the code id of the contract. For this, you can look in the JSON output for the `code_id` value. If you
would prefer to capture this as a shell variable, instead the previous upload step you can instead do:

```sh
cd artifacts
RES=$(wasmd tx wasm store <your-contract>.wasm  --from <your-key> --chain-id=<chain-id> --gas auto -y)
CODE_ID=$(echo $RES | jq -r '.logs[0].events[0].attributes[-1].value')
```

You will then be able to use `$CODE_ID` in commands when working with the contract for the remainder of your session.
