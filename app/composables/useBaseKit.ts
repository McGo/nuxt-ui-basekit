import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * The only wire between the BaseKit components and the application using them.
 *
 * The components are meant to run in any Nuxt project. That rules out calling
 * `vue-i18n` and it rules out knowing translation keys: `t('common.search')`
 * exists only in the one application that carries that key, and a package
 * which presupposes such keys is not a package.
 *
 * Instead the application hands language and labels in once, from a plugin
 * that pulls the values out of its own source:
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
 * Provide nothing and the defaults below apply. One thing worth knowing when
 * the values come from an i18n library: `useI18n()` requires a component setup
 * context and throws inside a plugin. Take the instance from `nuxtApp.$i18n`,
 * and only when the `computed` is read.
 *
 * Over `provide`/`inject` rather than `useNuxtApp()`: that way the components
 * also run in a Vitest mount without a Nuxt context, and two requests share
 * nothing under SSR.
 *
 * Individual labels stay overridable as props — what follows only decides what
 * comes out when nothing is passed.
 */
export interface BaseKitLabels {
  /** Search field above lists and pickers. */
  search: string
  /** Filter entry for "no restriction". */
  all: string
  select: string
  change: string
  edit: string
  cancel: string
  confirm: string
  /** Heading of the confirmation when the caller passes none. */
  confirmTitle: string
  /** Body of the confirmation when the caller passes none. */
  confirmBody: string
  /** Empty list — nothing exists yet. */
  empty: string
  /** Empty list — the search ran and found nothing. */
  noResults: string
  noResultsHint: string
  back: string
  view: string
  upload: string
  perPage: string
  iconChoose: string
  iconEmpty: string
  /** Clearing the choice — the empty option in the icon picker. */
  iconClear: string
  chartAsTable: string
  chartAsChart: string
  /** "1–25 of 300" — a function, because the numbers sit inside the sentence. */
  paginationRange: (range: { from: number, to: number, total: number }) => string
  /**
   * Toolbar of the Markdown editor. Its own group, because the terms occur
   * nowhere else and the top level would otherwise be half made of them.
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
    /** Prompt shown when setting a link. */
    linkPrompt: string
  }
}

export interface BaseKitConfig {
  /**
   * BCP-47 tag for `Intl` — drives thousands separators, percentages and date
   * formats in the charts.
   */
  locale: string
  labels: BaseKitLabels
}

/**
 * Defaults: English. The package cannot know what language the application
 * runs in, and English is the one that shuts out the fewest readers. Anything
 * else is handed in through the plugin above.
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
 * Configuration for a BaseKit component. With nothing provided the defaults
 * apply — the component then renders in English instead of showing empty
 * labels.
 */
export function useBaseKit(): ComputedRef<BaseKitConfig> {
  const provided = inject(baseKitKey, null)
  return provided ?? computed(() => BASEKIT_DEFAULTS)
}

/** Short form for the common case of only needing the labels. */
export function useBaseKitLabels(): ComputedRef<BaseKitLabels> {
  const config = useBaseKit()
  return computed(() => config.value.labels)
}
