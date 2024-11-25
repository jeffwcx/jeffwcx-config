import pluginVite from '@vitest/eslint-plugin';
import { GLOB_TESTS } from '../globs';
import { isInEditor } from '../utils';
import type { DefineConfig } from '../types';

export const test: DefineConfig = (options) => {
  const { overrides, files = GLOB_TESTS } = options;
  return [
    {
      name: 'jeffwcx/test/setup',
      plugins: {
        test: pluginVite,
      },
    },
    {
      name: 'jeffwcx/test/rules',
      files,
      rules: {
        'test/consistent-test-it': [
          'error',
          { fn: 'it', withinDescribe: 'it' },
        ],
        'test/no-identical-title': 'error',
        'test/no-import-node-test': 'error',
        'test/no-only-tests': isInEditor ? 'off' : 'error',

        'test/prefer-hooks-in-order': 'error',
        'test/prefer-lowercase-title': 'error',

        // Disables
        ...{
          'no-unused-expressions': 'off',
          'node/prefer-global/process': 'off',
          'ts/explicit-function-return-type': 'off',
        },
        ...overrides,
      },
    },
  ];
};
