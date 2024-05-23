import { defineConfig } from 'tsup';

export default defineConfig([
  {
    name: 'license',
    entry: ['src/index.ts'],
    format: 'esm',
    outDir: 'dist',
    platform: 'node',
    treeshake: true,
    dts: true,
    sourcemap: true,
  },
]);
