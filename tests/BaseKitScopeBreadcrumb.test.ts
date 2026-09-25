import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BaseKitScopeBreadcrumb from '../app/components/BaseKitScopeBreadcrumb.vue'

// The dropdown as a stand-in that reports opening and lists its entries, so
// the cases can open it and read what came back.
const stubs = {
  UIcon: { props: ['name'], template: '<i :data-icon="name" />' },
  UButton: { props: ['ariaLabel'], template: '<button type="button" :aria-label="ariaLabel" data-test="scope-switch" />' },
  UDropdownMenu: {
    props: ['items'],
    emits: ['update:open'],
    template: `<div data-test="menu" @click="$emit('update:open', true)"><slot />
      <a v-for="i in items[0]" :key="i.label" :data-to="i.to" :data-icon="i.icon" data-test="menu-item">{{ i.label }}</a></div>`,
  },
}

const levels = [
  { key: 'c1', label: 'ACME Ltd', to: '/c/c1', kind: 'customer', icon: 'i-lucide-building-2', class: 'lvl-c',
    siblings: vi.fn(async () => [
      { key: 'c1', label: 'ACME Ltd', to: '/c/c1' },
      { key: 'c2', label: 'Beta GmbH', to: '/c/c2' },
    ]) },
  { key: 'p7', label: 'Website', prefix: '007', to: '/c/c1/p/p7' },
]

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitScopeBreadcrumb, { props: { levels, ...props }, global: { stubs } })
}

describe('BaseKitScopeBreadcrumb', () => {
  it('links every level and marks the last as current', () => {
    const w = render()
    const links = w.findAll('.basekit-scope-link')
    expect(links.map(l => l.attributes('href'))).toEqual(['/c/c1', '/c/c1/p/p7'])
    expect(links[1]!.attributes('data-current')).toBe('')
    expect(links[0]!.attributes('data-current')).toBeUndefined()
  })

  it('shows prefix and the icon of earlier levels', () => {
    const w = render()
    expect(w.find('.basekit-scope-prefix').text()).toBe('007')
    expect(w.find('[data-test="scope-c1"] [data-icon="i-lucide-building-2"]').exists()).toBe(true)
  })

  it('offers a switch only where siblings can be listed', () => {
    const w = render()
    expect(w.find('[data-test="scope-c1"] [data-test="scope-switch"]').exists()).toBe(true)
    expect(w.find('[data-test="scope-p7"] [data-test="scope-switch"]').exists()).toBe(false)
  })

  it('names the switch after the kind of the level', () => {
    expect(render().find('[data-test="scope-switch"]').attributes('aria-label')).toBe('Switch customer')
  })

  it('loads the siblings on first open and marks the current one', async () => {
    const w = render()
    expect(levels[0]!.siblings).not.toHaveBeenCalled()

    await w.find('[data-test="menu"]').trigger('click')
    await flushPromises()

    const entries = w.findAll('[data-test="menu-item"]')
    expect(entries.map(e => e.text())).toEqual(['ACME Ltd', 'Beta GmbH'])
    expect(entries[0]!.attributes('data-icon')).toBe('i-lucide-check')
    expect(entries[1]!.attributes('data-to')).toBe('/c/c2')

    await w.find('[data-test="menu"]').trigger('click')
    expect(levels[0]!.siblings).toHaveBeenCalledTimes(1)
  })

  it('keeps working when the siblings cannot be loaded', async () => {
    const w = render({ levels: [{ key: 'x', label: 'X', to: '/x', siblings: () => Promise.reject(new Error('down')) }] })
    await w.find('[data-test="menu"]').trigger('click')
    await flushPromises()
    expect(w.findAll('[data-test="menu-item"]')).toHaveLength(0)
    expect(w.find('.basekit-scope-link').attributes('href')).toBe('/x')
  })

  it('renders marker, root link and the after slot', () => {
    const w = mount(BaseKitScopeBreadcrumb, {
      props: { levels, marker: { icon: 'i-lucide-flag', class: 'm' }, root: { label: 'Customers', to: '/c' } },
      slots: { after: '<span data-test="status">active</span>' },
      global: { stubs },
    })
    expect(w.find('[data-test="scope-marker"]').classes()).toContain('m')
    expect(w.find('.basekit-scope-root').attributes('href')).toBe('/c')
    expect(w.find('[data-test="status"]').exists()).toBe(true)
  })
})
