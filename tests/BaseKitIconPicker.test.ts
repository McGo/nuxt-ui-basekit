import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitIconPicker from '../app/components/BaseKitIconPicker.vue'

const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }
const UInput = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<input class="u-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}
const UButton = { props: ['icon'], emits: ['click'], template: '<button class="u-btn" @click="$emit(\'click\')"><slot /></button>' }
// Popover rendert Trigger + Inhalt direkt (im Test immer offen).
const UPopover = { props: ['open'], template: '<div class="u-pop"><slot /><slot name="content" /></div>' }

function render(modelValue = 'i-lucide-file-text') {
  return mount(BaseKitIconPicker, {
    props: { modelValue },
    global: { stubs: { UIcon, UInput, UButton, UPopover } },
  })
}

describe('BaseKitIconPicker', () => {
  it('shows the current icon in the trigger', () => {
    expect(render('i-lucide-home').find('[data-icon="i-lucide-home"]').exists()).toBe(true)
  })

  it('shows a placeholder label when no icon is set', () => {
    expect(render('').text()).toContain('Symbol wählen')
  })

  it('has no free-text field for the icon name (picker only)', () => {
    // Nur das Suchfeld im Popover ist ein Input — kein Freitext fürs Icon selbst.
    expect(render().findAll('.u-input')).toHaveLength(1)
  })

  it('filters the grid by the search box', async () => {
    const w = render()
    const before = w.findAll('button[title^="i-lucide-"]').length
    await w.find('.u-input').setValue('calendar')
    const after = w.findAll('button[title^="i-lucide-"]').length
    expect(after).toBeGreaterThan(0)
    expect(after).toBeLessThan(before)
    expect(w.find('[title="i-lucide-calendar"]').exists()).toBe(true)
  })

  it('emits the icon when one is picked from the grid', async () => {
    const w = render()
    await w.find('[title="i-lucide-home"]').trigger('click')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['i-lucide-home'])
  })

  it('clears the icon via the clear button', async () => {
    const w = render('i-lucide-home')
    const clear = w.findAll('.u-btn').find(b => b.text() === 'Kein Symbol')!
    await clear.trigger('click')
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([''])
  })
})
