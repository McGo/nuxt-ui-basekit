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

  // Absoluter Pfad statt Paketname: So hängt das Stylesheet nicht davon ab,
  // ob der Konsument `nuxt-ui-basekit` selbst auflösen kann.
  css: [fileURLToPath(new URL('./app/assets/css/basekit.css', import.meta.url))],

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

  // Bewusst kein `alias` auf `nuxt-ui-basekit`: Er verdeckt die `exports` aus
  // package.json, und `nuxt-ui-basekit/labels` bricht dann den
  // Produktions-Build im Konsumenten. tests/grenze.test.ts wacht darüber.
})
