<script setup lang="ts">
/**
 * A ratio against a known limit — this many of that many.
 *
 * A meter presupposes that a whole exists. Where none does — bytes without a
 * quota, a count without a ceiling — the number belongs in a tile and not
 * here; a full bar would otherwise claim a limit had been reached.
 */
import { computed } from 'vue'
import { baseKitChartColor, useChartFormat } from '../../composables/useChartPalette'

const props = withDefaults(defineProps<{
  value: number
  total: number
  label?: string
  hint?: string
}>(), {
  label: undefined,
  hint: undefined,
})

const { number, percent } = useChartFormat()

const ratio = computed(() => (props.total <= 0 ? 0 : Math.min(1, props.value / props.total)))
const color = baseKitChartColor(0)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-baseline justify-between gap-3">
      <p class="text-2xl font-semibold text-highlighted">
        {{ number(props.value) }}<span class="text-base font-normal text-muted"> / {{ number(props.total) }}</span>
      </p>
      <p class="text-sm tabular-nums text-muted">
        {{ percent(props.value, props.total) }}
      </p>
    </div>

    <div
      class="h-2.5 w-full overflow-hidden rounded-full bg-elevated"
      role="meter"
      :aria-valuenow="props.value"
      :aria-valuemin="0"
      :aria-valuemax="props.total"
      :aria-label="props.label"
    >
      <div
        class="h-full rounded-full"
        :style="{ width: `${ratio * 100}%`, backgroundColor: color }"
      />
    </div>

    <p v-if="props.hint" class="text-xs text-dimmed">
      {{ props.hint }}
    </p>
  </div>
</template>
