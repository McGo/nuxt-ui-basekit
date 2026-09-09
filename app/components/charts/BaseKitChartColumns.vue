<script setup lang="ts">
/**
 * Gestapelte Säulen über einer Zeitachse — „was ist je Tag entstanden".
 *
 * Warum gestapelt und nicht mehrere Linien: die Frage ist Anteil am Ganzen,
 * nicht Verlauf einzelner Reihen. Und warum Säulen und keine Fläche: Tageswerte
 * sind gezählte Ereignisse, keine stetige Größe — eine Fläche würde zwischen
 * zwei Tagen interpolieren und behaupten, dass um 12 Uhr nachts etwas
 * halb passiert ist.
 *
 * Trennung zwischen den Segmenten passiert über eine 2-px-Lücke in der
 * Kartenfarbe, nicht über einen Rahmen: ein Rahmen ist Tinte, die keine Daten
 * trägt, und bei dünnen Segmenten überdeckt er den Wert.
 *
 * Höchstens fünf Reihen — siehe `useChartPalette`.
 */
import { computed, ref } from 'vue'
import { baseKitChartColor, useChartFormat } from '../../composables/useChartPalette'
import { useChartWidth } from '../../composables/useChartWidth'

interface ColumnSeries {
  key: string
  label: string
  points: number[]
}

const props = withDefaults(defineProps<{
  /** Beschriftung je Säule, z. B. ISO-Tage. */
  categories: string[]
  series: ColumnSeries[]
  height?: number
  /** Achsenbeschriftung (kurz) aus einer Kategorie. */
  formatCategory?: (value: string) => string
  /** Ausführliche Fassung für den Tooltip. */
  formatCategoryLong?: (value: string) => string
  ariaLabel?: string
}>(), {
  height: 200,
  formatCategory: (value: string) => value,
  formatCategoryLong: undefined,
  ariaLabel: undefined,
})

const { number } = useChartFormat()
const { el, width } = useChartWidth()

const PADDING = { top: 10, right: 8, bottom: 22, left: 40 }
const MAX_COLUMN = 14
const GAP = 2

const active = ref<number | null>(null)

const plot = computed(() => {
  const innerWidth = Math.max(60, width.value - PADDING.left - PADDING.right)
  const innerHeight = Math.max(40, props.height - PADDING.top - PADDING.bottom)
  const count = Math.max(1, props.categories.length)
  const band = innerWidth / count
  return {
    innerWidth,
    innerHeight,
    band,
    columnWidth: Math.max(2, Math.min(MAX_COLUMN, band - 3)),
    baseline: PADDING.top + innerHeight,
  }
})

/** Tagessummen — sie bestimmen die Skala und stehen im Tooltip. */
const totals = computed(() =>
  props.categories.map((_, index) =>
    props.series.reduce((sum, s) => sum + (s.points[index] ?? 0), 0),
  ),
)

/**
 * Obere Achsengrenze auf eine runde Zahl aufgerundet. Ohne das steht die
 * Beschriftung auf krummen Werten wie 37, und die Gitterlinien tragen keine
 * ablesbare Auskunft mehr.
 */
const scaleMax = computed(() => {
  const peak = Math.max(0, ...totals.value)
  if (peak === 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(peak))
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude
    if (candidate >= peak) return candidate
  }
  return 10 * magnitude
})

const ticks = computed(() => {
  const max = scaleMax.value
  return [0, max / 2, max].map(value => ({
    value,
    y: plot.value.baseline - (value / max) * plot.value.innerHeight,
    label: number(Math.round(value)),
  }))
})

function columnX(index: number): number {
  return PADDING.left + plot.value.band * (index + 0.5) - plot.value.columnWidth / 2
}

/** Runde Kappe nur oben — unten sitzt die Säule auf der Grundlinie auf. */
function cappedPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h)
  if (h <= 0) return ''
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h}`,
    'Z',
  ].join(' ')
}

interface Segment {
  key: string
  path: string
  color: string
}

const columns = computed(() => {
  const { innerHeight, baseline, columnWidth } = plot.value
  const max = scaleMax.value

  return props.categories.map((category, index) => {
    const segments: Segment[] = []
    let stacked = 0

    // Von unten nach oben stapeln; die oberste Reihe bekommt die Kappe.
    const present = props.series
      .map((s, order) => ({ s, order, value: s.points[index] ?? 0 }))
      .filter(entry => entry.value > 0)

    present.forEach((entry, position) => {
      const bottom = baseline - (stacked / max) * innerHeight
      stacked += entry.value
      const top = baseline - (stacked / max) * innerHeight

      const isTop = position === present.length - 1
      // Lücke nach oben, außer beim obersten Segment — dort säße sie
      // zwischen Säule und Luft und würde die Säule nur kürzen.
      const height = Math.max(0, bottom - top - (isTop ? 0 : GAP))
      if (height <= 0) return

      segments.push({
        key: entry.s.key,
        color: baseKitChartColor(entry.order),
        path: isTop
          ? cappedPath(columnX(index), top, columnWidth, height)
          : `M ${columnX(index)} ${top} h ${columnWidth} v ${height} h ${-columnWidth} Z`,
      })
    })

    return { category, index, segments, total: totals.value[index] ?? 0 }
  })
})

/**
 * Beschriftung ausdünnen, bis sie nicht mehr kollidiert — und zwar durch
 * Weglassen, nicht durch Verstecken: ein ausgeblendeter Text bleibt im
 * Baum stehen und wird von Screenreadern trotzdem vorgelesen.
 */
const axisLabels = computed(() => {
  const perLabel = 56
  const every = Math.max(1, Math.ceil(perLabel / Math.max(1, plot.value.band)))

  return props.categories
    .map((category, index) => ({ category, index }))
    .filter(entry => entry.index % every === 0)
    .map(entry => ({
      category: entry.category,
      x: PADDING.left + plot.value.band * (entry.index + 0.5),
      text: props.formatCategory(entry.category),
    }))
})

const tooltip = computed(() => {
  if (active.value === null) return null
  const index = active.value
  const long = props.formatCategoryLong ?? props.formatCategory

  return {
    index,
    title: long(props.categories[index] ?? ''),
    total: totals.value[index] ?? 0,
    rows: props.series
      .map((s, order) => ({
        key: s.key,
        label: s.label,
        color: baseKitChartColor(order),
        value: s.points[index] ?? 0,
      }))
      .filter(row => row.value > 0),
    // Am Rand kippt der Kasten nach innen, statt aus der Karte zu laufen.
    anchor: PADDING.left + plot.value.band * (index + 0.5),
  }
})

function readout(index: number): string {
  const long = props.formatCategoryLong ?? props.formatCategory
  const parts = props.series
    .map(s => `${s.label}: ${number(s.points[index] ?? 0)}`)
    .join(', ')
  return `${long(props.categories[index] ?? '')} — ${parts}`
}
</script>

<template>
  <div ref="el" class="relative w-full">
    <svg
      :width="width"
      :height="props.height"
      :viewBox="`0 0 ${width} ${props.height}`"
      role="group"
      :aria-label="props.ariaLabel"
      class="block max-w-full overflow-visible"
    >
      <!-- Gitter: durchgezogene Haarlinien, eine Stufe von der Fläche weg. -->
      <g>
        <line
          v-for="tick in ticks"
          :key="`grid-${tick.value}`"
          :x1="PADDING.left"
          :x2="width - PADDING.right"
          :y1="tick.y"
          :y2="tick.y"
          :stroke="tick.value === 0 ? 'var(--basekit-chart-axis)' : 'var(--basekit-chart-grid)'"
          stroke-width="1"
          shape-rendering="crispEdges"
        />
        <text
          v-for="tick in ticks"
          :key="`tick-${tick.value}`"
          :x="PADDING.left - 8"
          :y="tick.y + 3"
          text-anchor="end"
          fill="currentColor"
          class="text-dimmed text-[10px] tabular-nums"
        >{{ tick.label }}</text>
      </g>

      <!-- Datenmarken -->
      <g
        v-for="column in columns"
        :key="column.category"
      >
        <path
          v-for="segment in column.segments"
          :key="segment.key"
          :d="segment.path"
          :fill="segment.color"
          :opacity="active === null || active === column.index ? 1 : 0.45"
          class="transition-opacity"
        />
      </g>

      <!-- Trefferflächen: über die volle Höhe und über die ganze Bandbreite,
           damit niemand eine 14 px schmale Säule treffen muss. -->
      <g>
        <rect
          v-for="column in columns"
          :key="`hit-${column.category}`"
          :x="PADDING.left + plot.band * column.index"
          :y="PADDING.top"
          :width="plot.band"
          :height="plot.innerHeight"
          fill="transparent"
          tabindex="0"
          role="button"
          :aria-label="readout(column.index)"
          class="cursor-default outline-none"
          @pointerenter="active = column.index"
          @pointerleave="active = null"
          @focus="active = column.index"
          @blur="active = null"
        />
      </g>

      <!-- Achsenbeschriftung -->
      <text
        v-for="label in axisLabels"
        :key="`label-${label.category}`"
        :x="label.x"
        :y="props.height - 6"
        text-anchor="middle"
        fill="currentColor"
        class="text-dimmed text-[10px]"
      >{{ label.text }}</text>
    </svg>

    <!-- Tooltip: Wert führt, Reihenname folgt. -->
    <div
      v-if="tooltip"
      class="pointer-events-none absolute top-0 z-10 min-w-40 -translate-x-1/2 rounded-md border border-default bg-default p-2 shadow-lg"
      :style="{ left: `${Math.min(Math.max(tooltip.anchor, 90), width - 90)}px` }"
    >
      <p class="mb-1 text-[11px] font-medium text-muted">
        {{ tooltip.title }}
      </p>
      <ul class="space-y-0.5">
        <li
          v-for="row in tooltip.rows"
          :key="row.key"
          class="flex items-center gap-2 text-xs"
        >
          <span class="h-0.5 w-3 shrink-0 rounded-full" :style="{ backgroundColor: row.color }" />
          <span class="font-semibold tabular-nums text-highlighted">{{ number(row.value) }}</span>
          <span class="truncate text-muted">{{ row.label }}</span>
        </li>
        <li v-if="!tooltip.rows.length" class="text-xs text-muted">
          {{ number(0) }}
        </li>
      </ul>
    </div>
  </div>
</template>
