import * as parserJsonc from 'jsonc-eslint-parser';
import * as pluginJsonc from 'eslint-plugin-jsonc';

import { GLOB_JSON, GLOB_JSON5, GLOB_JSONC } from '../globs';
import type { Rules } from 'eslint-define-config';
import type { DefineConfig } from '../types';

export const jsonc: DefineConfig = ({ jsonc: enable, overrides }) => {
  if (!enable) return [];
  return [
    {
      files: [GLOB_JSON, GLOB_JSON5, GLOB_JSONC],
      languageOptions: {
        parser: parserJsonc,
      },
      plugins: {
        jsonc: pluginJsonc,
      },
      rules: pluginJsonc.configs['recommended-with-jsonc']
        .rules as unknown as Rules,
    },
    ...(overrides.jsonc || []),
  ];
};
