---
sidebar_position: 6
---

# Compatibility

Wasm VM can support one or more contract-VM interface versions. The interface version is communicated by the contract
via a Wasm export. This is the current compatibility list:

| cosmwasm-std | cosmwasm-vm | x/wasm    | @cosmjs/cosmwasm-stargate |
|--------------|-------------|-----------|---------------------------|
| 0.16         | 0.16        | 0.18      | ^0.26.0                   |
| 0.15         | 0.15        | 0.18      | ^0.25.0                   |
| 0.14         | 0.14        | 0.16-0.17 | ^0.25.0                   |
| 0.13         | 0.13        | 0.16      | ^0.24.0                   |

Note that `cosmwasm-std` version defines which contracts are compatible with this system. The wasm code uploaded must
have been compiled with one of the supported `cosmwasm-std` versions, or will be rejeted upon upload (with some error
message about "contract too old?" or "contract too new?"). `cosmwasm-vm` version defines the runtime used. It is a
breaking change to switch runtimes (you will need to organize a chain upgrade). As of `cosmwasm-vm 0.13` we are
using [wasmer](https://github.com/wasmerio/wasmer/) 1.0, which is significantly more performant than the older versions.
`@cosmjs/cosmwasm-stargate` follows the compatible [CosmJS](https://github.com/cosmos/cosmjs) version.

