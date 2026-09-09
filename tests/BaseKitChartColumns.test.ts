import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChartColumns from '../app/components/charts/BaseKitChartColumns.vue'

const DATES = ['2026-08-01', '2026-08-02', '2026-08-03']

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitChartColumns, {
    props: {
      categories: DATES,
      series: [
        { key: 'articles', label: 'Artikel', points: [2, 0, 1] },
        { key: 'discussion', label: 'Diskussion', points: [1, 0, 3] },
      ],
      ...props,
    },
  })
}

describe('BaseKitChartColumns', () => {
  it('draws one hit target per category', () => {
    expect(render().findAll('rect[role="button"]')).toHaveLength(3)
  })

  it('skips segments with a zero value instead of drawing a hairline', () => {
    // Tag 1: zwei Segmente, Tag 2: keins, Tag 3: zwei.
    expect(render().findAll('path[fill^="var(--basekit-chart-"]')).toHaveLength(4)
  })

  it('assigns colours by series order, not by size', () => {
    const paths = render().findAll('path[fill^="var(--basekit-chart-"]')
    const colours = paths.map(p => p.attributes('fill'))
    // The smaller series on day three keeps the colour its position gives it.
    expect(colours).toEqual([
      'var(--basekit-chart-1)',
      'var(--basekit-chart-2)',
      'var(--basekit-chart-1)',
      'var(--basekit-chart-2)',
    ])
  })

  it('exposes every series of a day in the hit target label', () => {
    const label = render().findAll('rect[role="button"]')[0]!.attributes('aria-label')
    expect(label).toContain('Artikel: 2')
    expect(label).toContain('Diskussion: 1')
  })

  it('shows a tooltip listing only the non-zero series on hover', async () => {
    const wrapper = render()
    await wrapper.findAll('rect[role="button"]')[2]!.trigger('pointerenter')

    const tooltip = wrapper.find('.absolute')
    expect(tooltip.exists()).toBe(true)
    expect(tooltip.text()).toContain('Artikel')
    expect(tooltip.text()).toContain('Diskussion')
  })

  it('opens the same tooltip on keyboard focus as on hover', async () => {
    const wrapper = render()
    await wrapper.findAll('rect[role="button"]')[0]!.trigger('focus')

    expect(wrapper.find('.absolute').exists()).toBe(true)
  })

  it('hides the tooltip again when the pointer leaves', async () => {
    const wrapper = render()
    const hit = wrapper.findAll('rect[role="button"]')[0]!
    await hit.trigger('pointerenter')
    await hit.trigger('pointerleave')

    expect(wrapper.find('.absolute').exists()).toBe(false)
  })

  it('rounds the axis maximum up to a clean number', () => {
    const wrapper = render({
      series: [{ key: 'a', label: 'A', points: [37, 12, 4] }],
    })
    // 37 rounds up to 50, not to 37 — otherwise the grid line carries no
    // readable value.
    expect(wrapper.findAll('text').map(t => t.text())).toContain('50')
  })

  it('survives an all-zero window without dividing by zero', () => {
    const wrapper = render({
      series: [{ key: 'a', label: 'A', points: [0, 0, 0] }],
    })
    expect(wrapper.findAll('path[fill^="var(--basekit-chart-"]')).toHaveLength(0)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('thins out axis labels rather than letting them collide', () => {
    const many = Array.from({ length: 30 }, (_, i) => `2026-08-${String(i + 1).padStart(2, '0')}`)
    const wrapper = mount(BaseKitChartColumns, {
      props: {
        categories: many,
        series: [{ key: 'a', label: 'A', points: many.map(() => 1) }],
      },
    })
    // With 30 days at the default width of 640px not every day may be
    // labelled; the three y-axis ticks come on top.
    const rendered = wrapper.findAll('text').filter(t => t.attributes('text-anchor') === 'middle')
    expect(rendered.length).toBeLessThan(30)
    expect(rendered.length).toBeGreaterThan(0)
  })
})
