import { all } from './presets';
import type { FlatESLintConfig } from 'eslint-define-config';
import type { ConfigOptions } from './types';

/**
 * jeffwcx eslint config
 * @param config flat eslint config
 * @param options
 */
export function config(
  config: FlatESLintConfig | FlatESLintConfig[] = [],
  options: ConfigOptions,
) {
  const configs = all(options);
  if (Object.keys(config).length > 0) {
    configs.push(...(Array.isArray(config) ? config : [config]));
  }
  return configs;
}

export * from './presets';
export * from './globs';
export type * from './types';
