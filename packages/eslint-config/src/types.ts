import type { FlatESLintConfig } from 'eslint-define-config';

export interface BaseConfig {
  comments?: boolean;
  imports?: boolean;
  javascript?: boolean;
  jsonc?: boolean;
  node?: boolean;
  prettier?: boolean;
  sort?: boolean;
  sortTsconfig?: boolean;
  typescript?: boolean;
  test?: boolean;
}

export interface BaseFiles {
  jsonc?: string[];
  test?: string[];
  typescript?: string[];
  sortTsconfig?: string[];
}

export interface ConfigOptions extends BaseConfig {
  /**
   * Whether to enable `.gitignore` as eslint ignore, the default is true
   */
  gitignore?: boolean;
  /**
   * user's ignore files
   */
  userIgnores?: string[];
  /**
   * Configuration rules override
   */
  overrides?: { [k in keyof BaseConfig]?: FlatESLintConfig['rules'] };
  /**
   * Configuration files rewrite
   */
  files?: { [k in keyof BaseFiles]?: FlatESLintConfig['files'] };
}

export type DefineConfigOptions = Required<
  Omit<ConfigOptions, 'overrides' | 'files'>
> & {
  overrides: FlatESLintConfig['rules'];
  files: FlatESLintConfig['files'];
};

export type DefineConfig = (options: DefineConfigOptions) => FlatESLintConfig[];

export type Preset = (options: ConfigOptions) => FlatESLintConfig[];
