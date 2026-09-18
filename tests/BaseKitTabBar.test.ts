import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitTabBar from '../app/components/BaseKitTabBar.vue'

const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }

const items = [
  { key: 'home', label: 'Start', icon: 'i-lucide-house', to: '/', active: true },
  { key: 'inbox', label: 'Posteingang', icon: 'i-lucide-inbox', to: '/inbox', badge: 3 },
  { key: 'more', label: 'Mehr', icon: 'i-lucide-menu' },
]

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitTabBar, {
    props: { items, ...props },
    global: { stubs: { UIcon } },
  })
}

describe('BaseKitTabBar', () => {
  it('renders one entry per item with icon and label', () => {
    const wrapper = render()
    expect(wrapper.findAll('.basekit-tab-bar-item')).toHaveLength(3)
    expect(wrapper.find('[data-test="tab-inbox"]').text()).toContain('Posteingang')
    expect(wrapper.find('[data-test="tab-inbox"] i').attributes('data-icon')).toBe('i-lucide-inbox')
  })

  it('links items that have a target', () => {
    expect(render().find('[data-test="tab-inbox"]').attributes('href')).toBe('/inbox')
  })

  it('marks only the item the caller calls active', () => {
    const wrapper = render()
    expect(wrapper.find('[data-test="tab-home"]').attributes('aria-current')).toBe('page')
    expect(wrapper.find('[data-test="tab-inbox"]').attributes('aria-current')).toBeUndefined()
  })

  it('turns an item without a target into a button that reports its key', async () => {
    const wrapper = render()
    const more = wrapper.find('[data-test="tab-more"]')
    expect(more.element.tagName).toBe('BUTTON')

    await more.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['more']])
  })

  it('does not report select for linked items', async () => {
    const wrapper = render()
    await wrapper.find('[data-test="tab-inbox"]').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('shows a badge only for a real count', () => {
    const wrapper = render({
      items: [
        { key: 'a', label: 'A', icon: 'x', to: '/a', badge: 2 },
        { key: 'b', label: 'B', icon: 'x', to: '/b', badge: 0 },
        { key: 'c', label: 'C', icon: 'x', to: '/c', badge: null },
      ],
    })
    expect(wrapper.findAll('[data-test="tab-badge"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="tab-a"] [data-test="tab-badge"]').text()).toBe('2')
  })

  it('opens external targets outside the router', () => {
    const wrapper = render({ items: [{ key: 'x', label: 'X', icon: 'x', to: 'https://example.org', external: true }] })
    const link = wrapper.find('[data-test="tab-x"]')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('href')).toBe('https://example.org')
  })
})
