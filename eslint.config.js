import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        Response: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
];
