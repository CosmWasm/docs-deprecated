---
sidebar_position: 2
---

# Blockchain Infrastructure

In traditional web services, a front-end application (like a webpage or an app) interacts with a back-end application (like an API or a database server). In blockchain infrastructure, a front-end speaks directly with the blockchain network, visualizing the state of the chain or interacts with a back-end that is in connection with the blockchain network.

A blockchain network consists of *nodes*, a collection of computers to store and verify data. Nodes validate transactions and add them together to build blocks. Each node has a copy of the data that has been stored on the blockchain since its inception, which gets updated as fresh blocks are confirmed and added to the chain. This decentralized network of computers takes the place of databases and APIs used in traditional web services. The blockchain itself serves as a data store, while the application (or state machine) run by the nodes takes the place of data-store APIs (by ingesting transactions and defining transitions between states).

*Note*: In some cases, blockchain applications can also interact with a back-end that is in connection with the blockchain network. For instance, a blockchain-connected back-end infrastructure can save information to an external database to serve complex queries that would be expensive to perform on the chain itself.
