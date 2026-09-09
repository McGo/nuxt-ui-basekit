<script setup lang="ts">
/**
 * The frame around a chart: card, title, legend, and the switch to the table
 * view.
 *
 * That switch is not a nicety. A chart encodes values through colour and
 * length; anyone who gets nothing out of that — a colour vision deficiency, a
 * screen reader, a printout — needs the same numbers in readable form. Which
 * is why every card here brings its table along, and why the switch is visible
 * rather than buried in a menu.
 */
import { computed, ref } from 'vue'
import { useBaseKitLabels } from '../../composables/useBaseKit'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  /** Where the card leads. Without a target the title stays a title. */
  href?: string
  /** Grey the chart out while something reloads in the background. */
  stale?: boolean
  /** Without a table slot the switch disappears. */
  tableAvailable?: boolean
}>(), {
  subtitle: undefined,
  href: undefined,
  stale: false,
  tableAvailable: true,
})

const labels = useBaseKitLabels()
const showTable = ref(false)

const toggleLabel = computed(() =>
  showTable.value ? labels.value.chartAsChart : labels.value.chartAsTable,
)
const toggleIcon = computed(() =>
  showTable.value ? 'i-lucide-chart-column' : 'i-lucide-table',
)
</script>

<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <component
          :is="props.href ? 'NuxtLink' : 'h2'"
          :to="props.href"
          class="text-sm font-semibold text-highlighted"
          :class="props.href ? 'group inline-flex items-center gap-1 hover:text-primary' : 'block'"
        >
          {{ props.title }}
          <UIcon
            v-if="props.href"
            name="i-lucide-arrow-right"
            class="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </component>
        <p v-if="props.subtitle" class="mt-0.5 text-xs text-muted">
          {{ props.subtitle }}
        </p>
      </div>

      <UButton
        v-if="props.tableAvailable"
        :icon="toggleIcon"
        :aria-label="toggleLabel"
        :title="toggleLabel"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="showTable = !showTable"
      />
    </div>

    <div :class="props.stale ? 'opacity-60 transition-opacity' : 'transition-opacity'">
      <div v-show="!showTable">
        <slot />
      </div>
      <div v-if="props.tableAvailable" v-show="showTable" class="overflow-x-auto">
        <slot name="table" />
      </div>
    </div>

    <slot name="footer" />
  </UCard>
</template>
