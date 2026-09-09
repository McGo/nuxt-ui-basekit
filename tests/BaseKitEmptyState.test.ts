import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitEmptyState from '../app/components/BaseKitEmptyState.vue'

const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }

function render(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BaseKitEmptyState, {
    props: { title: 'Nichts da', ...props },
    slots,
    global: { stubs: { UIcon } },
  })
}

describe('BaseKitEmptyState', () => {
  it('renders the title', () => {
    expect(render().text()).toContain('Nichts da')
  })

  it('renders the description when provided', () => {
    expect(render({ description: 'Leg was an' }).text()).toContain('Leg was an')
  })

  it('omits the description paragraph when not provided', () => {
    // Only the title paragraph exists, no second <p>.
    expect(render().findAll('p')).toHaveLength(1)
  })

  it('uses the inbox icon for the default (empty) variant', () => {
    expect(render().find('[data-icon="i-lucide-inbox"]').exists()).toBe(true)
  })

  it('uses the search-x icon for the search variant', () => {
    const w = render({ variant: 'search' })
    expect(w.find('[data-icon="i-lucide-search-x"]').exists()).toBe(true)
    expect(w.find('[data-icon="i-lucide-inbox"]').exists()).toBe(false)
  })

  it('lets an explicit icon override the variant default', () => {
    const w = render({ variant: 'search', icon: 'i-lucide-file-plus-2' })
    expect(w.find('[data-icon="i-lucide-file-plus-2"]').exists()).toBe(true)
  })

  it('renders the default slot as the action area', () => {
    const w = render({}, { default: '<button data-test="cta">Anlegen</button>' })
    expect(w.find('[data-test="cta"]').exists()).toBe(true)
  })
})
