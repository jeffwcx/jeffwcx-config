import process from 'node:process';
import { isPackageExists } from 'local-pkg';
import type { ConfigOptions, DefineConfig } from './types';
import type { FlatESLintConfig } from 'eslint-define-config';

export type InteropDefault<T> = T extends { default: infer U } ? U : T;

/* #__NO_SIDE_EFFECTS__ */
export function interopDefault<T>(m: T): InteropDefault<T> {
  return (m as any).default || m;
}

export const isInEditor = !!(
  (process.env.VSCODE_PID ||
    process.env.VSCODE_CWD ||
    process.env.JETBRAINS_IDE ||
    process.env.VIM) &&
  !process.env.CI
);

export const hasTypeScript = isPackageExists('typescript');

const defineConfigOptions: Required<ConfigOptions> = {
  overrides: {},
  prettier: true,
  gitignore: true,
  comments: true,
  ignores: true,
  imports: true,
  javascript: true,
  jsonc: true,
  node: true,
  sort: true,
  sortTsconfig: true,
  typescript: true,
};

export function transformOptions(options: ConfigOptions) {
  return Object.assign(defineConfigOptions, options);
}

export function createPreset(dcs: DefineConfig[]) {
  return (options: ConfigOptions) => {
    const context = transformOptions(options);
    return dcs.reduce((config, dc) => {
      config.push(...dc(context));
      return config;
    }, [] as FlatESLintConfig[]);
  };
}
