import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
  ],
  test: {
    environment: 'node',
    globals: true,
    // 👇 Tell Vitest to use tsconfig.vitest.json
    deps: {
      inline: [/chia-wallet-sdk-wasm/],
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
