<script setup lang="ts">
/**
 * Eine Zahl mit Beschriftung — die richtige Form für einen einzelnen Wert.
 *
 * Ein Balkendiagramm mit genau einem Balken sagt nicht mehr als die Zahl
 * selbst und kostet die vierfache Fläche. Deshalb sind Bestand und
 * Handlungsliste Kacheln und keine Diagramme.
 *
 * `tone` färbt nur, wenn die Zahl über null liegt: „0 offene Vorgänge" ist
 * keine Warnung, sondern der Normalzustand.
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

/** Der Punkt neben der Zahl trägt dieselbe Aussage wie die Farbe — die Farbe
 *  allein wäre für eine Rot-Grün-Schwäche keine. */
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
