const globals = require('globals');
const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'max-len': ['error', { code: 200 }],
      'arrow-parens': ['error', 'as-needed'],
      'linebreak-style': 'off',
      'object-curly-newline': 'off',
      'react/forbid-prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-underscore-dangle': 'off',
      'no-param-reassign': 'off',
      'no-console': 'off',
      'class-methods-use-this': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
    },
  },
];
