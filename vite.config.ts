import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const resolvePath = (relative: string): string =>
  fileURLToPath(new URL(relative, import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Bare `@app-types` resolves to the barrel index; must be matched before
      // the subpath rule so it is not rewritten into `index.ts/...`.
      { find: /^@app-types$/, replacement: resolvePath('./src/app-types/index.ts') },
      { find: /^@app-types\//, replacement: `${resolvePath('./src/app-types')}/` },
      { find: '@components', replacement: resolvePath('./src/components') },
      { find: '@lib', replacement: resolvePath('./src/lib') },
      { find: '@data', replacement: resolvePath('./src/data') },
      { find: '@hooks', replacement: resolvePath('./src/hooks') },
      { find: '@providers', replacement: resolvePath('./src/providers') },
      { find: '@pages', replacement: resolvePath('./src/pages') },
      // `@/` must be last so the more specific aliases take precedence.
      { find: /^@\//, replacement: `${resolvePath('./src')}/` },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Parse/handle CSS so component imports of stylesheets do not error.
    css: true,
  },
});
