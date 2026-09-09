import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChartMeter from '../app/components/charts/BaseKitChartMeter.vue'

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitChartMeter, { props: { value: 30, total: 120, ...props } })
}

describe('BaseKitChartMeter', () => {
  it('renders value and total', () => {
    expect(render().text()).toContain('30')
    expect(render().text()).toContain('120')
  })

  it('fills the track proportionally', () => {
    expect(render().find('[role="meter"] div').attributes('style')).toContain('width: 25%')
  })

  it('exposes the range to assistive technology', () => {
    const meter = render().find('[role="meter"]')
    expect(meter.attributes('aria-valuenow')).toBe('30')
    expect(meter.attributes('aria-valuemax')).toBe('120')
  })

  it('never overflows the track when the value exceeds the total', () => {
    const style = render({ value: 200, total: 120 }).find('[role="meter"] div').attributes('style')
    expect(style).toContain('width: 100%')
  })

  it('stays at zero without a total instead of dividing by zero', () => {
    const wrapper = render({ value: 0, total: 0 })
    expect(wrapper.find('[role="meter"] div').attributes('style')).toContain('width: 0%')
    expect(wrapper.text()).toContain('—')
  })

  it('shows the hint when one is given', () => {
    expect(render({ hint: 'Wird erst seit dem Update gezählt' }).text())
      .toContain('Wird erst seit dem Update gezählt')
  })
})
