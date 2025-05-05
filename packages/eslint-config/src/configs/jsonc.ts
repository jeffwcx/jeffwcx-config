import * as parserJsonc from 'jsonc-eslint-parser';
import * as pluginJsonc from 'eslint-plugin-jsonc';

import { GLOB_JSON, GLOB_JSON5, GLOB_JSONC } from '../globs';
import type { ESLint } from 'eslint';
import type { Rules } from 'eslint-define-config';
import type { DefineConfig } from '../types';

export const jsonc: DefineConfig = (options) => {
  const { overrides, files = [GLOB_JSON, GLOB_JSON5, GLOB_JSONC] } = options;
  return [
    {
      name: 'jeffwcx/jsonc',
      files,
      languageOptions: {
        parser: parserJsonc,
      },
      plugins: {
        jsonc: pluginJsonc as unknown as ESLint.Plugin,
      },
      rules: {
        ...(pluginJsonc.configs['recommended-with-jsonc']
          .rules as unknown as Rules),
        ...overrides,
      },
    },
  ];
};
