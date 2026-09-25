import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useRoute, useRouter } from '#imports'
import BaseKitSectionTabs from '../app/components/BaseKitSectionTabs.vue'

// Nuxt UI as thin stand-ins: the links and options end up as data attributes,
// so the cases can read what the component hands over.
const stubs = {
  UNavigationMenu: {
    props: ['items'],
    template: `<nav><a v-for="i in items" :key="i.label" :data-test="i['data-test']"
      :data-active="i.active ? '' : undefined" :data-to="JSON.stringify(i.to)"
      :data-badge="i.badge">{{ i.label }}</a></nav>`,
  },
  USelect: { props: ['items', 'modelValue'], template: '<select :data-value="modelValue" />' },
  UTabs: {
    props: ['items', 'modelValue'],
    emits: ['update:modelValue'],
    template: `<div data-test="sub-tabs" :data-value="modelValue">
      <button v-for="i in items" :key="i.value" :data-test="'sub-' + i.value"
        @click="$emit('update:modelValue', i.value)">{{ i.label }}</button></div>`,
  },
}

const items = [
  { key: 'overview', label: 'Overview', icon: 'i-lucide-layout-dashboard', children: [{ key: 'overview', label: 'Overview', to: '/c/1/projects' }] },
  {
    key: 'work', label: 'Work & time', children: [
      { key: 'tasks', label: 'Tasks', to: '/c/1/tasks' },
      { key: 'time', label: 'Time', to: '/c/1/time', badge: 2 },
    ],
  },
  { key: 'finance', label: 'Finance', badge: 3, children: [{ key: 'invoices', label: 'Invoices', to: '/c/1/invoices' }] },
]

function route(r: { path?: string, query?: Record<string, string> }) {
  vi.mocked(useRoute).mockReturnValue({ path: r.path ?? '/p', params: {}, query: r.query ?? {}, hash: '' } as never)
}

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitSectionTabs, {
    props: { items, ...props },
    slots: { default: '<template #default="{ section, sub }"><p data-test="content">{{ section }}/{{ sub }}</p></template>' },
    global: { stubs },
  })
}

describe('BaseKitSectionTabs', () => {
  afterEach(() => {
    vi.mocked(useRoute).mockReturnValue({ path: '/', params: {}, query: {}, hash: '' } as never)
    vi.mocked(useRouter).mockReturnValue({ replace: vi.fn(), push: vi.fn() } as never)
  })

  it('starts on the first section and its first sub-section', () => {
    route({})
    const w = render()
    expect(w.find('[data-test="content"]').text()).toBe('overview/overview')
    expect(w.find('[data-test="section-overview"]').attributes('data-active')).toBe('')
  })

  it('reads section and sub-section from the query', () => {
    route({ query: { section: 'work', sub: 'time' } })
    expect(render().find('[data-test="content"]').text()).toBe('work/time')
  })

  it('falls back to the first sub-section for an unknown one', () => {
    route({ query: { section: 'work', sub: 'nope' } })
    expect(render().find('[data-test="content"]').text()).toBe('work/tasks')
  })

  it('shows the second row only for a section with more than one sub-section', () => {
    route({ query: { section: 'finance' } })
    expect(render().find('[data-test="sub-tabs"]').exists()).toBe(false)
    route({ query: { section: 'work' } })
    expect(render().find('[data-test="sub-tabs"]').exists()).toBe(true)
  })

  it('writes the sub-section into the query', async () => {
    const replace = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ replace, push: vi.fn() } as never)
    route({ path: '/p', query: { section: 'work' } })
    await render().find('[data-test="sub-time"]').trigger('click')
    expect(replace).toHaveBeenCalledWith({ path: '/p', query: { section: 'work', sub: 'time' } })
  })

  it('links the first section without parameters, the others with', () => {
    route({ path: '/p' })
    const w = render()
    expect(JSON.parse(w.find('[data-test="section-overview"]').attributes('data-to')!)).toEqual({ path: '/p', query: {} })
    expect(JSON.parse(w.find('[data-test="section-work"]').attributes('data-to')!)).toEqual({ path: '/p', query: { section: 'work' } })
  })

  it('uses its own parameter names when asked', () => {
    route({ query: { bereich: 'work', unter: 'time' } })
    expect(render({ queryKeys: { section: 'bereich', sub: 'unter' } }).find('[data-test="content"]').text()).toBe('work/time')
  })

  it('rewrites a legacy parameter once on mount', () => {
    const replace = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ replace, push: vi.fn() } as never)
    route({ query: { tab: 'time', keep: 'x' } })
    render({ legacy: { param: 'tab', map: { time: ['work', 'time'] } } })
    expect(replace).toHaveBeenCalledWith({ query: { keep: 'x', section: 'work', sub: 'time' } })
  })

  it('leaves the address alone when the legacy value is unknown', () => {
    const replace = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ replace, push: vi.fn() } as never)
    route({ query: { tab: 'gone' } })
    render({ legacy: { param: 'tab', map: { time: ['work', 'time'] } } })
    expect(replace).not.toHaveBeenCalled()
  })

  it('in route mode takes the active tab from the path, longest match first', () => {
    route({ path: '/c/1/time' })
    const w = render({ mode: 'route' })
    expect(w.find('[data-test="content"]').text()).toBe('work/time')
    expect(JSON.parse(w.find('[data-test="section-work"]').attributes('data-to')!)).toBe('/c/1/tasks')
  })

  it('in route mode also matches pages below a sub-section', () => {
    route({ path: '/c/1/invoices/42' })
    expect(render({ mode: 'route' }).find('[data-test="content"]').text()).toBe('finance/invoices')
  })

  it('passes a real count as badge and hides zero', () => {
    route({})
    const w = render()
    expect(w.find('[data-test="section-finance"]').attributes('data-badge')).toBe('3')
    expect(w.find('[data-test="section-work"]').attributes('data-badge')).toBeUndefined()
  })
})
