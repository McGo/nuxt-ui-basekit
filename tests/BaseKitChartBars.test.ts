import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChartBars from '../app/components/charts/BaseKitChartBars.vue'

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitChartBars, {
    props: {
      items: [
        { key: 1, label: 'Redaktion', value: 4 },
        { key: 2, label: 'Mitglieder', value: 12 },
      ],
      ...props,
    },
  })
}

describe('BaseKitChartBars', () => {
  it('sorts descending by value', () => {
    const labels = render().findAll('li span:first-child').map(s => s.text())
    expect(labels[0]).toBe('Mitglieder')
  })

  it('scales the widest bar to the full track', () => {
    const bars = render().findAll('li span > span')
    expect(bars[0]!.attributes('style')).toContain('width: 100%')
  })

  it('gives every bar the same colour — the categories carry no order', () => {
    const styles = render().findAll('li span > span').map(s => s.attributes('style') ?? '')
    expect(styles.every(style => style.includes('--basekit-chart-1'))).toBe(true)
  })

  it('keeps a zero-value row visible without drawing a bar', () => {
    const wrapper = render({ items: [{ key: 1, label: 'Leer', value: 0 }] })
    expect(wrapper.text()).toContain('Leer')
    expect(wrapper.find('li span > span').attributes('style')).toContain('width: 0%')
  })

  it('folds the tail into one row once a limit and a label are given', () => {
    const wrapper = render({
      items: [
        { key: 1, label: 'A', value: 5 },
        { key: 2, label: 'B', value: 4 },
        { key: 3, label: 'C', value: 3 },
      ],
      limit: 2,
      moreLabel: 'Weitere',
    })
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.text()).toContain('Weitere')
    // 3 = nur C, denn A und B stehen selbst da.
    expect(wrapper.findAll('li').at(2)!.text()).toContain('3')
  })

  it('shows the empty label instead of an empty list', () => {
    const wrapper = render({ items: [], emptyLabel: 'Nichts vergeben' })
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.text()).toContain('Nichts vergeben')
  })
})
