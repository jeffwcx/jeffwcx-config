import { defineConfig } from 'tsup';

export default defineConfig([
  {
    name: 'gitignore',
    entry: ['src/index.ts'],
    format: 'esm',
    outDir: 'dist',
    platform: 'node',
    treeshake: true,
    dts: true,
    sourcemap: true,
  },
]);
