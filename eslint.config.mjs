import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'actions-runner/**',
      '.cache/**',
      'backups/**',
      'certbot/**',
      'nginx-logs/**',
      'ssl/**',
      'security-tests/**',
      '.semgrep/**',
      'prisma/**',
      'scripts/**',
      '**/*.js',
      '**/*.mjs',
      'next-env.d.ts',
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The codebase predates linting; these style findings are reported as warnings so the gate
      // blocks on real problems. Tighten them once the backlog is cleared.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/no-unescaped-entities': 'warn',
      // React Compiler advisory rules added in eslint-plugin-react-hooks 7 (eslint-config-next 16).
      // The app does not use the React Compiler, so these are reported rather than blocking.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      // Crashes with ESLint 9.39 + typescript-eslint 8.72 (default-options incompatibility). Style rule only.
      '@typescript-eslint/no-unused-expressions': 'off',
      // Plain <img> is used for third-party album art whose hosts are not known at build time.
      '@next/next/no-img-element': 'off',
      // Security-relevant rules stay as errors.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'react/no-danger': 'error',
    },
  },
]

export default config
