import {
  astro,
  comments,
  disables,
  ignores,
  imports,
  javascript,
  jsonc,
  node,
  prettier,
  sortTsconfig,
  test,
  typescript,
} from './configs';
import { createPreset } from './utils';

export const presetJavaScript = createPreset({
  ignores,
  javascript,
  comments,
  imports,
  node,
});

export const presetJsonc = createPreset({
  jsonc,
  sortTsconfig,
});

export const presetBasic = createPreset({
  ignores,
  javascript,
  comments,
  imports,
  node,
  typescript,
  test,
  disables,
});

export const presetAll = createPreset(
  {
    prettier,
    astro,
  },
  [presetBasic, presetJsonc],
);

export { presetBasic as basic, presetAll as all };
