---
title: Idea behind an Actor Model
---

# Idea behind an Actor Model

Actor model is the solution to the problem of communication between smart
contracts. Let's take a look why this particular solution is chosen in
CosmWasm, and what are the consequences of that.

## The problem {#problem}

Smart contracts can be imagined as sandboxed microservices. Due to SOLID
principles it is valuable to split responsibilities between entities.
However to split the work between contracts themselves, there is a need
to communicate between them, so if one contract is responsible for
management group membership, it is possible to call its functionality
from another contract.

The traditional way to solve this problem in SW engineering is to
model services as functions which would be called with some RPC
mechanism, and return its result as a response. Even though this approach
looks nice, it creates sort of problems, in particular with shared state
consistency.

The other approach which is far more popular in business level modeling
is to treat entities as actors, which can perform some task, but without
interrupting it with calls to another contracts. Any calls to another
contracts can be called only after whole execution is performed. When
"subcall" would be finished, it will call the original contract back.

This solution may feel unnatural, and it actually requires to kind of
different design solutions, but it turns out working pretty good for
smart contracts execution. I will try to explain how to reason about it,
and how it maps to contract structure step by step.

## The Actor {#actor}

The most important thing in the whole model is an Actor itself. So
what is this? The Actor is a single instantiation of a contract,
which can perform several actions. When actor finishes his job,
he prepares a summary of it, which includes the list of things
which have to be done, to complete the whole scheduled task.

An example of an actor it the Seller in the KFC restaurant. First
thing you do you order your BSmart, so you are requesting an
action from him. So as from the system user, you can think
about this about the task "sell and prepare my meal", but the
action performed by seller is just "Charge payment and create
order". First part of this operation is to create a bill and
charge you for it, and then it requests the Longer and Fries
to be prepared by other actors, probably chiefs. Then when chief
is done with his part of meal, he checks if all meals are ready.
If so, it calls the last actor, the waiter, to deliver the food
to you. At this point you can receive your delivery, and the task
is considered complete.

Obviously described workflow is kind of simplification. In
particular - in typical restaurant, waiter would observe the
kitchen instead of being triggered by chef, but in Actor model
it is not possible. Here, entities of the system are passive
and cannot observe environment actively - they only react to
messages from another system participants. Also in KFC, seller
would not schedule subtasks to particular chefs, instead he
would leave tasks to be taken by them, when they are free. It
is not a case, because as before - chefs cannot actively listen
to environment. However it would be possible to create contract
being chiefs dispatcher which would collect all orders from
sellers, and balance them across chiefs for some reason.

## The action {#action}

Actors are the model entities, but to properly communicate with
them, we need some kind of protocol to communicate with them.
Every actor is capable of performing several actions. In my
previous KFC example the only action seller can do is "Charge
payment and create order". However it is not always a case -
our chefs was proficient with performing both "Prepare fries"
and "Prepare Grander" actions - and also many more.

So when we want to do something in an actor system, we schedule
some action to the actor being the closes to us, very often with
some additional parameter (as we can pick if we want to exchange
fries with salad).

However naming the action after the exact thing which happen
in the very contract would be misleading. Take a look at KFC
example once again. As I mentioned, the action performed by seller
is "Charge payment and create order". The problem is, that for
the client which schedules this action, it doesn't matter what
exactly is the responsibility of actor himself - what client is
actually scheduling is "Prepare Meal" with some description
of what exactly to prepare. So we can say, that the action is
the thing performed by contract itself, plus all the sub-actions it
schedules.

## Multi-stage actions {#multi-stage}

So as the whole idea makes some sense, there is the biggest
problem created by actor model: what if I want to perform some
action in my contract, but to completely finalize some steps,
the contract have to make sure that some sub-action he
scheduled are actually finished?

Imagine, that in the previous KFC situation there is no dedicated
Waiter, instead Seller is serving you meal when chefs finished
their job.

This kind of pattern is so important and common, that in CosmWasm
we developed special way to handle it, which is dedicated `Reply`
action.

So when Seller is scheduling actions for chiefs, he assigns some
number to this action (like order id), and passes it to chiefs.
He also remembers how much actions he scheduled to every order id.
Now every time chief is finished with his action, he would call the
special `Reply` action on Seller, in which he would pass back the
order id. Then Seller would decrease number of actions left for
this order, and if it reached zero, he would serve meal.

Now you can say, that the `Reply` action is completely not needed,
as Chiefs could just schedule any arbitrary action on Seller, like
`Serve`, why there is the special `Reply` for? The reason is
abstraction and reusability. The Chiefs task is to prepare a meal,
and that is all. There is no reason for him to know why he is
even preparing Fries - if it is part of the bigger task (like order
for client), or seller is just hungry. There is actually possible,
that no only seller is eligible to call chief for food - possibly
any employee of restaurant can do that just for themself. Therefore
we need a way, to be able to react on actor finishing his job in
some universal way, to handle this situation properly in any context.

It is worth noting, that the `Reply` can contain some additional data.
The id assigned previously is the only required information in the
`Reply` call, but actor can pass some additional data - `events`
emitted, which are mostly metadata (to be observed by non-blockchain
applications mostly), and any arbitrary data it want to pass.

## State {#state}

Up until this point we were considering actors as entities performing
some job, like preparing the meal. If we are considering computer
programs, such job would be to show something on the screen, maybe
print something. This is not a case with Smart Contracts. The only
thing which can be affected by the Smart Contract is their internal
state. So the state is arbitrary data which is kept by the contract.
Previously in KFC example I mentioned, that Seller is keeping in mind
how much actions he scheduled to chiefs are not yet finished - this
number is actually part of Sellers state.

To give more realistic example of contract state, let think about more
real life Smart Contract than the restaurant. Let imagine we want
to create our own currency - maybe we want to create some smart
contracts based market for some MMORPG game. So we need some way,
to be able to at least transfer currency between players. We can
do that, by creating the contract we would call `MmoCurrency`, and
which would support the `Transfer` action to transfer money to another
player. Then what would be the state of such contract? It would be
just a table mapping player names to amount of currency they own. The
contract we just invited actually exists in CosmWasm examples and it
is called `cw20-base` contract (it is a bit more complicated, but
it is basically its core idea).

And now there is a question - how is this helpful to transfer currency
if I cannot check how much of it do I actually own? It is very good
question, and the answer to that is simple - whole state of every
contracts in our system is actually public. It is not universal for
every Actor model, but it is how it works in CosmWasm, and it is
kind of forced by the nature of blockchain. Everything happening in
blockchain has to be public, and if some information should be hidden,
it have to be stored indirectly.

There is one very important thing about state in CosmWasm, and it is
state being transactional. Any updates to state are not applied immediately,
but only when the whole action succeed. It is very important, as
it guarantees that if something goes wrong in contract, it is always
left in some proper state. Let consider our `MmoCurrency` case. Imagine,
that in `Transfer` action we first increase receiver currency amount
(by updating the state), and only then we decrease the sender amount.
However before decreasing it, we obviously need to check if sender
possess enough funds to perform transaction. In case if we realize,
that we cannot do it, we don't need to do any rolling back by hand -
we would just return a failure from the action execution, and state
would not be actually updated. So when in contract state is updated,
it is actually only local copy of this state being altered, but the
partial changes would never be visible by other contracts.

## Queries {#queries}

There is one building block in CosmWasm approach to Actor model, which
I didn't yet covered. As I said, whole state of every contract is public
and available for everyone to look at. The problem is, that this way of
looking at state is not very convenient - it requires users of contracts
to know its internal structure, which kind of violates the SOLID rules
(Liskov substitution principle in particular). If for example contract
is updated and its state structure changes a bit, other contract looking
at its state would just nevermore work. Also it is often case, that
contract state is kind of simplified, and information which is relevant
for the observer would be calculated from the state.

This is where queries comes into play. Queries are type of messages to
contract, where they not perform any actions, so do not update any state,
but can return answer immediately.

In our KFC comparison, the query would be if Seller goes to Chef to ask
"Do we still have pickles available for our cheesburgers"? It can be
done while performing an action, and response can be used in it. It is
possible, because queries can never update state, so they do not need
to be handled in transactional manner.

However existence of queries doesn't mean, that we cannot look at contracts
state directly - state is still public, and technique of looking at them
directly is called `Raw Queries`. For clarity, non-raw queries are sometimes
denoted as `Smart Queries`.

## Wrapping everything together - transactional call flow {#flow}

So we touched many things here, and I known it may be kind of confusing.
Because of that, I would like to go through some more complicated call
to CosmWasm contract to visualize what the "transactional state" means.

Let imagine two contracts:

1. The `MmoCurrency` contract mentioned before, which can perform `Transfer`
  action, allowing to transfer some `amount` of currency to some `receiver`.
2. The `WarriorNpc` contract, which would have some amount of our currency,
  and he would be used by our MMO engine to payout the reward for some
  quest player could perform. It would be triggered by `Payout` action,
  which can be called only by specific client (which would be our game
  engine).

Now here is interesting thing - this model forces us, to make our MMO
more realistic in terms of economy that we traditionally see - it is
because `WarriorNpc` has some amount of currency, and cannot create
more out of nothing. It is not always the case (the previously mentioned
`cw20` has a notion of Minting for this case), but for sake of simplicity
let assume this is what we want.

To make the quest reasonable for longer, we would make a reward for it
to be always between `1 mmo` and `100 mmo`, but it would be ideally
`15%` what Warrior owns. This means, that the quest would be worth
less for every subsequent player, until Warrior would be broke, left
with nothing, and will no longer be able to payout players.

So how would the flow looks like? First game would send `Payout` message
to `WarriorNpc` contract, with info who should get the reward. Warrior
would keep track of players who fulfilled the quest, to not payout
the same person twice - there would be list of players in his state.
First he would check the list looking for player to pay out - if he is
there, he would finish transaction with a error.

However in most cases the player would not be on list - so then `WarriorNpc`
would add him to the list. Now the Warrior would finish his part of
task, and schedule the `Transfer` action to be performed by `MmoCurrency`.

But there is the important thing - because `Transfer` action is actually
the part of bigger `Payout` flow, it would not be executed on the original
blockchain state, but on the local copy of it, which has already applied
the players list. So if the `MmoCurrency` would for any reason take a look
of `WarriorNpc` internal list, it would be already updated.

Now `MmoCurrency` is doing its job, updating the state of Warrior and
player balance (note, that our Warrior is here just treated as another player!).
When it finishes, two things may happen:

1. There was an error - possibly Warrior is out of cash, and it can nevermore
  pay for the task. In such case, none of changes - neither updating list
  of players succeeding, nor balance changes are not applied to original
  blockchain storage, so they are like never happened. In database world it
  is denoted as rolling back the transaction.
2. Operation succeed - all changes on state are now applied to blokchain,
  and any further observation of `MmoCurrency` or `WarriorNpc` by external
  world would see updated data.

There is one problem - in this model, our list is not a list of players
which fullfilled the quest (as we wanted it to be), but the list of players
paid out (as in transfer failure, the list is not updated). We can do better.

## Different ways of handling responses {#responses}

Note, that we didn't mention a `Reply` operation at all. So why it was not
called by `MmoCurrency` on `WarriorNpc`? The reason is, that this operation
is optional. When scheduling sub-actions on another contract we may choose
when `Reply` how result should be handled:

1. Never call `Reply`, action succeed regardless of result
2. Never call `Reply`, succeed only if sub-action succeeded
3. Call `Reply` on success
4. Call `Reply` on failure
5. Always call `Reply`

So if we do not request `Reply` to be called by subsequent contract, it will
not happen. I silently assumed, that the sub-call is performed in mode `2`,
so if sub-call fails, the whole action would fail. But it is possible to
just schedule some additional "optional" actions, which result doesn't
actually matter so much. Obviously in case if such subcall fails, only
changes done by original action would be stored on blockchain, and all
changes created by sub-call would be rolled back (so the sub-contract
never ends up in inproper state). It is probably a bit complicated for now,
bit I promise it would be simple when you would do some practice with that.

Now let take a look on handling result with `3`-`5` options. It is actually
interesting, that using `3`, even if transaction performed by sub-call
succeed, we may now take a look at the data it returned with `Reply`, and
on its final state after it performed action, and we can still decide,
that action as a whole is a failure, in which case every thing would
be rolled back - even currency transfer performed by external contract.

In particular, interesting option is `4`. So if contract would call
`Reply` on failure, we can decide to claim a success, and commit a
transaction on state if the subcall failed. Why it may be relevant
for us? Possibly because our internal list was supposed to keep list of
players succeeding with quest, not paid out! So if we have no more currency,
we still want to update the list! So we can choose to use `4` or `1` response
handling method, to ensure that failure in transfer would not discard
all the transaction.

But if we could use `1` for that, why is `4` exist? It is useful sometimes.
Probably the most common case is that in case of failure, we want to leave
a note about it. Also it is possible, that we want to succeed only on
particular types of failure, but it is way less likely case - unfortunately
failure of contract is denoted in CosmWasm only by some arbitrary string,
so distinguishing failure reason would require parsing this string,
and it would be difficult to maintain this kind of contracts.

At the end you can see, that performing actions in CosmWasm is build
with hierarchical state change transaction. The sub-transaction can be
applied to the blockchain only if everything succed, but in case that
sub-transaction failed, only its part may be rolled back, end other
changes may be applied. It is actually very similar to how most database
systems work.
