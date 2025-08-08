// This file has been renamed to .eslintrc.cjs to fix module compatibility issues
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'import', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Prevent import/export mismatches
    'import/no-unresolved': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    // Ensure consistent import/export style
    'import/no-anonymous-default-export': 'warn',
    'import/prefer-default-export': 'off', // Allow named exports
    // Require explicit default exports
    'import/no-default-export': 'off',
  },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      typescript: { project: './tsconfig.json' }
    }
  }
} 