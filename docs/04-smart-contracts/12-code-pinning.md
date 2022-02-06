---
sidebar_position: 12
---

# Code Pinning

**Code Pinning** mechanism allows codes to be pinned to the memory.

This way code does not have to be loaded to memory on each execution thus makes **~x40 performance**.

This is an estimation, needs to be benchmarked.

Code pinning is done through native chain governance.

## Proposal

### *PinCodesProposal*

```gogoproto
// PinCodesProposal gov proposal content type to pin a set of code ids in the
// wasmvm cache.
message PinCodesProposal {
  // Title is a short summary
  string title = 1 [ (gogoproto.moretags) = "yaml:\"title\"" ];
  // Description is a human readable text
  string description = 2 [ (gogoproto.moretags) = "yaml:\"description\"" ];
  // CodeIDs references the new WASM codes
  repeated uint64 code_ids = 3 [
    (gogoproto.customname) = "CodeIDs",
    (gogoproto.moretags) = "yaml:\"code_ids\""
  ];
}
```
[*reference*](https://github.com/CosmWasm/wasmd/blob/v0.23.0/proto/cosmwasm/wasm/v1/proposal.proto#L126-L136)

You can create the proposal using client:

```shell
wasmd tx gov submit-proposal pin-codes 1 --from wallet --title "Pin code 1" --description "Pin code 1 plss"
```

### *UnpinCodesProposal*

You can unpin codes:

```gogoproto
// UnpinCodesProposal gov proposal content type to unpin a set of code ids in
// the wasmvm cache.
message UnpinCodesProposal {
  // Title is a short summary
  string title = 1 [ (gogoproto.moretags) = "yaml:\"title\"" ];
  // Description is a human readable text
  string description = 2 [ (gogoproto.moretags) = "yaml:\"description\"" ];
  // CodeIDs references the WASM codes
  repeated uint64 code_ids = 3 [
    (gogoproto.customname) = "CodeIDs",
    (gogoproto.moretags) = "yaml:\"code_ids\""
  ];
}
```
[*reference*](https://github.com/CosmWasm/wasmd/blob/v0.23.0/proto/cosmwasm/wasm/v1/proposal.proto#L138-L150)

```shell
 wasmd tx gov submit-proposal unpin-codes 1 --title "Unpin code 1" --description "Unpin code 1 plss" --from wallet
```
