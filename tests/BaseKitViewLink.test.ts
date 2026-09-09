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
  it('führt zur Ansicht der bearbeiteten Sache', () => {
    expect(render().find('a').attributes('href')).toBe('/trikipedia')
  })

  it('nennt die Richtung, nicht das Ziel', () => {
    // Fest verdrahtet wie beim Rücksprung: wer zwischen Bereichen wechselt,
    // soll den Weg zur Ansicht nicht jedes Mal an einer anderen Beschriftung
    // erkennen müssen.
    expect(render().text()).toBe('Ansehen')
  })

  it('öffnet in einem neuen Reiter, damit nichts Ungespeichertes verlorengeht', () => {
    const a = render().find('a')

    expect(a.attributes('target')).toBe('_blank')
    // `noopener`, weil ein fremder Reiter sonst auf das Formular zurückgreifen kann.
    expect(a.attributes('rel')).toBe('noopener')
  })

  it('bleibt im selben Reiter, wo das gewollt ist', () => {
    const a = render({ newTab: false }).find('a')

    expect(a.attributes('target')).toBeUndefined()
    expect(a.attributes('rel')).toBeUndefined()
  })

  it('trägt ein Symbol, das den Wechsel nach außen andeutet', () => {
    expect(render().find('a').attributes('data-icon')).toBe('i-lucide-external-link')
  })

  it('nimmt eine eigene Beschriftung, wo „Ansehen" zu unbestimmt ist', () => {
    expect(render({ label: 'Zur Gruppenseite' }).text()).toBe('Zur Gruppenseite')
  })
})
