import fs from 'node:fs';
import parse from 'parse-gitignore';
import { findUpSync } from 'find-up';
import { GLOB_EXCLUDE } from '../globs';
import type { DefineConfig } from '../types';
import type { FlatESLintConfig } from 'eslint-define-config';

const GITIGNORE = '.gitignore' as const;

const defaultIgnores: FlatESLintConfig[] = [
  {
    ignores: GLOB_EXCLUDE,
  },
];

export const ignores: DefineConfig = ({ gitignore: enable, overrides }) => {
  if (!enable) {
    return defaultIgnores;
  }
  const ignoreFile = findUpSync(GITIGNORE);
  if (!ignoreFile) return defaultIgnores;
  const ignoreContent = fs.readFileSync(ignoreFile, 'utf-8');
  const ignores: string[] = [];
  const parsed = parse(ignoreContent);
  const globs = parsed.globs();
  for (const glob of globs) {
    if (glob.type === 'ignore') ignores.push(...glob.patterns);
    else if (glob.type === 'unignore')
      ignores.push(...glob.patterns.map((pattern: string) => `!${pattern}`));
  }
  return [
    {
      ignores,
    },
    ...(overrides.ignores || []),
  ];
};
