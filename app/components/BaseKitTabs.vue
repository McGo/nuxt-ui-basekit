<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'

/**
 * Splits a page into sections — settings groups, say, and anything else that
 * gets unwieldy once there are many fields.
 *
 * One named slot per tab, keyed by its `key`. The active tab is optionally
 * driven through `v-model`; without it the first one wins.
 *
 *   <BaseKitTabs :items="[
 *     { key: 'general', label: 'General', icon: 'i-lucide-settings' },
 *     { key: 'access',  label: 'Access',  icon: 'i-lucide-lock' },
 *   ]">
 *     <template #general> … </template>
 *     <template #access>  … </template>
 *   </BaseKitTabs>
 *
 * Deep linking: with `hash-nav` the active tab becomes addressable through the
 * URL fragment (`…/page#access`). On load a matching hash wins; switching tabs
 * writes the hash through `router.replace`, so the history stays clean. With
 * several tabsets on one page, run only ONE of them with `hash-nav`.
 *
 * The hash is applied `onMounted` on purpose. The server never sees it —
 * browsers do not send it — and a first client render that differs from the
 * server's tears the hydration apart: the marker sat on one tab while the
 * content came from another. For the same reason it goes through `select()`,
 * so a bound `v-model` learns about the tab from the hash.
 *
 * Accessibility: tablist/tab/tabpanel roles, left and right arrow keys switch.
 *
 * Layout convention: do NOT wrap the tab bar in a `UCard` — tabs and content
 * sit directly on the page. Finer structure per tab (groups, fieldsets,
 * individual cards) belongs INSIDE the respective slot.
 */
const props = withDefaults(defineProps<{
  /** Tab definitions; their order is the display order. */
  items: Array<{ key: string, label: string, icon?: string }>
  /** Key of the active tab (v-model). Unbound, the first tab becomes active. */
  modelValue?: string
  /** Make the active tab addressable through the URL fragment (`#<key>`). */
  hashNav?: boolean
}>(), {
  modelValue: undefined,
  hashNav: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const route = useRoute()
const router = useRouter()

/** A valid tab key from the current URL fragment, otherwise null. */
function keyFromHash(): string | null {
  if (!props.hashNav) return null
  const key = String(route.hash ?? '').replace(/^#/, '')
  return props.items.some(i => i.key === key) ? key : null
}

const active = ref<string>(props.modelValue ?? props.items[0]?.key ?? '')

/** Did the user choose themselves? Then their choice beats the hash. */
const picked = ref(false)

// Apply the hash on the client only — see the comment at the top.
onMounted(() => applyHash())

// v-model coming in: take the selection from outside.
watch(() => props.modelValue, (next) => {
  if (next !== undefined && next !== active.value) active.value = next
})

// The hash changed — a direct link, back or forward — so activate that tab.
watch(() => route.hash, () => {
  const key = keyFromHash()
  if (key !== null && key !== active.value) active.value = key
})

// The items changed. Two cases: the tab named in the hash only appears now —
// permission-dependent tabs arrive late — in which case take it, as long as
// the user has not chosen themselves. Otherwise, if the active tab disappears,
// fall back to the first.
watch(() => props.items, (items) => {
  if (!picked.value && applyHash()) return
  if (!items.some(i => i.key === active.value)) active.value = items[0]?.key ?? ''
})

/**
 * Take the tab from the hash if it matches an item and is not already active.
 * Does not count as a user choice. Returns `true` when it switched.
 */
function applyHash(): boolean {
  const key = keyFromHash()
  if (key === null || key === active.value) return false
  active.value = key
  emit('update:modelValue', key)
  return true
}

function select(key: string): void {
  picked.value = true
  active.value = key
  emit('update:modelValue', key)

  if (props.hashNav && String(route.hash ?? '').replace(/^#/, '') !== key) {
    router.replace({ hash: `#${key}` })
  }
}

const activeIndex = computed(() => props.items.findIndex(i => i.key === active.value))

function onKey(e: KeyboardEvent): void {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  e.preventDefault()
  const len = props.items.length
  if (len === 0) return
  const dir = e.key === 'ArrowRight' ? 1 : -1
  const next = (activeIndex.value + dir + len) % len
  select(props.items[next]!.key)
}
</script>

<template>
  <div class="basekit-tabs">
    <div
      role="tablist"
      class="flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-800"
      @keydown="onKey"
    >
      <button
        v-for="item in items"
        :id="`basekit-tab-${item.key}`"
        :key="item.key"
        type="button"
        role="tab"
        :aria-selected="item.key === active"
        :tabindex="item.key === active ? 0 : -1"
        class="-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors"
        :class="item.key === active
          ? 'border-primary-500 text-primary-700 dark:text-primary-300'
          : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
        @click="select(item.key)"
      >
        <UIcon v-if="item.icon" :name="item.icon" class="size-4" />
        {{ item.label }}
      </button>
    </div>

    <div
      role="tabpanel"
      :aria-labelledby="`basekit-tab-${active}`"
      class="pt-4"
    >
      <slot :name="active" />
    </div>
  </div>
</template>
