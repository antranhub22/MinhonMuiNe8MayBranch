import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Cấu hình vitest cho test voice assistant
 * Tách biệt với cấu hình test chính để có môi trường test riêng
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'setup.ts']
    },
    reporters: ['default', 'json'],
    outputFile: 'voice-test-results.json'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../client/src'),
    },
  },
}); 