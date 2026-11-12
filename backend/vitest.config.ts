import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
    },
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text'],
      include: [
        'src/app.ts',
        'src/config/**/*.ts',
        'src/domain/**/*.ts',
        'src/lib/**/*.ts',
        'src/middleware/**/*.ts',
        'src/routes/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        'src/domain/models/index.ts',
        'src/lib/prisma.ts',
        'src/middleware/request-logger.ts',
      ],
      thresholds: {
        lines: 90,
        statements: 88,
        functions: 90,
        branches: 70,
      },
    },
  },
})
