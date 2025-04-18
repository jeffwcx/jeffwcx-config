import process from 'node:process';
import { isPackageExists } from 'local-pkg';
import type {
  BaseConfig,
  BaseFiles,
  ConfigOptions,
  DefineConfig,
  DefineConfigOptions,
  Preset,
} from './types';
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
  userIgnores: [],
  comments: true,
  imports: true,
  javascript: true,
  jsonc: true,
  node: true,
  sort: true,
  sortTsconfig: true,
  typescript: true,
  test: true,
  files: {},
  astro: false,
};

export function transformOptions(options: ConfigOptions) {
  return Object.assign(
    {},
    defineConfigOptions,
    options,
  ) as Required<ConfigOptions>;
}

export function createPreset(
  dcs: Record<string, DefineConfig>,
  presets: Preset[] = [],
) {
  return (options: ConfigOptions) => {
    const context = transformOptions(options);
    const { overrides, files } = context;
    const flatConfigs: FlatESLintConfig[] = [];
    presets.reduce((config, preset) => {
      config.push(...preset(context));
      return config;
    }, flatConfigs);
    return Object.entries(dcs).reduce((config, [name, dc]) => {
      if (context[name as keyof BaseConfig] === false) return config;
      const configOptions: DefineConfigOptions = {
        ...context,
        overrides: overrides[name as keyof BaseConfig] || {},
        files: files[name as keyof BaseFiles],
      };
      config.push(...dc(configOptions));
      return config;
    }, flatConfigs);
  };
}
