import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitBackLink from '../app/components/BaseKitBackLink.vue'

const UButton = {
  props: ['to', 'icon'],
  template: '<a :href="to" :data-icon="icon"><slot /></a>',
}

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitBackLink, {
    props: { to: '/admin/forms', ...props },
    global: { stubs: { UButton } },
  })
}

describe('BaseKitBackLink', () => {
  it('links to the given target', () => {
    expect(render().find('a').attributes('href')).toBe('/admin/forms')
  })

  it('says where it goes in direction, not by naming the list', () => {
    // Fest verdrahtet: wer zwischen Bereichen wechselt, soll den Rücksprung
    // nicht jedes Mal an einer anderen Beschriftung erkennen müssen.
    expect(render().text()).toBe('Zurück zur Übersicht')
  })

  it('carries the arrow so it reads as a way back at a glance', () => {
    expect(render().find('a').attributes('data-icon')).toBe('i-lucide-arrow-left')
  })

  it('takes an explicit label where the target is not a list', () => {
    expect(render({ label: 'Zurück zum Artikel' }).text()).toBe('Zurück zum Artikel')
  })
})
