# @jeffwcx/eslint-config

👉 inspector: [eslint-config.jeffwcx.me](https://eslint-config.jeffwcx.me)

## Features

- Format with Prettier
- Designed to work with TypeScript/Node
- Sort
  - Import Statement sort
  - package.json sort
  - tsconfig.json sort
- Framework support
  - Astro

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
    userIgnores: [], // add self defined ignore files
    overrides: {
      typescript: {}, // overrides typescript lint rules
    },
    files: {
      test: [], // self defined `tests` glob
    },
  },
);
```
