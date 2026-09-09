import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChartDonut from '../app/components/charts/BaseKitChartDonut.vue'

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitChartDonut, {
    props: {
      slices: [
        { key: 'active', label: 'Aktiv', value: 30 },
        { key: 'departed', label: 'Ausgeschieden', value: 10 },
      ],
      ...props,
    },
  })
}

describe('BaseKitChartDonut', () => {
  it('draws one arc per non-empty slice', () => {
    expect(render().findAll('path')).toHaveLength(2)
  })

  it('leaves out empty slices but keeps them in the legend', () => {
    const wrapper = render({
      slices: [
        { key: 'active', label: 'Aktiv', value: 5 },
        { key: 'blocked', label: 'Gesperrt', value: 0 },
      ],
    })
    expect(wrapper.findAll('path')).toHaveLength(1)
    expect(wrapper.text()).toContain('Gesperrt')
  })

  it('puts the total in the middle', () => {
    expect(render().find('text').text()).toBe('40')
  })

  it('shows the share per slice in the legend', () => {
    expect(render().text()).toContain('75')
    expect(render().text()).toContain('25')
  })

  it('draws a full ring when a single slice holds everything', () => {
    const wrapper = render({ slices: [{ key: 'active', label: 'Aktiv', value: 7 }] })
    const path = wrapper.find('path').attributes('d') ?? ''
    // An arc of 360° would have identical start and end points and vanish,
    // hence the special case going through two semicircles.
    expect(path).toContain('a')
  })

  it('falls back to an empty track when there is no data at all', () => {
    const wrapper = render({ slices: [] })
    expect(wrapper.findAll('path')).toHaveLength(0)
    expect(wrapper.find('circle').exists()).toBe(true)
    expect(wrapper.find('text').text()).toBe('0')
  })

  it('assigns colours by slice order', () => {
    const colours = render().findAll('path').map(p => p.attributes('stroke'))
    expect(colours).toEqual(['var(--basekit-chart-1)', 'var(--basekit-chart-2)'])
  })

  it('labels each arc for assistive technology', () => {
    expect(render().find('path').attributes('aria-label')).toBe('Aktiv: 30')
  })
})
