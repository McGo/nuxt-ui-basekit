import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitDataTable from '../app/components/BaseKitDataTable.vue'

/**
 * Picking several rows at once.
 *
 * The table offers the selection and nothing else: what to do with it belongs
 * to the caller, through the `selection` slot. A table that both selects and
 * acts would carry knowledge it has no business having — and every caller
 * would inherit an action it may not want.
 *
 * The header checkbox covers **what is shown**, not the whole table. With a
 * filter or a page size set, "all" means the rows in front of you; selecting
 * what you cannot see is how people change the wrong records.
 */
const UInput = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<input class="u-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}
const UButton = { emits: ['click'], template: '<button class="u-btn" @click="$emit(\'click\')"><slot /></button>' }
const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }
const USelect = { props: ['modelValue', 'items'], template: '<select class="u-select" />' }
const UPagination = { props: ['page', 'total', 'itemsPerPage'], template: '<div class="u-pagination" />' }
const BaseKitEmptyState = { props: ['title'], template: '<div class="empty-state">{{ title }}</div>' }
const UCheckbox = {
  props: ['modelValue', 'indeterminate', 'ariaLabel'],
  emits: ['update:modelValue'],
  template: '<input type="checkbox" class="cb" :checked="modelValue"'
    + ' :data-indeterminate="indeterminate ? \'1\' : \'0\'"'
    + ' @change="$emit(\'update:modelValue\', !modelValue)" />',
}

const columns = [
  { key: 'title', label: 'Titel' },
  { key: 'count', label: 'Anzahl' },
]
const rows = [
  { id: 1, title: 'Beta', count: 3 },
  { id: 2, title: 'Alpha', count: 10 },
  { id: 3, title: 'Gamma', count: 1 },
]

function render(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BaseKitDataTable, {
    props: { columns, rows, selectable: true, ...props },
    slots,
    global: { stubs: { UInput, UButton, UIcon, USelect, UPagination, BaseKitEmptyState, UCheckbox } },
  })
}

/** Every checkbox: the header one first, then one per row. */
function boxes(w: ReturnType<typeof render>) {
  return w.findAll('.cb')
}

describe('BaseKitDataTable — selection', () => {
  it('offers no checkboxes unless asked for', () => {
    const w = render({ selectable: false })

    expect(boxes(w)).toHaveLength(0)
  })

  it('renders a header box and one per row', () => {
    // Three rows plus the header.
    expect(boxes(render())).toHaveLength(4)
  })

  it('emits the row key when a row is picked', async () => {
    const w = render()

    await boxes(w)[1]!.trigger('change')

    expect(w.emitted('update:selected')?.[0]).toEqual([['1']])
  })

  it('drops a row that was already picked', async () => {
    const w = render({ selected: ['1'] })

    await boxes(w)[1]!.trigger('change')

    expect(w.emitted('update:selected')?.[0]).toEqual([[]])
  })

  it('the header box picks every row shown', async () => {
    const w = render()

    await boxes(w)[0]!.trigger('change')

    expect(w.emitted('update:selected')?.[0]).toEqual([['1', '2', '3']])
  })

  it('the header box clears exactly the rows shown', async () => {
    // A selection made elsewhere survives — the bar says how many, and the
    // number must not drop for rows nobody touched.
    const w = render({ selected: ['1', '2', '3', '99'] })

    await boxes(w)[0]!.trigger('change')

    expect(w.emitted('update:selected')?.[0]).toEqual([['99']])
  })

  it('the header box stands half-filled while only some rows are picked', () => {
    const w = render({ selected: ['1'] })

    expect(boxes(w)[0]!.attributes('data-indeterminate')).toBe('1')
  })

  it('shows the bar only once something is selected', () => {
    expect(render().find('[data-test="selection-bar"]').exists()).toBe(false)
    expect(render({ selected: ['1'] }).find('[data-test="selection-bar"]').exists()).toBe(true)
  })

  it('hands the selection to the slot and offers a way to drop it', async () => {
    const w = render(
      { selected: ['1', '2'] },
      { selection: '<button class="mine" @click="params.clear()">{{ params.selected.length }}</button>' },
    )

    const mine = w.find('.mine')
    expect(mine.text()).toBe('2')

    await mine.trigger('click')
    expect(w.emitted('update:selected')?.at(-1)).toEqual([[]])
  })
})
