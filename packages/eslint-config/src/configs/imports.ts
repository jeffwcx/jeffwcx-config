import pluginImport from 'eslint-plugin-import-x';
import type { DefineConfig } from '../types';

export const imports: DefineConfig = ({ imports: enable, overrides }) => {
  if (!enable) return [];
  return [
    {
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
          'error',
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
      },
    },
    ...(overrides.imports || []),
  ];
};
