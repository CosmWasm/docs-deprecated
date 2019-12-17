---
id: serialization
title: Serialization Formats
sidebar_label: Serialization
---

One of the driving forces in developing CosmWasm, besides security by design, was to include a very nice Developer UX. Key to this is the ability to inspect and debug messages sent on the blockchain, and parse results without needing complex libraries. Also not requiring downloading custom schemas and ABIs just to make a method call.

## JSON

The natural solution was to use JSON everywhere. It is self-describing, human-readable, and used in APIs everywhere. It does have some downsides, such as handling numbers over 2^53 (just use strings), no clear distinction between strings and base64-encoded binary, and no hard-coded schema. We auto-generate [JSON Schema](https://json-schema.org/) descriptors for the [public API of contracts](https://github.com/confio/cosmwasm-examples/tree/master/escrow/schema), which can be used to inspect the supported API and optionally used in client side tooling for auto-validation of messages.

The feedback when developing and debugging with this has been positive, and we are quite happy with the Developer UX with this. It is too early to tell if the message size and free-form schema will become a hinderance in production. However, please note that contracts define their own parsing logic for messages, the codec is not enforced by the framework. We provide first-class support for json through [`cosmwasm::serde`](https://github.com/confio/cosmwasm/blob/master/src/serde.rs) and [`cosmwasm-template`](https://github.com/confio/cosmwasm-template), but anyone can swap this out - provided they provide client support for the format.

It is helpful to have consistency to aid client development, as well as contract-contract calls.

## Protobuf

Protobuf is a well-known and widely-supported binary format. It gives a stricter schema guarantees than JSON and more compact format. We considered using this optionally for encoding message, and [even did a spike on it](https://github.com/confio/cosmwasm/pull/55). It lead to larger wasm code and more gas usage, and only provided some moderate space savings in the size of the transaction. This ideas has since been placed in the icebox.

# Cap'n Proto

[Cap'n Proto](https://capnproto.org/) is a super-lean encoding format with zero-copy reads, and no parsing needed. This has been [suggested for use in CosmWasm](https://github.com/confio/cosmwasm/issues/78) as an optional addition. This may be considered as an opt-in format for contracts desiring such efficiency or strict schema, or possibly just used for encoding internal data structures (`Params`).

## Credits

Much thanks to [Jehan Tremback](https://github.com/jtremback), who insisted on a universal, human-readable format for all messages.
