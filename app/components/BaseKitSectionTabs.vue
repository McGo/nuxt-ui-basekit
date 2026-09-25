<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * Sections and sub-sections of one record — a customer, a project, anything
 * that has more to show than fits on one page.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Overview   Work & time   Communication   Finance        │  ← sections
 *  └──────────────────────────────────────────────────────────┘
 *     Tasks   Time                                              ← sub-sections
 *     … content of Work & time › Time …
 *
 * Two levels, because a record with fifteen tabs in one row does not fit on a
 * laptop and hides the last five behind a scrollbar nobody sees. The sections
 * stay few and always in the same order; a section with more than one thing
 * in it gets a second, quieter row. A section with a single sub-section shows
 * no second row — one tab to choose from is not a choice.
 *
 * Where the selection lives is the caller's decision:
 *
 * - `mode="query"` (default): `?section=…&sub=…` on the current page. The
 *   content is drawn by the caller in the default slot, which receives
 *   `{ section, sub }`. Links from elsewhere can point straight at a
 *   sub-section, and the back button walks through what was opened.
 * - `mode="route"`: every sub-section is a page of its own and carries its
 *   `to`. Active is what matches the current path (longest match wins); the
 *   content is the caller's `<NuxtPage />` in the default slot. For records
 *   whose tabs already are child routes and should stay addressable.
 *
 * Old addresses: `legacy` rewrites a former query parameter once on mount,
 * e.g. `{ param: 'tab', map: { time: ['work', 'time'] } }` turns `?tab=time`
 * into `?section=work&sub=time`. Links in mails, chat messages and bookmarks
 * keep working after the tabs were regrouped.
 *
 * On phones the section row becomes a select — a row of ten does not fit,
 * and a select at least says what exists. The breakpoint is `lg`.
 *
 * Styling: the bar is plain; the caller frames it. The slot `bar-top` sits
 * inside the bar above the links — room for an accent line or a hint.
 */
export interface BaseKitSubSection {
  key: string
  label: string
  /** Target in `mode="route"`. */
  to?: string
  /** Count or short text next to the label. Empty, `0` and `null` show nothing. */
  badge?: string | number | null
}

export interface BaseKitSection {
  key: string
  label: string
  icon?: string
  badge?: string | number | null
  /** At least one. With exactly one the second row is not shown. */
  children: BaseKitSubSection[]
}

const props = withDefaults(defineProps<{
  items: BaseKitSection[]
  mode?: 'query' | 'route'
  /** Names of the query parameters in `mode="query"`. */
  queryKeys?: { section: string, sub: string }
  /** Former query parameter and where its values go now. */
  legacy?: { param: string, map: Record<string, [string, string?]> }
  /** Class for the bar that holds the section links. */
  barClass?: string
}>(), {
  mode: 'query',
  queryKeys: () => ({ section: 'section', sub: 'sub' }),
  legacy: undefined,
  barClass: '',
})

const route = useRoute()
const router = useRouter()
const labels = useBaseKitLabels()

// --- Active section and sub-section ---------------------------------------

function fromPath(): { section?: BaseKitSection, sub?: string } {
  const path = String(route.path ?? '')
  let best: { section: BaseKitSection, sub: string, length: number } | null = null
  for (const s of props.items) {
    for (const c of s.children) {
      if (!c.to) continue
      const hit = path === c.to || path.startsWith(c.to.endsWith('/') ? c.to : `${c.to}/`)
      if (hit && (!best || c.to.length > best.length)) best = { section: s, sub: c.key, length: c.to.length }
    }
  }
  return best ? { section: best.section, sub: best.sub } : {}
}

const activeSection = computed<BaseKitSection | undefined>(() => {
  if (props.mode === 'route') return fromPath().section ?? props.items[0]
  const key = String(route.query?.[props.queryKeys.section] ?? '')
  return props.items.find(s => s.key === key) ?? props.items[0]
})

const activeSub = computed<string | undefined>(() => {
  const s = activeSection.value
  if (!s) return undefined
  if (props.mode === 'route') return fromPath().sub ?? s.children[0]?.key
  const key = String(route.query?.[props.queryKeys.sub] ?? '')
  return s.children.some(c => c.key === key) ? key : s.children[0]?.key
})

onMounted(() => {
  if (props.mode !== 'query' || !props.legacy) return
  const old = route.query?.[props.legacy.param]
  if (typeof old !== 'string' || route.query?.[props.queryKeys.section]) return
  const target = props.legacy.map[old]
  if (!target) return
  const { [props.legacy.param]: _dropped, ...rest } = route.query
  router.replace({
    query: {
      ...rest,
      [props.queryKeys.section]: target[0],
      ...(target[1] ? { [props.queryKeys.sub]: target[1] } : {}),
    },
  })
})

// --- Targets ----------------------------------------------------------------

function sectionTarget(s: BaseKitSection) {
  if (props.mode === 'route') return s.children[0]?.to ?? ''
  // The first section is the landing view and needs no parameter.
  if (s.key === props.items[0]?.key) return { path: route.path, query: {} }
  return { path: route.path, query: { [props.queryKeys.section]: s.key } }
}

function subTarget(s: BaseKitSection, key: string) {
  if (props.mode === 'route') return s.children.find(c => c.key === key)?.to ?? ''
  return { path: route.path, query: { [props.queryKeys.section]: s.key, [props.queryKeys.sub]: key } }
}

function showsBadge(badge: string | number | null | undefined): boolean {
  return badge !== undefined && badge !== null && badge !== '' && badge !== 0
}

const sectionLinks = computed(() => props.items.map(s => ({
  label: s.label,
  icon: s.icon,
  to: sectionTarget(s),
  active: s.key === activeSection.value?.key,
  badge: showsBadge(s.badge) ? String(s.badge) : undefined,
  'data-test': `section-${s.key}`,
})))

const sectionChoice = computed({
  get: () => activeSection.value?.key,
  set: (key?: string) => {
    const s = props.items.find(x => x.key === key)
    if (s) router.push(sectionTarget(s))
  },
})

const subItems = computed(() => {
  const s = activeSection.value
  if (!s || s.children.length < 2) return []
  return s.children.map(c => ({
    label: c.label,
    value: c.key,
    badge: showsBadge(c.badge) ? String(c.badge) : undefined,
  }))
})

const subChoice = computed({
  get: () => activeSub.value,
  set: (key?: string) => {
    const s = activeSection.value
    if (s && key) router.replace(subTarget(s, key))
  },
})
</script>

<template>
  <div class="basekit-section-tabs" data-test="section-tabs">
    <div class="basekit-section-tabs-bar" :class="barClass">
      <slot name="bar-top" />
      <UNavigationMenu
        :items="sectionLinks"
        highlight
        class="max-lg:hidden px-2 overflow-x-auto"
        :aria-label="labels.sections"
        :ui="{ link: 'px-2.5 py-2.5' }"
        data-test="section-links"
      />
      <div class="lg:hidden p-2">
        <USelect
          v-model="sectionChoice"
          class="w-full"
          :icon="activeSection?.icon"
          :aria-label="labels.sections"
          :items="items.map(s => ({ label: s.label, value: s.key, icon: s.icon }))"
          data-test="section-select"
        />
      </div>
    </div>

    <UTabs
      v-if="subItems.length"
      v-model="subChoice"
      :items="subItems"
      :content="false"
      variant="link"
      size="sm"
      :ui="{ list: 'overflow-x-auto', trigger: 'shrink-0' }"
      data-test="sub-tabs"
    />

    <slot :section="activeSection?.key" :sub="activeSub" />
  </div>
</template>

<style scoped>
@layer components {
  .basekit-section-tabs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
