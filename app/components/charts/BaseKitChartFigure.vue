<script setup lang="ts">
/**
 * Rahmen für ein Diagramm: Karte, Titel, Legende und der Umschalter auf die
 * Tabellenansicht.
 *
 * Der Umschalter ist keine Zugabe. Ein Diagramm codiert Werte über Farbe und
 * Länge; wer davon nichts hat — Farbfehlsichtigkeit, Screenreader, Ausdruck —
 * braucht dieselben Zahlen in lesbarer Form. Deshalb bringt jede Karte hier
 * ihre Tabelle mit, und deshalb ist der Umschalter sichtbar und nicht in einem
 * Menü versteckt.
 */
import { computed, ref } from 'vue'
import { useBaseKitLabels } from '../../composables/useBaseKit'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  /** Wohin die Karte führt. Ohne Ziel bleibt der Titel ein Titel. */
  href?: string
  /** Diagramm ausgrauen, während im Hintergrund nachgeladen wird. */
  stale?: boolean
  /** Ohne Tabellen-Slot entfällt der Umschalter. */
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
