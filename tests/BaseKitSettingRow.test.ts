import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitSettingRow from '../app/components/BaseKitSettingRow.vue'

describe('BaseKitSettingRow', () => {
  it('renders title and description', () => {
    const wrapper = mount(BaseKitSettingRow, {
      props: {
        title: 'Benachrichtigungen',
        description: 'E-Mails und Push erhalten',
      },
    })
    expect(wrapper.text()).toContain('Benachrichtigungen')
    expect(wrapper.text()).toContain('E-Mails und Push erhalten')
  })

  it('omits description when not provided', () => {
    const wrapper = mount(BaseKitSettingRow, {
      props: { title: 'Sprache' },
    })
    expect(wrapper.text()).toContain('Sprache')
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('renders slot content on the right side', () => {
    const wrapper = mount(BaseKitSettingRow, {
      props: { title: 'Notifications' },
      slots: { default: '<button data-test="switch">Toggle</button>' },
    })
    expect(wrapper.find('[data-test="switch"]').exists()).toBe(true)
  })

  it('keeps title and action on the same row', () => {
    const wrapper = mount(BaseKitSettingRow, {
      props: { title: 'Title' },
      slots: { default: '<span data-test="action">A</span>' },
    })
    // Beide sind direkte Kinder eines flex-row Containers
    const row = wrapper.find('.flex.items-start.justify-between')
    expect(row.exists()).toBe(true)
    expect(row.text()).toContain('Title')
    expect(row.find('[data-test="action"]').exists()).toBe(true)
  })
})
