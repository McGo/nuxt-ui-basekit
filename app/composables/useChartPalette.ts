import { computed } from 'vue'
import { useBaseKit } from './useBaseKit'

/**
 * Reihenfarben und Zahlenformate für die `BaseKitChart*`-Komponenten.
 *
 * Die Farben stehen als CSS-Variablen in `main.css` und sind als **Satz**
 * geprüft — Reihenfolge inklusive. Deshalb gibt es hier nur einen Zugriff per
 * Index und keine Erzeugung: eine sechste Farbe wäre unter einer
 * Farbfehlsichtigkeit von einer der fünf nicht mehr zu unterscheiden.
 * Wer mehr Reihen hat, fasst zusammen.
 */
export const BASEKIT_CHART_SLOTS = 5

/** Farbe für Reihe `index` (0-basiert). Ab Slot 6 die zurückgenommene Graustufe. */
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

  /** Für Werte an Marken und in Kacheln: 12.400 → 12,4 Tsd. */
  function compact(value: number): string {
    return value < 10000
      ? number(value)
      : new Intl.NumberFormat(locale.value, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  }

  /**
   * Anteil in Prozent. Abgerundet, solange nicht alles erreicht ist — sonst
   * würde 9.999 von 10.000 als „100 %" durchgehen und die eine fehlende
   * Übersetzung wäre weggerundet.
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
   * Dezimalpräfixe (kB, MB, GB) — nicht KiB/MiB. Speicheranbieter rechnen so
   * ab, und die Zahl soll zu der auf der Rechnung passen.
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

  /** Laufzeit als „14 h 20 min", unter einer Stunde nur Minuten. */
  function duration(seconds: number): string {
    const total = Math.max(0, Math.round(seconds / 60))
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    if (hours === 0) return `${number(minutes)} min`
    return minutes === 0 ? `${number(hours)} h` : `${number(hours)} h ${number(minutes)} min`
  }

  return { number, compact, percent, bytes, duration }
}
