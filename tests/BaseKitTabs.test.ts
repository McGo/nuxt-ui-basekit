import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useRoute, useRouter } from '#imports'
import BaseKitTabs from '../app/components/BaseKitTabs.vue'

const items = [
  { key: 'general', label: 'Allgemein' },
  { key: 'notifications', label: 'Benachrichtigungen' },
  { key: 'access', label: 'Zugriff' },
]

const slots = {
  general: '<div class="p-general">G</div>',
  notifications: '<div class="p-notifications">N</div>',
  access: '<div class="p-access">A</div>',
}

const stubs = { UIcon: { template: '<i />' } }

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitTabs, { props: { items, ...props }, slots, global: { stubs } })
}

describe('BaseKitTabs', () => {
  // Two cases set `useRoute` permanently, because they render several times.
  // Reset to the default from `tests/setup.ts` afterwards, or the hash bleeds
  // into the next case.
  afterEach(() => {
    vi.mocked(useRoute).mockReturnValue({ path: '/', params: {}, query: {}, hash: '' } as never)
  })

  it('renders one tab per item', () => {
    expect(render().findAll('[role="tab"]')).toHaveLength(3)
  })

  it('shows the first tab panel by default', () => {
    const w = render()
    expect(w.find('.p-general').exists()).toBe(true)
    expect(w.find('.p-access').exists()).toBe(false)
  })

  it('switches panel and emits on click', async () => {
    const w = render()
    await w.findAll('[role="tab"]')[2]!.trigger('click')
    expect(w.find('.p-access').exists()).toBe(true)
    expect(w.find('.p-general').exists()).toBe(false)
    expect(w.emitted('update:modelValue')!.at(-1)![0]).toBe('access')
  })

  it('respects the v-model value', () => {
    const w = render({ modelValue: 'notifications' })
    expect(w.find('.p-notifications').exists()).toBe(true)
    expect(w.find('.p-general').exists()).toBe(false)
  })

  it('marks the active tab via aria-selected', () => {
    const w = render({ modelValue: 'access' })
    const active = w.findAll('[role="tab"]').find(b => b.attributes('aria-selected') === 'true')
    expect(active?.text()).toContain('Zugriff')
  })

  it('moves between tabs with arrow keys', async () => {
    const w = render()
    await w.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')!.at(-1)![0]).toBe('notifications')
    expect(w.find('.p-notifications').exists()).toBe(true)
  })

  // The hash only applies after mount — the server never sees it — so give it
  // a tick before checking.
  it('activates the tab from the URL hash when hashNav is on', async () => {
    vi.mocked(useRoute).mockReturnValueOnce({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    const w = render({ hashNav: true })
    await nextTick()
    expect(w.find('.p-access').exists()).toBe(true)
    expect(w.find('.p-general').exists()).toBe(false)
  })

  it('first renders like the server and only then switches to the hash tab', () => {
    vi.mocked(useRoute).mockReturnValueOnce({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    // Without a tick: the first render has to match the server, otherwise
    // hydration tears apart — marker on one tab, content from the other.
    const w = render({ hashNav: true })
    expect(w.find('.p-general').exists()).toBe(true)
  })

  it('reports the tab from the hash to the v-model', async () => {
    vi.mocked(useRoute).mockReturnValueOnce({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    const w = render({ hashNav: true })
    await nextTick()
    expect(w.emitted('update:modelValue')!.at(-1)![0]).toBe('access')
  })

  it('marks tab and content alike once the hash applies', async () => {
    vi.mocked(useRoute).mockReturnValueOnce({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    const w = render({ hashNav: true })
    await nextTick()

    const selected = w.findAll('[role="tab"]').find(b => b.attributes('aria-selected') === 'true')
    expect(selected?.text()).toContain('Zugriff')
    expect(w.find('[role="tabpanel"]').attributes('aria-labelledby')).toBe('basekit-tab-access')
  })

  it('takes the hash tab even when it only appears later', async () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    // Permission-dependent tabs arrive late, so the tab named in the hash is
    // missing at first.
    const w = render({ hashNav: true, items: items.slice(0, 2) })
    await nextTick()
    expect(w.find('.p-general').exists()).toBe(true)

    await w.setProps({ items })
    await nextTick()
    expect(w.find('.p-access').exists()).toBe(true)
  })

  it('leaves a made choice alone when tabs arrive later', async () => {
    vi.mocked(useRoute).mockReturnValue({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    const w = render({ hashNav: true, items: items.slice(0, 2) })
    await w.findAll('[role="tab"]')[1]!.trigger('click')

    await w.setProps({ items })
    await nextTick()
    expect(w.find('.p-notifications').exists()).toBe(true)
  })

  it('writes the hash via router.replace on select when hashNav is on', async () => {
    const replace = vi.fn()
    vi.mocked(useRouter).mockReturnValueOnce({ replace, push: vi.fn() } as never)
    const w = render({ hashNav: true })
    await w.findAll('[role="tab"]')[1]!.trigger('click')
    expect(replace).toHaveBeenCalledWith({ hash: '#notifications' })
  })

  it('ignores the hash when hashNav is off', () => {
    vi.mocked(useRoute).mockReturnValueOnce({ path: '/', params: {}, query: {}, hash: '#access' } as never)
    const w = render()
    expect(w.find('.p-general').exists()).toBe(true)
  })
})
