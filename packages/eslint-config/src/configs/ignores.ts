import fs from 'node:fs';
import parse from 'parse-gitignore';
import { findUpSync } from 'find-up';
import { GLOB_EXCLUDE } from '../globs';
import type { DefineConfig } from '../types';

const GITIGNORE = '.gitignore' as const;

export const ignores: DefineConfig = (options) => {
  const { gitignore = true, userIgnores = [] } = options;
  let ignorePatterns: string[] = [];
  if (!gitignore) {
    ignorePatterns = GLOB_EXCLUDE;
  } else {
    const ignoreFile = findUpSync(GITIGNORE);
    if (!ignoreFile) {
      ignorePatterns = GLOB_EXCLUDE;
    } else {
      const ignoreContent = fs.readFileSync(ignoreFile, 'utf-8');
      const parsed = parse(ignoreContent);
      const globs = parsed.globs();
      for (const glob of globs) {
        if (glob.type === 'ignore') ignorePatterns.push(...glob.patterns);
        else if (glob.type === 'unignore')
          ignorePatterns.push(
            ...glob.patterns.map((pattern: string) => `!${pattern}`),
          );
      }
    }
  }

  return [
    {
      name: 'jeffwcx/ignores',
      ignores: [...ignorePatterns, ...userIgnores],
    },
  ];
};
