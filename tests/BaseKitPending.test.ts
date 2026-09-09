import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitPending from '../app/components/BaseKitPending.vue'

const UIcon = {
  props: ['name'],
  template: '<i :data-icon="name" :class="$attrs.class" />',
}

function render(props: Record<string, unknown> = {}, slot = '<p class="inhalt">Formular</p>') {
  return mount(BaseKitPending, {
    props,
    slots: { default: slot },
    global: { stubs: { UIcon } },
  })
}

describe('BaseKitPending', () => {
  it('shows the spinner instead of the content while loading', () => {
    const w = render({ pending: true })

    expect(w.find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(true)
    expect(w.find('.inhalt').exists()).toBe(false)
  })

  it('releases the content once the data is in', () => {
    const w = render({ pending: false })

    expect(w.find('.inhalt').exists()).toBe(true)
    expect(w.find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(false)
  })

  it('waits when nothing is passed — data is more likely absent than present', () => {
    // The default decides what a forgotten prop does. One spinner too many
    // beats an empty form that looks like "nothing here".
    expect(render().find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(true)
  })

  it('names the operation only when it has a name', () => {
    expect(render({ pending: true }).text()).toBe('')
    expect(render({ pending: true, label: 'Suche läuft' }).text()).toBe('Suche läuft')
  })

  it('announces itself as a status region so screen readers pick it up', () => {
    const box = render({ pending: true }).find('[role="status"]')

    expect(box.exists()).toBe(true)
    expect(box.attributes('aria-live')).toBe('polite')
  })

  it('reserves more height for a whole page than for a section', () => {
    // Without a minimum height the layout jumps once the content appears.
    expect(render({ pending: true, size: 'page' }).find('[role="status"]').classes()).toContain('min-h-64')
    expect(render({ pending: true, size: 'inline' }).find('[role="status"]').classes()).toContain('min-h-24')
  })
})
