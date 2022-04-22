---
sidebar_position: 6
---

# CosmWasm IDE

CosmWasm IDE is a tool that simplifies the CosmWasm smart contract development & deployment processes. It integrates with Gitpod & Keplr to create a simple yet powerful environment to build, deploy, and interact with the CosmWasm smart contracts through default and custom networks using CosmWasm. The tool is currently maintained by Oraichain & CosmWasm.

## Components

The CosmWasm IDE expands into three small repositories:

- [CosmWasm Gitpod](https://github.com/oraichain/cosmwasm-gitpod) serves as a Gitpod builder which automatically builds a complete development environment including Rust installation, VS Code browser, crucial VS Code extensions, and fully compatible with the Keplr wallet. With this repository, CosmWasm developers will not have to worry about spending hours installing tools & libraries, and they also feel secure when deploying contracts using Keplr.

- [CosmWasm IDE extension](https://github.com/oraichain/cw-vscode) is a VS Code extension which integrates all the important functionalities related to building & deploying CosmWasm smart contracts through simple button clicks.

- [CosmWasm IDE extension webview](https://github.com/oraichain/cw-ide-webview) is a React application that lies on top of the CosmWasm IDE Extension. It is responsible for connecting with the Keplr wallet and show inputs to deploy & interact with the contracts. It also allows adding custom networks.

Each repository already has a specific tutorial & documentation. Please visit their sites for more information.