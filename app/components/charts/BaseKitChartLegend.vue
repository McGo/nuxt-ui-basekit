<script setup lang="ts">
/**
 * The identity key for a chart that carries more than one series.
 *
 * Colour alone is not an identity channel — not under a colour vision
 * deficiency, not in print, not on a screen in daylight. A chart that names
 * its series by hue and nothing else hands part of its readers a picture they
 * cannot decode. So the legend is not decoration; it is the channel the colour
 * leans on.
 *
 * One series needs none. The title already says what is plotted, and a single
 * swatch below it restates the title at the cost of a line.
 *
 * The colours come from the item order, exactly as the charts assign them:
 * item one wears series colour one. Pass the same list, in the same order, and
 * the two agree without either knowing about the other.
 */
import { baseKitChartColor } from '../../composables/useChartPalette'

interface LegendItem {
  key: string | number
  label: string
  /** Optional figure beside the name — a total, a share, a last value. */
  value?: string
}

const props = defineProps<{ items: LegendItem[] }>()
</script>

<template>
  <ul class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    <li
      v-for="(item, index) in props.items"
      :key="item.key"
      class="flex items-center gap-1.5 text-xs"
    >
      <!-- Ein Strich, keine Fläche: Er wiegt so viel wie die Marke im
           Diagramm und drängt sich neben der Schrift nicht vor. -->
      <span
        class="h-0.5 w-3 shrink-0 rounded-full"
        :style="{ backgroundColor: baseKitChartColor(index) }"
      />
      <span class="text-muted">{{ item.label }}</span>
      <span v-if="item.value" class="font-medium tabular-nums text-highlighted">{{ item.value }}</span>
    </li>
  </ul>
</template>
