<script setup lang="ts">
/**
 * A ring for part-of-whole across a few classes.
 *
 * Deliberately narrow in scope: a ring answers "roughly how does this split",
 * not "which of these two is bigger". As soon as two segments sit close
 * together, a bar is the more honest shape. Four segments at most, otherwise
 * the small ones lose their labels.
 *
 * The total goes in the middle — it is the number people look for first, and
 * it fills the space a ring leaves empty anyway.
 */
import { computed, ref } from 'vue'
import { baseKitChartColor, useChartFormat } from '../../composables/useChartPalette'

interface DonutSlice {
  key: string
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  slices: DonutSlice[]
  /** Label below the total in the centre. */
  centerLabel?: string
  size?: number
  ariaLabel?: string
}>(), {
  centerLabel: undefined,
  size: 168,
  ariaLabel: undefined,
})

const { number, percent } = useChartFormat()

const THICKNESS = 18
/** Gap between segments, in degrees — the counterpart to the 2px gap. */
const GAP_DEGREES = 2

const active = ref<string | null>(null)

const total = computed(() => props.slices.reduce((sum, slice) => sum + slice.value, 0))

const radius = computed(() => props.size / 2 - THICKNESS / 2 - 2)
const center = computed(() => props.size / 2)

function pointOnCircle(angle: number, r: number): [number, number] {
  const radians = ((angle - 90) * Math.PI) / 180
  return [center.value + r * Math.cos(radians), center.value + r * Math.sin(radians)]
}

const arcs = computed(() => {
  if (total.value <= 0) return []

  let cursor = 0
  return props.slices
    .map((slice, order) => ({ slice, order }))
    .filter(entry => entry.slice.value > 0)
    .map(({ slice, order }) => {
      const sweep = (slice.value / total.value) * 360
      const start = cursor
      cursor += sweep

      // A segment filling the whole circle would have identical start and end
      // points and the arc would vanish. Draw the full ring instead.
      const full = sweep >= 359.9
      const gap = full ? 0 : Math.min(GAP_DEGREES, sweep / 3)
      const from = start + gap / 2
      const to = start + sweep - gap / 2

      const [x1, y1] = pointOnCircle(from, radius.value)
      const [x2, y2] = pointOnCircle(to, radius.value)
      const largeArc = to - from > 180 ? 1 : 0

      return {
        key: slice.key,
        label: slice.label,
        value: slice.value,
        color: baseKitChartColor(order),
        path: full
          ? `M ${center.value} ${center.value - radius.value} `
            + `a ${radius.value} ${radius.value} 0 1 1 -0.01 0`
          : `M ${x1} ${y1} A ${radius.value} ${radius.value} 0 ${largeArc} 1 ${x2} ${y2}`,
      }
    })
})

const legend = computed(() =>
  props.slices.map((slice, order) => ({
    ...slice,
    color: baseKitChartColor(order),
    share: percent(slice.value, total.value),
  })),
)
</script>

<template>
  <!-- Legend below the ring, not beside it: the card often sits in a narrow
       column, and side by side so little was left for the labels that a word
       like "Discontinued" shrank to a "D". Stacked, every row has the full
       width. -->
  <div class="flex flex-col items-center gap-5">
    <svg
      :width="props.size"
      :height="props.size"
      :viewBox="`0 0 ${props.size} ${props.size}`"
      role="group"
      :aria-label="props.ariaLabel"
      class="shrink-0"
    >
      <!-- An empty ring when there is nothing: the shape stays recognisable
           instead of the card collapsing into a blank area. -->
      <circle
        v-if="!arcs.length"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="var(--basekit-chart-grid)"
        :stroke-width="THICKNESS"
      />

      <path
        v-for="arc in arcs"
        :key="arc.key"
        :d="arc.path"
        fill="none"
        :stroke="arc.color"
        :stroke-width="THICKNESS"
        stroke-linecap="butt"
        :opacity="active === null || active === arc.key ? 1 : 0.4"
        class="transition-opacity"
        tabindex="0"
        role="button"
        :aria-label="`${arc.label}: ${number(arc.value)}`"
        @pointerenter="active = arc.key"
        @pointerleave="active = null"
        @focus="active = arc.key"
        @blur="active = null"
      />

      <text
        :x="center"
        :y="center - 2"
        text-anchor="middle"
        fill="currentColor"
        class="text-highlighted text-2xl font-semibold"
      >{{ number(total) }}</text>
      <text
        v-if="props.centerLabel"
        :x="center"
        :y="center + 16"
        text-anchor="middle"
        fill="currentColor"
        class="text-dimmed text-[11px]"
      >{{ props.centerLabel }}</text>
    </svg>

    <!-- The legend carries the identity, not the colour alone. -->
    <ul class="w-full space-y-1.5">
      <li
        v-for="entry in legend"
        :key="entry.key"
        class="flex items-center gap-2 text-sm"
        @pointerenter="active = entry.key"
        @pointerleave="active = null"
      >
        <span class="size-2.5 shrink-0 rounded-sm" :style="{ backgroundColor: entry.color }" />
        <span class="truncate text-muted">{{ entry.label }}</span>
        <span class="ml-auto shrink-0 font-medium tabular-nums text-highlighted">{{ number(entry.value) }}</span>
        <span class="w-12 shrink-0 text-right text-xs tabular-nums text-dimmed">{{ entry.share }}</span>
      </li>
    </ul>
  </div>
</template>
