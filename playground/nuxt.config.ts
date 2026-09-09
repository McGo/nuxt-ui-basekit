/**
 * Development harness for the layer.
 *
 * Pulls the package in the way a consumer would — through the package name,
 * not a relative path. `file:..` in package.json creates the symlink for that,
 * so changes to the layer take effect immediately.
 *
 * The playground is not published along: `files` in the package's package.json
 * does not list it.
 */
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  extends: ['nuxt-ui-basekit'],

  // Tailwind and the Nuxt UI theme. The layer loads its own stylesheet with
  // the --basekit-* tokens on top of that — which holds only the colours the
  // components need, no utilities.
  css: ['~/assets/css/main.css'],

  devtools: { enabled: false },
  ssr: true,

  // A fixed colour mode, so the screenshots do not depend on what the
  // operating system of whoever takes them happens to prefer.
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  vite: {
    resolve: {
      // A quirk of the symlink, not of the package: `node_modules/nuxt-ui-basekit`
      // points at the repository root, and resolution from there finds the
      // layer's own dev dependencies first. Without `dedupe` two Pinia
      // instances run side by side and `useConfirmStore()` looks for its store
      // in the wrong one — "getActivePinia() was called but there was no
      // active Pinia".
      //
      // A real consumer does not have this problem: there the installed
      // package brings no node_modules of its own.
      dedupe: ['pinia', 'vue', 'vue-router'],
    },
  },
})
