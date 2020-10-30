---
order: 4
---

# Bootstrap dApp

There are two approaches to bootstrap a new dApp: as a lerna package in the monorepo or as a standalone app.

## Monorepo template

With this approach, we'll create another lerna package in the `packages/` directory that will use the local `logic` and `design` packages as dependencies.

For that, you only need to copy the `_template` directory into `packages/` and rename it to `balance-checker`:

```shell
git clone https://github.com/CosmWasm/dApps.git
cd dApps
cp -r _template packages/balance-checker
```

In the next section we'll start by customizing it to our needs.

## Standalone template

👷 Coming soon!
