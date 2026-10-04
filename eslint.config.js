import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/**
 * GyroERP frontend lint config.
 *
 * Modular architecture (see ARCHITECTURE.md):
 *   erp/     → shared ERP building blocks: may not import modules/
 *   modules/ → self-contained; other modules only via @/modules/<name>
 *   routes/  → thin loaders; may deep-import module pages
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'src/routeTree.gen.ts'] },

  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*/*'],
              message:
                'Deep module imports are forbidden — use the module public API: @/modules/<name>',
            },
            {
              group: ['@/routes/*', '@/routes'],
              message: 'Never import from routes/.',
            },
            {
              group: ['@/ui', '@/ui/*'],
              message: 'The legacy ui/ design system was removed — use antd and @/erp building blocks.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/erp/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules', '@/modules/*', '@/routes', '@/routes/*'],
              message:
                'erp/ building blocks are shared by all modules — they must never depend on a specific module.',
            },
            {
              group: ['@/ui', '@/ui/*'],
              message: 'Use antd instead of the removed ui/ layer.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/routes/**/*.{ts,tsx}', 'src/main.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
)
