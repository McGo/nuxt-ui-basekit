<script setup lang="ts">
/**
 * A number with a label — the right shape for a single value.
 *
 * A bar chart with exactly one bar says no more than the number itself and
 * costs four times the space. Which is why counts and to-do figures are tiles
 * here and not charts.
 *
 * `tone` only colours when the number is above zero: "0 open items" is not a
 * warning, it is the normal state.
 */
import { computed } from 'vue'
import { useChartFormat } from '../composables/useChartPalette'

const props = withDefaults(defineProps<{
  label: string
  value: number
  hint?: string
  href?: string
  icon?: string
  tone?: 'alert' | 'info' | 'neutral'
}>(), {
  hint: undefined,
  href: undefined,
  icon: undefined,
  tone: 'neutral',
})

const { number } = useChartFormat()

const valueClass = computed(() => {
  if (props.value === 0 || props.tone === 'neutral') return 'text-highlighted'
  return props.tone === 'alert' ? 'text-error' : 'text-highlighted'
})

/** The dot next to the number carries the same message as the colour — the
 *  colour alone would carry none under a red-green deficiency. */
const flagged = computed(() => props.value > 0 && props.tone === 'alert')
</script>

<template>
  <component
    :is="props.href ? 'NuxtLink' : 'div'"
    :to="props.href"
    class="block rounded-lg border border-default bg-default p-4 transition-colors"
    :class="props.href ? 'hover:bg-elevated/60' : ''"
  >
    <div class="flex items-center gap-2">
      <UIcon v-if="props.icon" :name="props.icon" class="size-4 shrink-0 text-dimmed" />
      <p class="truncate text-xs font-medium text-muted" :title="props.label">
        {{ props.label }}
      </p>
    </div>

    <p class="mt-2 flex items-center gap-1.5 text-2xl font-semibold" :class="valueClass">
      <UIcon v-if="flagged" name="i-lucide-alert-triangle" class="size-4 shrink-0" />
      {{ number(props.value) }}
    </p>

    <p v-if="props.hint" class="mt-1 text-xs text-dimmed">
      {{ props.hint }}
    </p>
  </component>
</template>
