import tseslint from 'typescript-eslint';
import { GLOB_TS, GLOB_TSX } from '../globs';
import { restrictedSyntaxJs } from './javascript';
import type { DefineConfig } from '../types';
import type { FlatESLintConfig } from 'eslint-define-config';

export const typescript: DefineConfig = (options) => {
  const { overrides, files = [GLOB_TS, GLOB_TSX] } = options;
  return tseslint.config({
    name: 'jeffwcx/ts',
    extends: [...tseslint.configs.recommended],
    files,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/method-signature-style': ['error', 'property'], // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-redeclare': 'error',

      // handled by unused-imports/no-unused-imports
      '@typescript-eslint/no-unused-vars': 'off',

      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/prefer-literal-enum-member': [
        'error',
        { allowBitwiseExpressions: true },
      ],

      'no-restricted-syntax': [
        'error',
        ...restrictedSyntaxJs,
        'TSEnumDeclaration[const=true]',
      ],
      ...overrides,
    },
  }) as FlatESLintConfig[];
};
