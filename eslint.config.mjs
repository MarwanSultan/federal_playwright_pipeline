import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'evidence', 'scripts'] },
  {
    ...eslint.configs.recommended,
    languageOptions: {
      globals: { URL: 'readonly', console: 'readonly' },
    },
  },
  ...tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
);
