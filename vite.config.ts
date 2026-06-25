/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@logic': fileURLToPath(new URL('./src/logic', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@apptypes': fileURLToPath(new URL('./src/types', import.meta.url)),
    },
  },
  test: {
    // Browser-like DOM for React Testing Library.
    environment: 'jsdom',
    // Expose describe/it/expect without explicit imports.
    globals: true,
    // Registers jest-dom + jest-axe matchers before each test file.
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
