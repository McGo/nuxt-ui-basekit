import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitCheckButton from '../app/components/BaseKitCheckButton.vue'

const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }

function setup(props: Record<string, unknown> = {}) {
  return mount(BaseKitCheckButton, { props, global: { stubs: { UIcon } } })
}

describe('BaseKitCheckButton', () => {
  it('reports a tap and keeps no state of its own', async () => {
    const w = setup()
    await w.get('[data-test="check-button"]').trigger('click')

    expect(w.emitted('toggle')).toHaveLength(1)
    expect(w.get('[data-test="check-button"]').attributes('aria-pressed')).toBe('false')
  })

  it('names what a tap does, from the labels unless given', async () => {
    const w = setup()
    expect(w.get('button').attributes('aria-label')).toBe('Mark as done')

    await w.setProps({ checked: true })
    expect(w.get('button').attributes('aria-label')).toBe('Mark as not done')

    await w.setProps({ checkedLabel: 'Back on the list' })
    expect(w.get('button').attributes('aria-label')).toBe('Back on the list')
  })

  it('plays nothing on the first render, even when checked', () => {
    const w = setup({ checked: true })
    expect(w.find('[data-test="check-ring"]').exists()).toBe(false)
  })

  it('plays when it turns checked, not when it turns back', async () => {
    const w = setup()
    await w.setProps({ checked: true })
    const first = w.get('[data-test="check-ring"]').element

    await w.setProps({ checked: false })
    await w.setProps({ checked: true })

    // A fresh element restarts the animation; the same one would stay still.
    expect(w.get('[data-test="check-ring"]').element).not.toBe(first)
  })
})
