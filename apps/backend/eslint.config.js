const nearworldConfig = require('@nearworld/eslint-config')

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  ...nearworldConfig,
  {
    // Backend-specific overrides
    rules: {
      'no-console': 'off', // Backend needs console.log for server logs
    },
  },
]
