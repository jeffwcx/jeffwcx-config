# @jeffwcx/eslint-config

## Features

- Format with Prettier
- Designed to work with TypeScript/Node
- Sort
  - Import Statement sort
  - package.json sort
  - tsconfig.json sort

## Usage

```ts
import { config } from '@jeffwcx/eslint-config';

export default config(
  [
    // custom config
  ],
  {
    prettier: true,
    gitignore: true,
  },
);
```
