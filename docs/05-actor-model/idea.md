# Idea behind an Actor Model

Actor model is the solution to the problem of communication between smart
contracts. Lets take a look why this particular solution is chosen in
CosmWasm, and what are the consequences of that.

## The problem

Smart contracts can be imagined as sandboxed microservices. Due to SOLID
principles it is valuable to split responsibilities between entities.
However to split the work between contracts themself, there is a need
to communicate between them, so if one contract is responsible for
management group membership, it is possible to call its functionality
from other contract.

The traditional way to solve this problem in SW engineering is to
model services as functions which would be called with some RPC
mechanism, and return its result as a response. As this approach looks
nice, it creates sort of problems, in particular with shared state
consistency.

The other approach which is far more popular in business level modeling
is to treat entities as actors, which can perform some task, but without
interrupting it with calls to another contracts. Any calls to another
contracts can be called only after whole execution is performed. When
"subcall" would be finished, it will call the original contract back.

This solution may feel unnatural, and it actually requires to kind of
different design solutions, but it turns out working pretty good for
smart contracts execution. In this section I will try to step by step
how to reason about it, and how it maps to contract structure.

## The Actor

The most important thing in the whole model is an Actor itself. So
who is this? The Actor is a single instantiation of a contract,
which can perform several actions. When actor finishes his job,
he prepares a summary of it, which includes the list of things
which have to be done, to complete the whole scheduled task.

An example of an actor it the Seller in the KFC restaurant. First
thing you do you order your BSmart, so you are requesting an
operation from him. So as from the system user, you can think
about this about the task "sell and prepare my meal", but the
operation performed by seller is just "Charge payment and create
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
