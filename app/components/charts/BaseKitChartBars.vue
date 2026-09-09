<script setup lang="ts">
/**
 * Horizontal bars for nominal categories — roles, types, sources.
 *
 * Horizontal because the labels are names, and names under a vertical column
 * would have to be tilted. Every bar carries the **same** colour: the
 * categories have no order of their own, and a gradient by size would tell the
 * length a second time instead of adding anything.
 */
import { computed, ref } from 'vue'
import { baseKitChartColor, useChartFormat } from '../../composables/useChartPalette'

interface BarItem {
  key: string | number
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  items: BarItem[]
  /** Rows shown; the rest is folded into a "more" row. */
  limit?: number
  moreLabel?: string
  emptyLabel?: string
}>(), {
  limit: 6,
  moreLabel: undefined,
  emptyLabel: undefined,
})

const { number } = useChartFormat()
const active = ref<string | number | null>(null)

const rows = computed<BarItem[]>(() => {
  const sorted = [...props.items].sort((a, b) => b.value - a.value)
  if (!props.moreLabel || sorted.length <= props.limit) return sorted

  const head = sorted.slice(0, props.limit)
  const tail = sorted.slice(props.limit)
  return [...head, {
    key: '__more__',
    label: props.moreLabel,
    value: tail.reduce((sum, item) => sum + item.value, 0),
  }]
})

const max = computed(() => Math.max(1, ...rows.value.map(row => row.value)))
const color = baseKitChartColor(0)
</script>

<template>
  <div>
    <p v-if="!rows.length && props.emptyLabel" class="text-sm text-muted">
      {{ props.emptyLabel }}
    </p>

    <ul v-else class="space-y-2.5">
      <li
        v-for="row in rows"
        :key="row.key"
        class="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3"
        @pointerenter="active = row.key"
        @pointerleave="active = null"
      >
        <span class="truncate text-sm text-muted" :title="row.label">{{ row.label }}</span>

        <!-- The track is the surface, the bar is the statement; which is why
             the track only hints and carries no second colour. -->
        <span class="h-2.5 w-full rounded-full bg-elevated">
          <span
            class="block h-2.5 rounded-full transition-opacity"
            :style="{
              width: `${Math.max(row.value > 0 ? 2 : 0, (row.value / max) * 100)}%`,
              backgroundColor: color,
              opacity: active === null || active === row.key ? 1 : 0.55,
            }"
          />
        </span>

        <span class="w-10 text-right text-sm font-medium tabular-nums text-highlighted">
          {{ number(row.value) }}
        </span>
      </li>
    </ul>
  </div>
</template>
