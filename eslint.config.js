import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // If you plan to use Jest for your AI logic
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
  {
    // Ignore these folders globally
    ignores: ['**/dist/**', '**/node_modules/**', '.turbo/**'],
  },
]
