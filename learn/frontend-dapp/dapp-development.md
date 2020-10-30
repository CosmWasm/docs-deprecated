---
order: 5
---

# Develop dApp

To showcase the previously explained utilities, we'll create the balance checker dApp from the template.

## Customize template

To make the app your own, feel free to modify the `name` field in `package.json` and/or update the `README.md` file.

Also modify the `routes/Login/index.tsx` file to look like this:

```jsx
import { Login as LoginDesign } from "@cosmicdapp/design";
import React from "react";
import { config } from "../../../config";
import { pathBalance } from "../../paths";
import cosmWasmLogo from "./assets/cosmWasmLogo.svg";

export function Login(): JSX.Element {
  return (
    <LoginDesign
      pathAfterLogin={pathBalance}
      appName="Balance checker"
      appLogo={cosmWasmLogo}
      config={config}
    />
  );
}

```

## Add balance route

### Balance path

Add the following to the `paths.ts` file:

```typescript
export const pathBalance = "/balance";
```

### React component

Inside `routes/`, add a `Balance` directory with the following files:

- `index.tsx`

```jsx
import { PageLayout, YourAccount } from "@cosmicdapp/design";
import { useError } from "@cosmicdapp/logic";
import { Typography } from "antd";
import React, { useState } from "react";
import { FormCheckBalance } from "./components/FormCheckBalance";
import { TokenList } from "./components/TokenList";
import { ErrorText, MainStack } from "./style";

const { Title } = Typography;

export function Balance(): JSX.Element {
  const { error } = useError();
  const [contractAddress, setContractAddress] = useState();

  return (
    <PageLayout>
      <MainStack>
        <Title>Balance</Title>
        <YourAccount hideTitle hideBalance />
        <FormCheckBalance setContractAddress={setContractAddress} />
        {error && <ErrorText>{error}</ErrorText>}
        <TokenList contractAddress={contractAddress} />
      </MainStack>
    </PageLayout>
  );
}
```

- `style.ts`

```typescript
import { Stack } from "@cosmicdapp/design";
import { Typography } from "antd";
import styled from "styled-components";

const { Text } = Typography;

export const MainStack = styled(Stack)`
  & > * {
    --gap: var(--s4);
  }

  h1 {
    margin: 0;
  }

  .ant-form {
    margin-top: var(--gap);
  }
`;

export const ErrorText = styled(Text)`
  color: var(--color-red);
`;
```

As you can see, this two files make use of `@cosmicdapp/logic`'s `useError` hook, and of `@cosmicdapp/design`'s `Stack`, `PageLayout`, and `YourAccount` components, so they should be familiar to you.

The `index.tsx` component's layout makes use of `MainStack` and `ErrorText`, which are Styled Components defined in `style.ts`, and also of `FormCheckBalance` and `TokenList` components, which are yet to be defined.

The logic will work like this: the `TokenList` component will display the native tokens of the user, unless a contract address is entered in `FormCheckBalance`, which will make `TokenList` show the balance for that CW20 contract, or show an error if that address does not have an associated contract.

### Add to ProtectedSwitch

Your `ProtectedSwitch` in `App/index.tsx` should look like this:

```jsx
<ProtectedSwitch authPath={pathLogin}>
  <Route exact path={pathBalance} component={Balance} />
</ProtectedSwitch>
```

Note that we remove `OperationResult`, both the route and the component, since we won't be making transactions in this dApp.

## Add FormCheckBalance component

### Add Search component

For entering the address we'll use a custom `Search` component, it may seem hacky but does a good job integrating `formik` and `antd`, and is in fact inspired by `formik-antd` (but it's missing there as of now).

`App/forms/Search.tsx`

```jsx
// Search form not present in form-antd: https://github.com/jannikbuschke/formik-antd/blob/master/src/input/index.tsx
import { Input as BaseInput } from "antd";
import { InputProps as BaseInputProps, SearchProps as BaseSearchProps } from "antd/lib/input";
import { FieldProps } from "formik";
import { Field } from "formik-antd";
import * as React from "react";
import Search from "antd/lib/input/Search";

interface FormikFieldProps {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate?: (value: any) => undefined | string | Promise<any>;
  fast?: boolean;
}

type InputProps = FormikFieldProps & BaseInputProps;

interface InputType
  extends React.ForwardRefExoticComponent<
    FormikFieldProps & BaseInputProps & React.RefAttributes<BaseInput>
  > {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Search: React.ForwardRefExoticComponent<FormikFieldProps & BaseSearchProps & React.RefAttributes<Search>>;
}

// eslint-disable-next-line react/display-name
const Input = React.forwardRef((
  { name, validate, fast, onChange: $onChange, onBlur: $onBlur, ...restProps }: InputProps,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  ref: React.Ref<Search>,
) => (
  <Field name={name} validate={validate} fast={fast}>
    {({ field: { value, onChange, onBlur } }: FieldProps) => (
      <BaseInput
        ref={ref}
        name={name}
        value={value}
        onChange={(event) => {
          onChange(event);
          $onChange && $onChange(event);
        }}
        onBlur={(event) => {
          onBlur(event);
          $onBlur && $onBlur(event);
        }}
        {...restProps}
      />
    )}
  </Field>
));

const TypedInput = (Input as unknown) as InputType;
type SearchProps = FormikFieldProps & BaseSearchProps;

// eslint-disable-next-line react/display-name
TypedInput.Search = React.forwardRef(
  (
    { name, validate, fast, onChange: $onChange, onBlur: $onBlur, ...restProps }: SearchProps,
    ref: React.Ref<BaseInput>,
  ) => (
    <Field name={name} validate={validate} fast={fast}>
      {({ field: { value, onChange, onBlur } }: FieldProps) => (
        <BaseInput.Search
          ref={ref}
          name={name}
          value={value}
          onChange={(event) => {
            onChange(event);
            $onChange && $onChange(event);
          }}
          onBlur={(event) => {
            onBlur(event);
            $onBlur && $onBlur(event);
          }}
          {...restProps}
        />
      )}
    </Field>
  ),
);

export default TypedInput.Search;
```

### Add contract address validation schema

The `formik` package we'll be using for building `FormCheckBalance` has great integration with `yup`, which allows us to use it to build validation schemas like the one we need for the contract address:

`App/forms/validationSchemas.ts`

```typescript
import * as Yup from "yup";
import { config } from "../../config";

const regexStartsWithPrefix = new RegExp(`^${config.addressPrefix}`);

const addressShape = {
  address: Yup.string()
    .matches(regexStartsWithPrefix, `"${config.addressPrefix}" prefix required`)
    .length(39 + config.addressPrefix.length, "Address invalid"),
};

export const searchValidationSchema = Yup.object().shape(addressShape);
```

### FormCheckBalance implementation

The `routes/Balance/components/FormCheckBalance.tsx` file would be this:

```jsx
import { Formik } from "formik";
import { Form, FormItem } from "formik-antd";
import React from "react";
import Search from "../../../forms/Search";
import { searchValidationSchema } from "../../../forms/validationSchemas";

interface FormCheckBalanceProps {
  readonly setContractAddress: (value: React.SetStateAction<string>) => void;
}

export function FormCheckBalance({ setContractAddress }: FormCheckBalanceProps): JSX.Element {
  return (
    <Formik
      initialValues={{ address: "" }}
      validationSchema={searchValidationSchema}
      onSubmit={(values) => {
        setContractAddress(values.address);
      }}
    >
      {(formikProps) => (
        <Form>
          <FormItem name="address">
            <Search
              name="address"
              placeholder="Enter contract address"
              enterButton
              onSearch={formikProps.submitForm}
            />
          </FormItem>
        </Form>
      )}
    </Formik>
  );
}
```

It uses the address validation schema defined before, and has a `setContractAddress` param to update the state of the `Balance` route.

## Add TokenList component

With `FormCheckBalance` working, we just need to implement `TokenList`.

This component will:

1. Check if there is a contract address:
- If not, get the native balance from the `useAccount` hook.
- If yes, load the balance and the number of decimals for the CW20 contract token.
- If address has no contract, show error.
2. Display the balance:
- Use the local `getCoinToDisplay()` utility to get a user friendly format for balance, be it native or CW20.
- Use the `showTokens` flag for conditional rendering to avoid display issues when waiting for async data to load.

The `TokenList` implementation for achieving this would be:

`routes/Balance/components/TokenList/index.tsx`

```jsx
import { CW20, nativeCoinToDisplay, useAccount, useError, useSdk } from "@cosmicdapp/logic";
import { Coin, coins } from "@cosmjs/launchpad";
import { Decimal } from "@cosmjs/math";
import { Divider, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { config } from "../../../../../config";
import { TokenItem, TokenStack } from "./style";

const { Text } = Typography;

interface TokenListProps {
  readonly contractAddress: string;
}

export function TokenList({ contractAddress }: TokenListProps): JSX.Element {
  const { setError, clearError } = useError();
  const { getClient } = useSdk();
  const { account } = useAccount();

  const [balance, setBalance] = useState<readonly Coin[]>([]);
  const [decimals, setDecimals] = useState<number>();

  useEffect(() => {
    if (!contractAddress) {
      setBalance(account.balance);
      setDecimals(undefined);
      clearError();
      return;
    }

    const client = getClient();

    (async function updateBalance() {
      try {
        const contract = await client.getContract(contractAddress);
        const cw20Contract = CW20(client).use(contract.address);
        const [{ symbol: denom, decimals }, balance] = await Promise.all([
          cw20Contract.tokenInfo(),
          cw20Contract.balance(),
        ]);
        const amount = parseInt(balance, 10);

        setBalance(coins(amount, denom));
        setDecimals(decimals);
        clearError();
      } catch {
        setError("No contract found in that address");
        setBalance([]);
        setDecimals(undefined);
      }
    })();
  }, [account.balance, getClient, contractAddress, clearError, setError]);

  function getCoinToDisplay(coin: Coin): Coin {
    if (contractAddress && decimals) {
      const amountFromDecimal = Decimal.fromAtomics(coin.amount, decimals).toString();
      return { denom: coin.denom, amount: amountFromDecimal };
    }

    return nativeCoinToDisplay(coin, config.coinMap);
  }

  const isCw20Token = contractAddress && decimals !== undefined;
  const isNativeToken = !contractAddress && decimals === undefined;
  const showTokens = isCw20Token || isNativeToken;

  return (
    showTokens && (
      <TokenStack>
        {balance.map((token, index) => {
          const { denom, amount } = getCoinToDisplay(token);

          return (
            <React.Fragment key={token.denom}>
              {index > 0 && <Divider />}
              <TokenItem>
                <Text>{denom}</Text>
                <Text>{amount !== "0" ? amount : "No tokens"}</Text>
              </TokenItem>
            </React.Fragment>
          );
        })}
      </TokenStack>
    )
  );
}
```

`routes/Balance/components/TokenList/style.ts`

```jsx
import { Stack } from "@cosmicdapp/design";
import styled from "styled-components";

export const TokenStack = styled(Stack)`
  & > * {
    --gap: 0;
  }
`;

export const TokenItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  span {
    font-family: var(--ff-iceland);
    font-size: var(--s2);
  }

  span + span {
    font-weight: bolder;
    font-family: var(--ff-montserrat);
    font-size: var(--s1);
  }
`;
```

## Finished!

Now you can check your native balances and your balance for any CW20 contract, and most importantly, you now know how to build a CosmJS based dApp!
