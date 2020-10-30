---
order: 3
---

# Cosmic dApp design

The [`@cosmicdapp/design`](https://github.com/CosmWasm/dApps/tree/master/packages/design) package provides two kinds of resources: theme and components. The theme provides global styles for visual consistency across the dApps, whereas the components will give us layout primitives and reusable React components with internal logic.

The example balance checker dApp will make use of some resources from this package, so let's take a look at them.

## Theme

We'll use the exported `GlobalStyle` in order to have visual consistency with the rest of the dApps. This React component includes a CSS reset; spacing, colors, and fonts CSS Custom Properties; and an override for some Ant Design classes. This is seen at first glance if you look at the `GlobalStyle` code:

```jsx
export function GlobalStyle(): JSX.Element {
  return (
    <>
      <GlobalReset />
      <GlobalSpacing />
      <GlobalColors />
      <GlobalFonts />
      <GlobalAntOverride />
    </>
  );
}
```

## Components

### Layout primitives

This resource offers some primitives based on the [Every Layout](https://every-layout.dev) book.

#### Stack

This React component displays its children as a stack with a configurable gap between them.

#### PageLayout

This React component is used as the wrapper for every view. It establishes a max width of page and centers the stacked children inside.

### Components with logic

#### Login

The first view of the balance checker application. It offers three options for logging in: localStorage burner wallet, ledger wallet, or Keplr wallet.

#### YourAccount

A useful component that lets the user copy their own address to clipboard, and optionally show their current native balance.
