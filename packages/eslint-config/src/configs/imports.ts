import pluginImport from 'eslint-plugin-import-x';
import type { DefineConfig } from '../types';

export const imports: DefineConfig = ({ overrides }) => {
  return [
    {
      name: 'jeffwcx/imports',
      plugins: {
        import: pluginImport,
      },
      rules: {
        'import/export': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-duplicates': 'error',
        'import/no-webpack-loader-syntax': 'error',
        'import/first': 'error',
        'import/order': [
          'warn',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
              'object',
              'type',
            ],
            pathGroups: [{ group: 'internal', pattern: '{{@,~}/,#}**' }],
          },
        ],
        ...overrides,
      },
    },
  ];
};
