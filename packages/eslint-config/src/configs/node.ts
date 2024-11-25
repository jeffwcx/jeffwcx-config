import _pluginNode from 'eslint-plugin-n';
import { interopDefault } from '../utils';
import type { DefineConfig } from '../types';
const pluginNode = interopDefault(_pluginNode);

export const node: DefineConfig = ({ overrides }) => {
  return [
    {
      name: 'jeffwcx/node',
      plugins: {
        node: pluginNode,
      },
      rules: {
        'node/handle-callback-err': ['error', '^(err|error)$'],
        'node/no-deprecated-api': 'error',
        'node/no-exports-assign': 'error',
        'node/no-new-require': 'error',
        'node/no-path-concat': 'error',
        'node/no-unsupported-features/es-builtins': 'error',
        'node/prefer-global/buffer': ['error', 'never'],
        'node/prefer-global/process': ['error', 'never'],
        'node/process-exit-as-throw': 'error',
        ...overrides,
      },
    },
  ];
};
