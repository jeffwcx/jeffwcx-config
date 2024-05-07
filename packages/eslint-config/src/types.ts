import type { FlatESLintConfig } from 'eslint-define-config';

export interface BaseConfig {
  comments?: boolean;
  ignores?: boolean;
  imports?: boolean;
  javascript?: boolean;
  jsonc?: boolean;
  node?: boolean;
  prettier?: boolean;
  sort?: boolean;
  sortTsconfig?: boolean;
  typescript?: boolean;
}

export interface ConfigOptions extends BaseConfig {
  /**
   * Whether to enable `.gitignore` as eslint ignore, the default is true
   */
  gitignore?: boolean;
  /**
   * Configuration override
   */
  overrides?: { [k in keyof BaseConfig]?: FlatESLintConfig[] };
}

export type DefineConfig = (
  options: Required<ConfigOptions>,
) => FlatESLintConfig[];
