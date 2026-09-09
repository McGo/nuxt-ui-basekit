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
  it('zeigt den Kreisel statt des Inhalts, solange geladen wird', () => {
    const w = render({ pending: true })

    expect(w.find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(true)
    expect(w.find('.inhalt').exists()).toBe(false)
  })

  it('gibt den Inhalt frei, sobald die Daten stehen', () => {
    const w = render({ pending: false })

    expect(w.find('.inhalt').exists()).toBe(true)
    expect(w.find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(false)
  })

  it('wartet ohne Angabe — die Daten sind eher noch nicht da als schon', () => {
    // Der Standard entscheidet, was ein vergessenes Prop bewirkt. Lieber ein
    // Kreisel zu viel als ein leeres Formular, das nach „nichts da" aussieht.
    expect(render().find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(true)
  })

  it('nennt den Vorgang nur, wenn er einen Namen hat', () => {
    expect(render({ pending: true }).text()).toBe('')
    expect(render({ pending: true, label: 'Suche läuft' }).text()).toBe('Suche läuft')
  })

  it('meldet sich als Statusbereich an, damit Vorlesesoftware es mitbekommt', () => {
    const box = render({ pending: true }).find('[role="status"]')

    expect(box.exists()).toBe(true)
    expect(box.attributes('aria-live')).toBe('polite')
  })

  it('hält für eine ganze Seite mehr Höhe frei als für einen Abschnitt', () => {
    // Ohne Mindesthöhe springt das Layout, sobald der Inhalt erscheint.
    expect(render({ pending: true, size: 'page' }).find('[role="status"]').classes()).toContain('min-h-64')
    expect(render({ pending: true, size: 'inline' }).find('[role="status"]').classes()).toContain('min-h-24')
  })
})
