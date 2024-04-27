import * as _pluginComments from 'eslint-plugin-eslint-comments';
import { interopDefault } from '../utils';
import type { DefineConfig } from '../types';
const pluginComments: any = interopDefault(_pluginComments);

export const comments: DefineConfig = ({ comments: enable, overrides }) => {
  if (!enable) return [];
  return [
    {
      plugins: {
        'eslint-comments': pluginComments,
      },
      rules: {
        ...pluginComments.configs.recommended.rules,
        'eslint-comments/disable-enable-pair': [
          'error',
          { allowWholeFile: true },
        ],
      },
    },
    ...(overrides.comments || []),
  ];
};
