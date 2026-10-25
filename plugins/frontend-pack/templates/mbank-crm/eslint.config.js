import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Vite scaffold + TanStack Query rules. The full team config (layers, 150 lines, one component
// per file) is in frontend-pack react-architecture references/eslint-config.md.
export default defineConfig([
  globalIgnores(['dist', 'public/mockServiceWorker.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Kit primitives and CRM blocks export cva variants and types next to components.
    files: ['src/shared/ui/**/*.tsx', 'src/shared/components/crm/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
