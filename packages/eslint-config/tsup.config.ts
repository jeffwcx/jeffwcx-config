import { defineConfig } from 'tsup';

export default defineConfig([
  {
    name: 'eslint-config',
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    platform: 'node',
    treeshake: true,
    dts: true,
  },
]);
