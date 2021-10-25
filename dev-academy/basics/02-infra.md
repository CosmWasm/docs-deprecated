---
sidebar_position: 2
---

# Blockchain Infrastructure

In traditional web services, a frontend application (like a webpage or an app) interacts with a backend application (like APIs or a Postgres server).

In blockchain infrastructure, a frontend speaks directly with the blockchain network, visualizing the state of the chain. A blockchain network contains nodes, which validate transactions and add them to blocks. This decentralized network of nodes takes the place of the database and APIs in a traditional web service. The blockchain itself serves as a data store, and the application (or state machine) that the nodes run take the place of its APIs (by ingesting transactions and defining transitions between states).

In blockchain infrastructure, a frontend either speaks directly to the blockchain
network, visualizing the state of the chain, 
or interacts with a backend which is in connection with blockchain network.
A blockchain network needs a collection of computers to store and verify data. These computers are called nodes, which are connected and building blocks, verifying transactions. Each node has a copy of the data that has been stored on the blockchain since its inception and it gets updated as fresh blocks are confirmed and added. This decentralized
network of nodes takes the place of the database and APIs in a traditional web
service. The blockchain itself serves as a data store, and the application (or
state machine) that the nodes run take the place of its APIs (by ingesting
transactions and defining transitions between states).

*Note*: In some cases, blockchain applications can also interact with a backend which in turn connects to the blockchain. For example, backend infrastructure can save information to an external database to serve complex queries that would be expensive to perform on the chain itself.
