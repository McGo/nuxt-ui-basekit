import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitStrike from '../app/components/BaseKitStrike.vue'
import BaseKitCollapse from '../app/components/BaseKitCollapse.vue'

describe('BaseKitStrike', () => {
  it('carries its text and switches the line with active', async () => {
    const w = mount(BaseKitStrike, { slots: { default: 'Milk' } })
    expect(w.text()).toBe('Milk')
    expect(w.classes()).not.toContain('basekit-strike--on')

    await w.setProps({ active: true })
    expect(w.classes()).toContain('basekit-strike--on')
  })
})

describe('BaseKitCollapse', () => {
  it('stays open by default and hides from assistive tech when closed', async () => {
    const w = mount(BaseKitCollapse, { slots: { default: '<p>row</p>' } })
    expect(w.attributes('aria-hidden')).toBe('false')

    await w.setProps({ open: false })
    expect(w.classes()).toContain('basekit-collapse--closed')
    expect(w.attributes('aria-hidden')).toBe('true')
    expect(w.find('p').exists()).toBe(true)
  })
})
