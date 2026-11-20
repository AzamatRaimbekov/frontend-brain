import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...tseslint.configs.recommended,
  js.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // globals: { window: 'readonly', document: 'readonly' },
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.node,
        ymaps: 'readonly',
        DeepPartial: 'readonly',
        AppDispatch: 'readonly',
        RootState: 'readonly',
        ReduxStoreWithManager: 'readonly',
        StateSchemaKey: 'readonly',
        ReducersList: 'readonly',
        ParamKey: 'readonly',
        GlobalParams: 'readonly',
        AllPageParams: 'readonly',
        CommonQuery: 'readonly',
        AllParams: 'readonly',
      },
      parserOptions: {
        jsx: true,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': tsPlugin,
      prettier,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // Base
      'prettier/prettier': ['error'],

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'error',

      // React Hooks
      'react-hooks/exhaustive-deps': 'warn',

      // Function Style
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-empty-interface': 'error',

      // Comment: We removed the ban-types rule as it's not available
      // You can add a rule to ban React.FC when you find the correct rule name
      // for your @typescript-eslint version

      // Naming Convention - simplified to match ESLint 9.x requirements
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'function',
          format: ['camelCase'],
          prefix: ['use'],
          filter: {
            regex: '^use[A-Z]',
            match: true,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['PascalCase'],
          filter: {
            regex: '^(use|[a-z])',
            match: false,
          },
        },
      ],
    },
  },
  {
    ignores: [
      'dist',
      'node_modules',
      '*config.*',
      '*.json',
      'coverage',
      'build',
      'dev-dist',
      'Form',
    ],
  },
)
