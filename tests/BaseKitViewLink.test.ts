import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitViewLink from '../app/components/BaseKitViewLink.vue'

const UButton = {
  props: ['to', 'icon', 'target', 'rel'],
  template: '<a :href="to" :data-icon="icon" :target="target" :rel="rel"><slot /></a>',
}

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitViewLink, {
    props: { to: '/trikipedia', ...props },
    global: { stubs: { UButton } },
  })
}

describe('BaseKitViewLink', () => {
  it('leads to the view of the thing being edited', () => {
    expect(render().find('a').attributes('href')).toBe('/trikipedia')
  })

  it('names the direction, not the target', () => {
    // Hard-wired like the back link: anyone moving between areas should not
    // have to recognise the way to the view by a different label each time.
    expect(render().text()).toBe('View')
  })

  it('opens in a new tab so nothing unsaved is lost', () => {
    const a = render().find('a')

    expect(a.attributes('target')).toBe('_blank')
    // `noopener`, because a foreign tab could otherwise reach back into the form.
    expect(a.attributes('rel')).toBe('noopener')
  })

  it('stays in the same tab where that is wanted', () => {
    const a = render({ newTab: false }).find('a')

    expect(a.attributes('target')).toBeUndefined()
    expect(a.attributes('rel')).toBeUndefined()
  })

  it('carries an icon hinting at the move outwards', () => {
    expect(render().find('a').attributes('data-icon')).toBe('i-lucide-external-link')
  })

  it('takes its own label where "View" is too vague', () => {
    expect(render({ label: 'Zur Gruppenseite' }).text()).toBe('Zur Gruppenseite')
  })
})
