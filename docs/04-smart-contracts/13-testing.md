---
sidebar_position: 13
---

# Testing

## Unit Testing

## Integration Testing with `cw-multi-test`

The cw-multi-test package offered in the cw-plus repo provides an interesting way to test your smart contracts without going all the way to deploying them on a testnet. Before using multi-test the flow to me was to have some pipeline which would set up your contracts on a given chain (maybe testnet, maybe local) perform some tests and then if possible destroy/self-destruct the contracts.

All of that can be taken away almost in preference of cw-multi-test-based integration tests which enable you to test the flows and interactions between smart contracts. There is still a place for the flow described above but I have had a better experience writing these integration tests once you figure out the intricacies of multi-test. I hope to clear some of those intricacies up here with some tips, resources and steps.

## `cw-multi-test` concepts

### Mocking contracts

Mocking your contracts is one of the mantras of multi-test but also one of the main obstacles to getting yourself a working test. First consider that whatever contract you want to test needs to be either mocked or wrapped up. `cw-multi-test` provides the `ContractWrapper` which allows you to wrap up the logical pieces of your contract (instantiate, executors, queries) and deploy it to a mocked network.

Mocking all your contracts and then testing one can be done in a scripting fashion but for maintainability I recommend trying to define all your wrapped contracts a functions so you can reuse them:

```rust
use crate::contract::{execute, instantiate, query, reply};


pub fn contract_stablecoin_exchanger() -> Box<dyn Contract<Empty>>{
    let contract = ContractWrapper::new_with_empty(
        execute,
        instantiate,
        query,
    ).with_reply(reply);
    Box::new(contract)
}
```

The above is a more complex example but lets break it down real quick.
We import the execute, instantiate, query and reply functions which are used at runtime by the contract and then make our own wrapper from them to be used in the tests. Pretty cool..

Note the `reply` in this case is only needed if your contract uses replies for callbacks or anything like that. Usually you will only need execute, instantiate and query.
With the above you have to more steps, storing the code and then setting up a contract from the code object. You will notice this is the exact same process for deploying to a testnet chain whereas in unit tests you work with a mocked_env, using mock_dependancies and passing in mock_info

Storing:

```rust
let contract_code_id = router.store_code(contract_stablecoin_exchanger());
```

Instantiating from our code object:

```rust
let mocked_contract_addr = router
        .instantiate_contract(contract_code_id, owner.clone(), &msg, &[], "MYCONTRACT", None)
        .unwrap();
```

> Note: The above are just quick examples, your best bet is to always checkout the multi test repo's README files for up to date info. Located here:

All the above gives you 1 mocked contract. As you start to test you may see errors like

`No ContractData`
`Contract 'money' does not exist`
etc

If you get any of these theres a good chance you a missing a mock. When in multi test land, everything you interact with that can be considered a contract needs to be mocked out. That includes your own simple little utility contract you don't intend to test right now as well as any services your contract interacts with.

Look at your contract and see if you are passing in any dummy contract addresses, thats the most likely cause. If you find any you must; mock it out with the above method; instantiate it with the above method; capture the address and pass that instead of a dummy one.
Took me a while to get a complex contract fully mocked out but hopefully this helps you. Now for the next glaring problem I faced. Mocking other services!!

### Mocking 3rd party contracts

If you read the above section you will have a gist of the amount of setup work you will have to do by mocking out your contracts as your mocking and trying to progress with a test you may get caught up when you realise your contracts interact with Terraswap or Anchor. No biggie right?

You'll start off just trying to mock out one of these services in the exact same way as we did above only to realise, wait, we need access to the code.. the contract code is what we import to get `execute, instantiate, query`. But then you notice protocols don't include their contract code in their rust packages! They only include what you need to interact with them i.e msgs and some helpers.

When I got here I thought all hope was lost but you can still progress by trying to make a thin mock of whatever service you interact with. The process of doing so is similar to what you will do with mocking your own contracts (described above) except you will need to fill in all the functionality. This is made easier because you can also a smaller ExecuteMsg with only the funcs you use or a MockQuery handler with only the queries for example. Here is an example of our own mock third-party contract:

```rust
pub fn contract_pingpong_mock() -> Box<dyn Contract<Empty>> {
    let contract = ContractWrapper::new(
        |deps, _, info, msg: MockExecuteMsg| -> StdResult<Response> {
            match msg {
                MockExecuteMsg::Receive(Cw20ReceiveMsg {
                    sender: _,
                    amount: _,
                    msg,
                }) => {
                    let received: PingMsg = from_binary(&msg)?;
                    Ok(Response::new()
                        .add_attribute("action", "pong")
                        .set_data(to_binary(&received.payload)?))
                }
                }})}

        |_, _, msg: MockQueryMsg| -> StdResult<Binary> {
            match msg {
                MockQueryMsg::Pair {} => Ok(to_binary(&mock_pair_info())?),

```

You get alot of flexibility when you are defining your own mocked contract. You can throw away things like deps, env, info with `_` if you never use them and return any responses you want for a given execute msg or query. The challenge then becomes how do I mock out all these services? I started a small testing library for Terra called [cw-terra-test-mocks](https://github.com/0xFable/cw-terra-test-mocks) which will have a couple of mocks for Anchor and Terraswap you can use. The hope over time is that can go to have a bunch of Terra protocol mocks to make all our testing lives easier :-)
