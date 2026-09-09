import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * Der einzige Draht zwischen den BaseKit-Komponenten und der Anwendung,
 * die sie einsetzt.
 *
 * Die Komponenten sollen in jedem Nuxt-Projekt laufen. Sie dürfen deshalb
 * weder `vue-i18n` aufrufen noch Übersetzungsschlüssel kennen: `t('common.search')`
 * gibt es nur in der einen Anwendung, die diesen Schlüssel führt, und ein
 * Paket, das solche Schlüssel voraussetzt, ist keins.
 *
 * Stattdessen reicht die Anwendung Sprache und Beschriftungen einmal herein —
 * in einem Plugin, das die Werte aus ihrer eigenen Quelle zieht:
 *
 *   // plugins/basekit.ts
 *   export default defineNuxtPlugin((nuxtApp) => {
 *     const config = computed(() => ({
 *       locale: 'de-DE',
 *       labels: { ...BASEKIT_DEFAULTS.labels, search: 'Suchen', cancel: 'Abbrechen' },
 *     }))
 *     nuxtApp.vueApp.provide(baseKitKey, config)
 *   })
 *
 * Wer eine andere Sprache fährt, überschreibt die Tabelle vollständig — die
 * Voreinstellung unten ist englisch und deckt nur den Fall ab, dass niemand
 * etwas bereitstellt.
 *
 * Wer nichts bereitstellt, bekommt die Voreinstellungen unten. Wichtig, wenn
 * die Werte aus einer i18n-Bibliothek kommen: `useI18n()` verlangt einen
 * Komponenten-Setup-Kontext und wirft im Plugin. Die Instanz gehört über
 * `nuxtApp.$i18n` geholt, und zwar erst beim Lesen des `computed`.
 *
 * Über `provide`/`inject`, nicht über `useNuxtApp()`: so laufen die
 * Komponenten auch in einem Vitest-Mount ohne Nuxt-Kontext, und unter SSR
 * teilen sich zwei Anfragen nichts.
 *
 * Einzelne Beschriftungen bleiben weiterhin als Prop überschreibbar — hier
 * steht nur, was ohne Zutun herauskommt.
 */
export interface BaseKitLabels {
  /** Suchfeld über Listen und Auswahl-Dialogen. */
  search: string
  /** Filter-Eintrag „ohne Einschränkung". */
  all: string
  select: string
  change: string
  edit: string
  cancel: string
  confirm: string
  /** Überschrift der Rückfrage, wenn der Aufrufer keine mitgibt. */
  confirmTitle: string
  /** Text der Rückfrage, wenn der Aufrufer keinen mitgibt. */
  confirmBody: string
  /** Leere Liste — es gibt noch nichts. */
  empty: string
  /** Leere Liste — die Suche greift, findet aber nichts. */
  noResults: string
  noResultsHint: string
  back: string
  view: string
  upload: string
  perPage: string
  iconChoose: string
  iconEmpty: string
  /** Auswahl aufheben — im Symbolwähler die leere Wahl. */
  iconClear: string
  chartAsTable: string
  chartAsChart: string
  /** „1–25 von 300" — als Funktion, weil die Zahlen mitten im Satz stehen. */
  paginationRange: (range: { from: number, to: number, total: number }) => string
  /**
   * Werkzeugleiste des Markdown-Editors. Eigene Gruppe, weil die Begriffe nur
   * dort vorkommen und die obere Ebene sonst zur Hälfte aus ihnen bestünde.
   */
  markdown: {
    bold: string
    italic: string
    h2: string
    h3: string
    bullet: string
    ordered: string
    quote: string
    code: string
    link: string
    /** Abfrage beim Setzen eines Links. */
    linkPrompt: string
  }
}

export interface BaseKitConfig {
  /**
   * BCP-47-Kennung für `Intl` — steuert Tausendertrennung, Prozent- und
   * Datumsformate in den Diagrammen.
   */
  locale: string
  labels: BaseKitLabels
}

/**
 * Voreinstellung: englisch. Das Paket weiß nicht, in welcher Sprache die
 * Anwendung läuft, und Englisch ist die Sprache, die am wenigsten Leser
 * ausschließt. Wer deutsch fährt, reicht `BASEKIT_DEFAULTS_DE` herein.
 */
export const BASEKIT_DEFAULTS: BaseKitConfig = {
  locale: 'en-US',
  labels: {
    search: 'Search',
    all: 'All',
    select: 'Select',
    change: 'Change',
    edit: 'Edit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    confirmTitle: 'Are you sure?',
    confirmBody: 'This action cannot be undone.',
    empty: 'Nothing here yet',
    noResults: 'No matches',
    noResultsHint: 'Try a different spelling or fewer filters.',
    back: 'Back to overview',
    view: 'View',
    upload: 'Choose file',
    perPage: 'per page',
    iconChoose: 'Choose icon',
    iconEmpty: 'No icon found',
    iconClear: 'No icon',
    chartAsTable: 'As table',
    chartAsChart: 'As chart',
    paginationRange: ({ from, to, total }) => `${from}–${to} of ${total}`,
    markdown: {
      bold: 'Bold',
      italic: 'Italic',
      h2: 'Heading 2',
      h3: 'Heading 3',
      bullet: 'Bullet list',
      ordered: 'Numbered list',
      quote: 'Quote',
      code: 'Code',
      link: 'Link',
      linkPrompt: 'Link URL',
    },
  },
}

export const baseKitKey: InjectionKey<ComputedRef<BaseKitConfig>> = Symbol('basekit')

/**
 * Konfiguration für eine BaseKit-Komponente. Ohne bereitgestellten Wert
 * greifen die Voreinstellungen — die Komponente rendert dann auf Englisch,
 * statt leere Beschriftungen zu zeigen.
 */
export function useBaseKit(): ComputedRef<BaseKitConfig> {
  const provided = inject(baseKitKey, null)
  return provided ?? computed(() => BASEKIT_DEFAULTS)
}

/** Kurzform für den häufigen Fall, dass nur die Beschriftungen gebraucht werden. */
export function useBaseKitLabels(): ComputedRef<BaseKitLabels> {
  const config = useBaseKit()
  return computed(() => config.value.labels)
}
