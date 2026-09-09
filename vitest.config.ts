import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

/**
 * Die Komponenten werden mit @vue/test-utils in happy-dom gemountet — ohne
 * Nuxt-Boot. Zwei virtuelle Module braucht es dafür als Ersatz: `#imports`
 * (Route und Router für die Reiter) und `#components` (NuxtLink).
 *
 * Nuxt-UI-Komponenten werden je Test gestubbt, nicht global: welcher Stub
 * passt, hängt davon ab, was der Fall prüfen will.
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '#imports': fileURLToPath(new URL('./tests/imports-stub.ts', import.meta.url)),
      '#components': fileURLToPath(new URL('./tests/components-stub.ts', import.meta.url)),
    },
  },
})
