import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitRecordPicker from '../app/components/BaseKitRecordPicker.vue'

// UModal-Stub rendert den #body-Slot immer (open wird ignoriert), damit die
// Liste im Test inspizierbar ist.
const UModal = { props: ['open', 'title'], template: '<div class="u-modal"><slot name="body" /></div>' }
const UButton = { template: '<button class="u-btn"><slot /></button>' }
const UInput = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<input class="u-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}
const UBadge = { template: '<span class="u-badge"><slot /></span>' }
const NuxtLink = { props: ['to'], template: '<a :href="to"><slot /></a>' }
const UIcon = { template: '<i />' }

const items = [
  { value: 1, label: 'Impressum', type: 'Seite', hint: '/impressum', editHref: '/admin/pages/1' },
  { value: 2, label: 'Angebote', type: 'Rubrik', hint: '/angebote', editHref: '/admin/spaces/2' },
  { value: 3, label: 'Datenschutz', type: 'Seite', hint: '/datenschutz', editHref: '/admin/pages/3' },
]

function render(modelValue: number | null) {
  return mount(BaseKitRecordPicker, {
    props: { modelValue, items },
    global: { stubs: { UModal, UButton, UInput, UBadge, NuxtLink, UIcon } },
  })
}

function listRows(w: ReturnType<typeof render>) {
  return w.findAll('li button')
}

describe('BaseKitRecordPicker', () => {
  it('shows a "select" trigger when nothing is selected', () => {
    expect(render(null).text()).toContain('Select')
  })

  it('shows the title with an edit link + "change" when selected', () => {
    const w = render(2)
    expect(w.text()).toContain('Angebote')
    expect(w.find('a[href="/admin/spaces/2"]').exists()).toBe(true)
    expect(w.text()).toContain('Change')
  })

  it('emits the chosen record from the modal list', async () => {
    const w = render(null)
    const row = listRows(w).find(b => b.text().includes('Impressum'))
    await row!.trigger('click')
    expect(w.emitted('update:modelValue')!.at(-1)![0]).toBe(1)
  })

  it('filters the list by type', async () => {
    const w = render(null)
    const rubrikBtn = w.findAll('.u-btn').find(b => b.text() === 'Rubrik')
    await rubrikBtn!.trigger('click')
    const labels = listRows(w).map(b => b.text())
    expect(labels.some(l => l.includes('Angebote'))).toBe(true)
    expect(labels.some(l => l.includes('Impressum'))).toBe(false)
  })

  it('filters the list by text search', async () => {
    const w = render(null)
    await w.find('.u-input').setValue('daten')
    const labels = listRows(w).map(b => b.text())
    expect(labels).toHaveLength(1)
    expect(labels[0]).toContain('Datenschutz')
  })
})
