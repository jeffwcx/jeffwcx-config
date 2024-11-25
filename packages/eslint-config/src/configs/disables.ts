import { GLOB_SRC, GLOB_SRC_EXT } from '../globs';
import type { DefineConfig } from '../types';

export const disables: DefineConfig = () => {
  return [
    {
      name: 'jeffwcx/disables/cli',
      files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
      rules: {
        'no-console': 'off',
      },
    },
    {
      name: 'jeffwcx/disables/scripts',
      files: [`**/scripts/${GLOB_SRC}`],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      name: 'jeffwcx/disables/dts',
      files: ['**/*.d.?(cm)ts'],
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'import/no-duplicates': 'off',
        'unused-imports/no-unused-vars': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
    {
      name: 'jeffwcx/disables/cjs',
      files: ['**/*.js', '**/*.cjs'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ];
};
