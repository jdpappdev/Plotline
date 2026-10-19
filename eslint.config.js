import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'e2e/__screenshots__/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-cycle': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            'Direct calls to Date.now() are banned outside lib/clock.ts. Use getNowTimestamp() from lib/clock.',
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            'Direct calls to new Date() without arguments are banned outside lib/clock.ts. Use getNow() from lib/clock.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'store',
              message: 'Do not import from store in domain/ files.',
            },
            {
              name: 'components',
              message: 'Do not import from components in domain/ files.',
            },
            {
              name: 'ui',
              message: 'Do not import from ui in domain/ files.',
            },
          ],
          patterns: ['domain/**/store', 'domain/**/components', 'domain/**/ui'],
        },
      ],
    },
  },
  {
    files: ['src/lib/clock.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
