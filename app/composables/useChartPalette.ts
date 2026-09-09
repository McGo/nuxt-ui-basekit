import { computed } from 'vue'
import { useBaseKit } from './useBaseKit'

/**
 * Series colours and number formats for the `BaseKitChart*` components.
 *
 * The colours live as CSS variables in `app/assets/css/basekit.css` and are
 * validated as a **set**, order included. That is why there is lookup by index
 * here and no generation: a sixth colour would be indistinguishable from one
 * of the five under a colour vision deficiency. More series than that means
 * grouping them.
 */
export const BASEKIT_CHART_SLOTS = 5

/** Colour for series `index`, zero-based. From slot 6 on, the muted grey. */
export function baseKitChartColor(index: number): string {
  return index < BASEKIT_CHART_SLOTS
    ? `var(--basekit-chart-${index + 1})`
    : 'var(--basekit-chart-muted)'
}

export function useChartFormat(): {
  number: (value: number) => string
  compact: (value: number) => string
  percent: (value: number, total: number) => string
  bytes: (value: number) => string
  duration: (seconds: number) => string
} {
  const config = useBaseKit()
  const locale = computed(() => config.value.locale)

  function number(value: number): string {
    return new Intl.NumberFormat(locale.value).format(value)
  }

  /** For values on ticks and in tiles: 12,400 becomes 12.4K. */
  function compact(value: number): string {
    return value < 10000
      ? number(value)
      : new Intl.NumberFormat(locale.value, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  }

  /**
   * A share in percent, rounded down as long as the whole has not been
   * reached — otherwise 9,999 out of 10,000 would pass as "100%" and the one
   * missing item would be rounded out of sight.
   */
  function percent(value: number, total: number): string {
    if (total <= 0) return '—'
    if (value >= total) {
      return new Intl.NumberFormat(locale.value, { style: 'percent', maximumFractionDigits: 0 })
        .format(1)
    }

    const exact = (value / total) * 100
    const floored = Math.floor(exact * 10) / 10
    return new Intl.NumberFormat(locale.value, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(floored / 100)
  }

  /**
   * Decimal prefixes (kB, MB, GB), not KiB/MiB. Storage is billed that way,
   * and the number here should match the one on the invoice.
   */
  function bytes(value: number): string {
    const units = ['B', 'kB', 'MB', 'GB', 'TB']
    let size = Math.max(0, value)
    let unit = 0
    while (size >= 1000 && unit < units.length - 1) {
      size /= 1000
      unit++
    }
    const digits = unit === 0 ? 0 : (size < 10 ? 1 : 0)
    return `${new Intl.NumberFormat(locale.value, { maximumFractionDigits: digits }).format(size)} ${units[unit]}`
  }

  /** Runtime as "14 h 20 min"; below an hour, minutes only. */
  function duration(seconds: number): string {
    const total = Math.max(0, Math.round(seconds / 60))
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    if (hours === 0) return `${number(minutes)} min`
    return minutes === 0 ? `${number(hours)} h` : `${number(hours)} h ${number(minutes)} min`
  }

  return { number, compact, percent, bytes, duration }
}
