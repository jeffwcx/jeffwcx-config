import * as _configPrettier from 'eslint-config-prettier';
import * as _pluginPrettier from 'eslint-plugin-prettier';
import { interopDefault } from '../utils';
import type { DefineConfig } from '../types';

const configPrettier = interopDefault(_configPrettier);
const pluginPrettier = interopDefault(_pluginPrettier);

const prettierConflictRules = { ...configPrettier.rules };
delete prettierConflictRules['vue/html-self-closing'];

export const prettier: DefineConfig = ({ prettier: enable, overrides }) => {
  if (!enable) return [];
  return [
    {
      plugins: {
        prettier: pluginPrettier,
      },
      rules: {
        ...prettierConflictRules,
        ...pluginPrettier.configs.recommended.rules,
        'prettier/prettier': 'warn',
      },
    },
    ...(overrides.prettier || []),
  ];
};
