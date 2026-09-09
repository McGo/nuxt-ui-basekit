/**
 * Entwicklungs-Harnisch für den Layer.
 *
 * Bindet das Paket so ein, wie es ein Konsument täte — über den Paketnamen,
 * nicht über einen relativen Pfad. `file:..` in der package.json legt dafür
 * einen Symlink, Änderungen am Layer greifen also sofort.
 *
 * Der Playground wird nicht mitveröffentlicht: `files` in der package.json des
 * Pakets führt ihn nicht auf.
 */
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  extends: ['nuxt-ui-basekit'],

  // Tailwind und das Theme von Nuxt UI. Der Layer lädt sein eigenes
  // Stylesheet mit den --basekit-*-Token dazu — dort steht nur, was die
  // Komponenten an Farben brauchen, keine Utilities.
  css: ['~/assets/css/main.css'],

  devtools: { enabled: false },
  ssr: true,

  // Feste Farbwahl, damit die Aufnahmen nicht davon abhängen, was das
  // Betriebssystem des Aufnehmenden gerade bevorzugt.
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  vite: {
    resolve: {
      // Eigenheit des Symlinks, nicht des Pakets: `node_modules/nuxt-ui-basekit`
      // zeigt auf das Repo-Wurzelverzeichnis, und von dort aus findet die
      // Auflösung zuerst die Dev-Abhängigkeiten des Layers. Ohne `dedupe`
      // laufen zwei Pinia-Instanzen nebeneinander und `useConfirmStore()`
      // sucht seinen Store in der falschen — „getActivePinia() was called but
      // there was no active Pinia".
      //
      // Ein echter Konsument hat das Problem nicht: dort bringt das
      // installierte Paket keine eigenen node_modules mit.
      dedupe: ['pinia', 'vue', 'vue-router'],
    },
  },
})
