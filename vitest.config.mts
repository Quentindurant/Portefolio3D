import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/lib/**/*.ts', 'src/hooks/**/*.ts', 'src/components/ui/**/*.tsx', 'src/app/api/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
