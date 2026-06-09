import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Data hooks load on mount via `useEffect(() => { load() }, [load])`, where
    // `load` is async and only calls setState *after* awaiting Supabase — so the
    // updates are deferred past the await, not synchronous. set-state-in-effect
    // flags this as a false positive, so turn it off for hooks only (it stays on
    // for components, where a truly synchronous setState-in-effect is the real risk).
    files: ['src/hooks/**/*.{js,jsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
