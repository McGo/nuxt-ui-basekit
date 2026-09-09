import { describe, expect, it } from 'vitest'
import { BASEKIT_CHART_SLOTS, baseKitChartColor, useChartFormat } from '../app/composables/useChartPalette'

describe('baseKitChartColor', () => {
  it('maps a series index to its fixed slot', () => {
    expect(baseKitChartColor(0)).toBe('var(--basekit-chart-1)')
    expect(baseKitChartColor(4)).toBe('var(--basekit-chart-5)')
  })

  it('does not wrap around past the last slot', () => {
    // Eine wiederverwendete Farbe wäre unter einer Farbfehlsichtigkeit von der
    // ersten nicht zu unterscheiden — deshalb Grau statt Recycling.
    expect(baseKitChartColor(BASEKIT_CHART_SLOTS)).toBe('var(--basekit-chart-muted)')
    expect(baseKitChartColor(12)).toBe('var(--basekit-chart-muted)')
  })
})

describe('useChartFormat', () => {
  const { number, compact, percent, bytes, duration } = useChartFormat()

  it('groups thousands in the active locale', () => {
    expect(number(12345)).toBe('12,345')
  })

  it('shortens only from five digits up', () => {
    expect(compact(9999)).toBe('9,999')
    expect(compact(12400)).toContain('12')
  })

  it('formats a share and only says 100 % when it really is', () => {
    expect(percent(1, 2)).toBe('50%')
    expect(percent(5, 5)).toBe('100%')
    // 99,99 % darf nicht auf 100 % aufgerundet werden — die eine fehlende
    // Übersetzung wäre sonst unsichtbar.
    expect(percent(9999, 10000)).toBe('99.9%')
  })

  it('returns a dash instead of dividing by zero', () => {
    expect(percent(0, 0)).toBe('—')
  })

  it('uses decimal prefixes, the way storage is billed', () => {
    expect(bytes(0)).toBe('0 B')
    expect(bytes(999)).toBe('999 B')
    expect(bytes(1500)).toBe('1.5 kB')
    expect(bytes(2_500_000_000)).toBe('2.5 GB')
  })

  it('formats runtime as hours and minutes', () => {
    expect(duration(90)).toBe('2 min')
    expect(duration(3600)).toBe('1 h')
    expect(duration(3600 * 14 + 60 * 20)).toBe('14 h 20 min')
  })
})
