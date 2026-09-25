<script setup lang="ts">
import { computed, reactive } from 'vue'
import { NuxtLink } from '#components'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * Breadcrumb of a nested record — customer › project › epic — in which every
 * level can be swapped for one of its siblings.
 *
 *   [▣]  ACME Ltd ⇅  ›  012 Website ⇅  ›  Checkout ⇅   ● active ☆
 *    │       │                               │
 *    │       └ link to the level             └ opens the other epics
 *    └ marker of the deepest level
 *
 * `UBreadcrumb` links upwards and that is all. Moving sideways — to the next
 * project of the same customer — then means a trip to the list and back. Here
 * the chevrons next to each level open the siblings in place; the list is
 * fetched only when the menu opens, through the `siblings` function of the
 * level, and kept for as long as the component lives.
 *
 * Colour belongs to the caller: `class` on a level and on `marker` reaches
 * the icon, so an application can tell its levels apart without the package
 * knowing any of them.
 *
 * Narrow screens keep the last level; the ones before it hide below `sm`, the
 * optional `root` link below `2xl`. The `after` slot sits behind the last
 * level — status, a star, anything that belongs to the record.
 */
export interface BaseKitScopeSibling {
  key: string
  label: string
  to: string
  icon?: string
  class?: string
}

export interface BaseKitScopeLevel {
  key: string
  label: string
  to: string
  /** Kind of the level, for the switch button's name ("customer"). */
  kind?: string
  /** Short prefix in monospace before the label, e.g. a number. */
  prefix?: string
  icon?: string
  class?: string
  /** Lists the siblings. Called once, when the menu first opens. */
  siblings?: () => Promise<BaseKitScopeSibling[]> | BaseKitScopeSibling[]
}

const props = defineProps<{
  levels: BaseKitScopeLevel[]
  /** Icon in front, usually the one of the deepest level. */
  marker?: { icon: string, class?: string }
  /** Optional first link above all levels ("All customers"). */
  root?: { label: string, to: string }
}>()

const labels = useBaseKitLabels()

const loaded = reactive<Record<string, BaseKitScopeSibling[] | undefined>>({})
const loading = reactive<Record<string, boolean>>({})

async function load(level: BaseKitScopeLevel): Promise<void> {
  if (!level.siblings || loaded[level.key] || loading[level.key]) return
  loading[level.key] = true
  try {
    loaded[level.key] = await level.siblings()
  } catch {
    // The path itself keeps working; the menu just stays empty.
    loaded[level.key] = []
  } finally {
    loading[level.key] = false
  }
}

function menu(level: BaseKitScopeLevel) {
  if (loading[level.key] && !loaded[level.key]) {
    return [[{ label: labels.value.loading, icon: 'i-lucide-loader-circle', disabled: true }]]
  }
  return [(loaded[level.key] ?? []).map(s => ({
    label: s.label,
    to: s.to,
    icon: s.key === level.key ? 'i-lucide-check' : s.icon,
    class: s.class,
  }))]
}

const last = computed(() => props.levels.length - 1)
</script>

<template>
  <nav class="basekit-scope-breadcrumb" aria-label="Breadcrumb" data-test="scope-breadcrumb">
    <span v-if="marker" class="basekit-scope-marker" :class="marker.class" data-test="scope-marker">
      <UIcon :name="marker.icon" class="size-4" />
    </span>

    <template v-if="root">
      <NuxtLink :to="root.to" class="basekit-scope-root max-2xl:hidden">{{ root.label }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="basekit-scope-sep max-2xl:hidden" />
    </template>

    <template v-for="(level, i) in levels" :key="level.key">
      <UIcon v-if="i > 0" name="i-lucide-chevron-right" class="basekit-scope-sep" :class="i < last ? 'max-sm:hidden' : ''" />
      <span class="basekit-scope-level" :class="i < last ? 'max-sm:hidden' : ''" :data-test="`scope-${level.key}`">
        <NuxtLink :to="level.to" class="basekit-scope-link" :data-current="i === last ? '' : undefined">
          <UIcon v-if="level.icon && i < last" :name="level.icon" class="size-3.5 shrink-0" :class="level.class" />
          <span v-if="level.prefix" class="basekit-scope-prefix font-mono">{{ level.prefix }}</span>
          <span class="truncate">{{ level.label }}</span>
        </NuxtLink>
        <UDropdownMenu
          v-if="level.siblings"
          :items="menu(level)"
          :content="{ align: 'start' }"
          @update:open="(open: boolean) => open && load(level)"
        >
          <UButton
            icon="i-lucide-chevrons-up-down"
            variant="ghost"
            color="neutral"
            size="xs"
            :aria-label="labels.scopeSwitch(level.kind ?? level.label)"
            data-test="scope-switch"
          />
        </UDropdownMenu>
      </span>
    </template>

    <span v-if="$slots.after" class="basekit-scope-after">
      <slot name="after" />
    </span>
  </nav>
</template>

<style scoped>
@layer components {
  .basekit-scope-breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    min-width: 0;
    font-size: 0.875rem;
  }

  .basekit-scope-marker {
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    flex-shrink: 0;
    margin-inline-end: 0.375rem;
    border-radius: calc(var(--ui-radius) * 1.5);
    background: var(--ui-bg-elevated);
  }

  .basekit-scope-root,
  .basekit-scope-link {
    color: var(--ui-text-muted);
    padding-inline: 0.25rem;
  }

  .basekit-scope-root:hover,
  .basekit-scope-link:hover {
    color: var(--ui-text-highlighted);
  }

  .basekit-scope-level {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .basekit-scope-link {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
    max-width: 16rem;
  }

  .basekit-scope-link[data-current] {
    color: var(--ui-text-highlighted);
    font-weight: 600;
  }

  .basekit-scope-prefix {
    font-size: 0.75rem;
    color: var(--ui-text-dimmed);
  }

  .basekit-scope-sep {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: var(--ui-text-dimmed);
  }

  .basekit-scope-after {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
    margin-inline-start: 0.25rem;
  }
}
</style>
