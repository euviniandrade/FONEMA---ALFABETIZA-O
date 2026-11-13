import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/test/*.test.ts', 'web/src/**/*.test.ts'],
    environment: 'node'
  }
});
