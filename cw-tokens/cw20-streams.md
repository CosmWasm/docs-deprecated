---
id: cw20-streams
sidebar_position: 6
title: CW20 Streams
---

# CW20 Streams

Source code is at [cw20-streams](https://github.com/CosmWasm/cw-tokens/tree/main/contracts/cw20-streams).

This is a contract that is made for creating a payment stream using cw20 tokens. The payment stream allows for a payment to be continuously vested until the end of the stream.

## Instantiation

To instantiate a new instance of this contract you must specify a contract owner, and the cw20 token address used for the streams.
Only one cw20 token can be used for payments for each contract instance.

## Creating a Stream

A stream can be created using the cw20 Send / Receive flow. This involves triggering a Send message from the cw20 token contract, with a Receive callback that's sent to the token streaming contract. The callback message must include the start time and end time of the stream in seconds, as well as the payment recipient.

## Withdrawing payments

Streamed payments can be claimed continously at any point after the start time by triggering a Withdraw message. The amount will be calculated based on the current block time, start time, and end time of the stream. If the block time is after the end time, the amount will be total unclaimed amount.
