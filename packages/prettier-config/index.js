/** @type {import("prettier").Config} */

module.exports = {
  plugins: ['prettier-plugin-packagejson'],
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};
