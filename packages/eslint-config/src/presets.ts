import {
  comments,
  ignores,
  imports,
  javascript,
  jsonc,
  node,
  prettier,
  sortTsconfig,
  typescript,
} from './configs';
import { createPreset } from './utils';

export const presetJavaScript = createPreset([
  ignores,
  javascript,
  comments,
  imports,
  node,
]);

export const presetJsonc = createPreset([jsonc, sortTsconfig]);

export const presetBasic = createPreset([
  ignores,
  javascript,
  comments,
  imports,
  node,
  typescript,
]);

export const presetAll = createPreset([presetBasic, presetJsonc, prettier]);

export { presetBasic as basic, presetAll as all };
