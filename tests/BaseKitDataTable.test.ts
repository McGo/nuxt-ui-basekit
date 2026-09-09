import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitDataTable from '../app/components/BaseKitDataTable.vue'

const UInput = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<input class="u-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}
const UButton = { emits: ['click'], template: '<button class="u-btn" @click="$emit(\'click\')"><slot /></button>' }
const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }
// Native <select>, dessen Options-Index auf den echten (number | 'all')-Wert mappt.
const USelect = {
  props: ['modelValue', 'items'],
  emits: ['update:modelValue'],
  methods: {
    onChange(this: { items: { value: unknown }[], $emit: (e: string, v: unknown) => void }, e: Event) {
      this.$emit('update:modelValue', this.items[Number((e.target as HTMLSelectElement).value)]!.value)
    },
  },
  template: '<select class="u-select" @change="onChange"><option v-for="(it, i) in items" :key="i" :value="i">{{ it.label }}</option></select>',
}
const UPagination = {
  props: ['page', 'total', 'itemsPerPage'],
  emits: ['update:page'],
  template: '<div class="u-pagination"><button class="pg-next" @click="$emit(\'update:page\', page + 1)">next</button></div>',
}
// BaseKitEmptyState wird im leeren Default-Slot der Tabelle gerendert.
const BaseKitEmptyState = {
  props: ['title', 'description', 'variant', 'icon'],
  template: '<div class="empty-state">{{ title }}<span v-if="description"> {{ description }}</span><slot /></div>',
}

const columns = [
  { key: 'title', label: 'Titel', sortable: true },
  { key: 'count', label: 'Anzahl', sortable: true },
  { key: 'path', label: 'Pfad' },
]
const rows = [
  { id: 1, title: 'Beta', count: 3, path: '/beta' },
  { id: 2, title: 'Alpha', count: 10, path: '/alpha' },
  { id: 3, title: 'Gamma', count: 1, path: '/gamma' },
]

function render(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BaseKitDataTable, {
    props: { columns, rows, ...props },
    slots,
    global: { stubs: { UInput, UButton, UIcon, USelect, UPagination, BaseKitEmptyState } },
  })
}

function bodyTitles(w: ReturnType<typeof render>): string[] {
  return w.findAll('tbody tr').map(tr => tr.find('td').text())
}

describe('BaseKitDataTable', () => {
  it('renders one row per record', () => {
    expect(render().findAll('tbody tr')).toHaveLength(3)
  })

  it('sorts ascending then descending on a sortable header click', async () => {
    const w = render()
    // Sortier-Klick liegt auf dem fokussierbaren Button im Kopf (a11y).
    const titleHeader = w.findAll('th')[0]!.find('button')
    await titleHeader.trigger('click')
    expect(bodyTitles(w)).toEqual(['Alpha', 'Beta', 'Gamma'])
    await titleHeader.trigger('click')
    expect(bodyTitles(w)).toEqual(['Gamma', 'Beta', 'Alpha'])
  })

  it('sorts numeric columns numerically, not lexically', async () => {
    const w = render()
    await w.findAll('th')[1]!.find('button').trigger('click') // count asc
    expect(bodyTitles(w)).toEqual(['Gamma', 'Beta', 'Alpha']) // 1, 3, 10
  })

  it('does not sort on a non-sortable header', async () => {
    const w = render()
    // Nicht sortierbare Spalte hat keinen Button — Klick auf den Kopf tut nichts.
    await w.findAll('th')[2]!.trigger('click') // path (not sortable)
    expect(bodyTitles(w)).toEqual(['Beta', 'Alpha', 'Gamma'])
  })

  it('filters rows by the search box', async () => {
    const w = render()
    await w.find('.u-input').setValue('alph')
    expect(bodyTitles(w)).toEqual(['Alpha'])
  })

  it('shows the empty state when the filter matches nothing', async () => {
    const w = render()
    await w.find('.u-input').setValue('zzz')
    expect(w.find('tbody').exists()).toBe(false)
    expect(w.text()).toContain('Keine Treffer')
  })

  it('emits create when the create button is clicked', async () => {
    const w = render({ createLabel: 'Anlegen' })
    const btn = w.findAll('.u-btn').find(b => b.text() === 'Anlegen')
    await btn!.trigger('click')
    expect(w.emitted('create')).toHaveLength(1)
  })

  it('renders the actions slot only when provided', () => {
    expect(render().find('tbody tr td:last-child .row-action').exists()).toBe(false)
    const w = render({}, { actions: '<button class="row-action">x</button>' })
    expect(w.findAll('.row-action')).toHaveLength(3)
  })

  it('renders a custom cell slot', () => {
    const w = render({}, { 'cell-path': '<span class="custom">!{{ params.value }}</span>' })
    expect(w.find('.custom').exists()).toBe(true)
  })

  it('limits rows to the selected page size', () => {
    const w = render({ pageSize: 2 })
    expect(w.findAll('tbody tr')).toHaveLength(2)
  })

  it('shows the next page when paginating forward', async () => {
    const w = render({ pageSize: 2 })
    await w.find('.pg-next').trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(1) // 3 rows → page 2 holds the remainder
  })

  it('renders all rows without pagination controls when page size is "all"', () => {
    const w = render({ pageSize: 'all', pageSizeOptions: [2, 'all'] })
    expect(w.findAll('tbody tr')).toHaveLength(3)
    expect(w.find('.u-pagination').exists()).toBe(false)
  })

  it('changes the page size via the select', async () => {
    const w = render({ pageSize: 'all', pageSizeOptions: ['all', 2] })
    expect(w.findAll('tbody tr')).toHaveLength(3)
    await w.find('.u-select').setValue('1') // index 1 → value 2
    expect(w.findAll('tbody tr')).toHaveLength(2)
  })

  it('resets to the first page when the search narrows the result', async () => {
    const w = render({ pageSize: 2 })
    await w.find('.pg-next').trigger('click') // now on page 2
    await w.find('.u-input').setValue('a') // matches Beta, Alpha, Gamma → back to page 1
    expect(w.findAll('tbody tr')).toHaveLength(2)
    expect(bodyTitles(w)).toEqual(['Beta', 'Alpha'])
  })

  it('hides the footer in the empty state', async () => {
    const w = render()
    await w.find('.u-input').setValue('zzz')
    expect(w.find('.u-select').exists()).toBe(false)
  })

  it('links the name column when a row link is given', () => {
    const w = render({ rowLink: (row: { id: number }) => `/admin/pages/${row.id}/edit` })

    const links = w.findAll('a')
    // Ein Link je Zeile — nur in der Namensspalte, nicht in jeder Zelle.
    expect(links).toHaveLength(rows.length)
    expect(links.map(a => a.text())).toContain('Beta')
    expect(links.map(a => a.attributes('href'))).toContain('/admin/pages/1/edit')
  })

  it('links the column named by link-column', () => {
    const w = render({ rowLink: (row: { id: number }) => `/x/${row.id}`, linkColumn: 'path' })

    expect(w.findAll('a').map(a => a.text())).toContain('/beta')
  })

  it('leaves rows without a target unlinked', () => {
    const w = render({ rowLink: () => null })

    expect(w.findAll('a')).toHaveLength(0)
    expect(w.text()).toContain('Beta')
  })
})
