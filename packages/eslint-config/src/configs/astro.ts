import { DefineConfig } from '../types';
import pluginAstro from 'eslint-plugin-astro';
import parserAstro from 'astro-eslint-parser';
import tseslint from 'typescript-eslint';
import { GLOB_ASTRO } from '../globs';
import type { FlatESLintConfig } from 'eslint-define-config';

export const astro: DefineConfig = (options) => {
  const { files = [GLOB_ASTRO], overrides } = options;
  return [
    {
      name: 'jeffwcx/astro/setup',
      plugins: {
        astro: pluginAstro,
      },
    },
    ...(tseslint.config({
      name: 'jeffwcx/astro/rules',
      files,
      languageOptions: {
        globals: pluginAstro.environments.astro.globals,
        parser: parserAstro,
        parserOptions: {
          extraFileExtensions: ['.astro'],
          parser: tseslint.parser,
        },
        sourceType: 'module',
      },
      processor: 'astro/client-side-ts',
      rules: {
        // use recommended rules
        'astro/missing-client-only-directive-value': 'error',
        'astro/no-conflict-set-directives': 'error',
        'astro/no-deprecated-astro-canonicalurl': 'error',
        'astro/no-deprecated-astro-fetchcontent': 'error',
        'astro/no-deprecated-astro-resolve': 'error',
        'astro/no-deprecated-getentrybyslug': 'error',
        'astro/no-set-html-directive': 'off',
        'astro/no-unused-define-vars-in-style': 'error',
        'astro/semi': 'off',
        'astro/valid-compile': 'error',
        ...overrides,
      },
    }) as FlatESLintConfig[]),
  ];
};
