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

  it('stands the bottom segment on the baseline and gaps the joints', () => {
    // The gap between two stacked segments has to come off the **upper** edge
    // of the lower one, and the drawing has to start that much lower with it.
    // Taking it off the height alone left the start where it was, so the
    // missing pixels ended up at the bottom of each segment: every gap sat one
    // segment too low, and the bottom-most segment floated above the axis
    // instead of standing on it.
    const w = mount(BaseKitChartColumns, {
      props: {
        categories: ['2026-09-09'],
        series: [
          { key: 'a', label: 'A', points: [1] },
          { key: 'b', label: 'B', points: [1] },
          { key: 'c', label: 'C', points: [1] },
        ],
        height: 200,
      },
    })

    // PADDING.top 10 + innerHeight 168.
    const baseline = 178

    // Jedes Segment als [oben, unten], von unten nach oben gelesen.
    const spans = w.findAll('path[fill^="var(--basekit-chart-"]').map((path) => {
      const zahlen = (path.attributes('d') ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
      const oben = zahlen[1]!
      // Das gerade Segment trägt die Höhe an dritter Stelle; das gekappte
      // endet mit seiner unteren Kante.
      const unten = (path.attributes('d') ?? '').includes('Q')
        ? zahlen[zahlen.length - 1]!
        : oben + zahlen[3]!
      return { oben, unten }
    })

    expect(spans).toHaveLength(3)

    // Unten bündig — nicht zwei Pixel darüber.
    expect(spans[0]!.unten).toBeCloseTo(baseline, 5)

    // Und an beiden Fugen genau eine Lücke, keine doppelte und keine fehlende.
    expect(spans[0]!.oben - spans[1]!.unten).toBeCloseTo(2, 5)
    expect(spans[1]!.oben - spans[2]!.unten).toBeCloseTo(2, 5)
  })

  it('keeps the top of the stack where the value says, gap or no gap', () => {
    // Die Lücken dürfen die Säule nicht kürzen: Drei gleiche Werte auf einem
    // Maximum von drei reichen bis an den oberen Rand der Zeichenfläche.
    const w = mount(BaseKitChartColumns, {
      props: {
        categories: ['2026-09-09'],
        series: [
          { key: 'a', label: 'A', points: [1] },
          { key: 'b', label: 'B', points: [1] },
          { key: 'c', label: 'C', points: [1] },
        ],
        height: 200,
      },
    })

    const gekappt = w.findAll('path[fill^="var(--basekit-chart-"]').at(-1)!
    const zahlen = (gekappt.attributes('d') ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []

    // `M x unten L x oben …` — die zweite Zahl ist die untere Kante, die
    // vierte die obere.
    expect(zahlen[3]).toBeCloseTo(81.2, 5)
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
