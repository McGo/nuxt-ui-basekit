import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChoiceCard from '../app/components/BaseKitChoiceCard.vue'

const stubs = {
  UBadge: { name: 'UBadge', template: '<span data-test="badge"><slot /></span>' },
  UButton: {
    name: 'UButton',
    props: { loading: { type: Boolean, default: false } },
    // Kein eigenes `click`-Emit: der native Klick fällt durch, sonst zählt der
    // Test den Knopfdruck doppelt.
    template: '<button data-test="apply" :disabled="loading"><slot /></button>',
  },
}

function mountCard(props: Record<string, unknown> = {}) {
  return mount(BaseKitChoiceCard, {
    props: { title: 'Dunkel', ...props },
    slots: { preview: '<div data-test="preview">Vorschau</div>' },
    global: { stubs },
  })
}

describe('BaseKitChoiceCard', () => {
  it('rendert Titel, Beschreibung und Vorschau', () => {
    const wrapper = mountCard({ description: 'Dunkle Farbwelt' })
    expect(wrapper.text()).toContain('Dunkel')
    expect(wrapper.text()).toContain('Dunkle Farbwelt')
    expect(wrapper.find('[data-test="preview"]').exists()).toBe(true)
  })

  it('zeigt bei aktiver Variante das Kennzeichen statt des Knopfes', () => {
    const wrapper = mountCard({ active: true, activeLabel: 'Aktiv' })
    expect(wrapper.find('[data-test="badge"]').text()).toBe('Aktiv')
    expect(wrapper.find('[data-test="apply"]').exists()).toBe(false)
    expect(wrapper.attributes('aria-current')).toBe('true')
  })

  it('zeigt sonst den Übernehmen-Knopf und meldet den Klick', async () => {
    const wrapper = mountCard({ applyLabel: 'Übernehmen' })
    const button = wrapper.find('[data-test="apply"]')
    expect(button.text()).toBe('Übernehmen')
    expect(wrapper.find('[data-test="badge"]').exists()).toBe(false)

    await button.trigger('click')
    expect(wrapper.emitted('apply')).toHaveLength(1)
  })

  it('sperrt den Knopf, solange gespeichert wird', () => {
    const wrapper = mountCard({ pending: true })
    expect(wrapper.find('[data-test="apply"]').attributes('disabled')).toBeDefined()
  })

  it('markiert die aktive Karte auch visuell', () => {
    expect(mountCard({ active: true }).classes()).toContain('border-primary-500')
    expect(mountCard().classes()).not.toContain('border-primary-500')
  })
})
