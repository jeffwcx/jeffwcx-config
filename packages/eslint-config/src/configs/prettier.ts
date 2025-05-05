import { rules } from 'eslint-config-prettier';
import * as _pluginPrettier from 'eslint-plugin-prettier';
import { interopDefault } from '../utils';
import type { DefineConfig } from '../types';

const pluginPrettier = interopDefault(_pluginPrettier);

const prettierConflictRules = { ...rules };
delete prettierConflictRules['vue/html-self-closing'];

export const prettier: DefineConfig = ({ overrides }) => {
  return [
    {
      name: 'jeffwcx/prettier',
      plugins: {
        prettier: pluginPrettier,
      },
      rules: {
        ...prettierConflictRules,
        // @ts-ignore
        ...pluginPrettier?.configs?.recommended?.rules,
        'prettier/prettier': 'warn',
        ...overrides,
      },
    },
  ];
};
