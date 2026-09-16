import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChartLegend from '../app/components/charts/BaseKitChartLegend.vue'

const items = [
  { key: 'run', label: 'Laufen', value: '12 h' },
  { key: 'bike', label: 'Radfahren' },
]

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitChartLegend, { props: { items, ...props } })
}

describe('BaseKitChartLegend', () => {
  it('names every series', () => {
    const text = render().text()
    expect(text).toContain('Laufen')
    expect(text).toContain('Radfahren')
  })

  it('takes the colour from the position, like the charts do', () => {
    const swatches = render().findAll('li span:first-child')
    expect(swatches[0]!.attributes('style')).toContain('--basekit-chart-1')
    expect(swatches[1]!.attributes('style')).toContain('--basekit-chart-2')
  })

  it('falls back to the muted step past the fifth slot', () => {
    const viele = Array.from({ length: 6 }, (_, i) => ({ key: i, label: `Reihe ${i}` }))
    const swatches = render({ items: viele }).findAll('li span:first-child')
    expect(swatches[5]!.attributes('style')).toContain('--basekit-chart-muted')
  })

  it('shows a figure only where one is given', () => {
    expect(render().text()).toContain('12 h')
    expect(render({ items: [{ key: 'a', label: 'Ohne' }] }).findAll('li span')).toHaveLength(2)
  })

  it('renders nothing but the list when there is nothing to name', () => {
    expect(render({ items: [] }).findAll('li')).toHaveLength(0)
  })
})
