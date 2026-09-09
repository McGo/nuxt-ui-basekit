import { fileURLToPath } from 'node:url'

/**
 * BaseKit als Nuxt-Layer.
 *
 * Der Layer registriert die Komponenten global und meldet die Composables und
 * den Store für die Auto-Imports an. Er bringt bewusst **kein** UI-Modul mit:
 * `@nuxt/ui` und `pinia` sind Peers, weil sie im Konsumenten ohnehin stehen
 * und zwei Instanzen desselben Moduls sich in die Quere kommen.
 *
 * Die CSS-Datei trägt die Voreinstellungen der `--basekit-*`-Token. Wer eigene
 * Farben führt, überschreibt sie in seinem eigenen Stylesheet — das nach
 * diesem geladen wird.
 */
export default defineNuxtConfig({
  $meta: {
    name: 'nuxt-ui-basekit',
  },

  css: ['nuxt-ui-basekit/app/assets/css/basekit.css'],

  // Ohne Pfad-Präfix registrieren: `app/components/charts/BaseKitChartDonut.vue`
  // wird zu `<BaseKitChartDonut>`, nicht `<ChartsBaseKitChartDonut>`.
  // Absoluter Pfad, weil `~/components` im Konsumenten auf dessen Ordner
  // zeigen würde.
  components: [
    {
      path: fileURLToPath(new URL('./app/components', import.meta.url)),
      pathPrefix: false,
    },
  ],

  imports: {
    dirs: [
      fileURLToPath(new URL('./app/composables', import.meta.url)),
      fileURLToPath(new URL('./app/stores', import.meta.url)),
    ],
  },

  alias: {
    'nuxt-ui-basekit': fileURLToPath(new URL('./', import.meta.url)),
  },
})
