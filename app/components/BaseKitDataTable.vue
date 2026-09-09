<script setup lang="ts" generic="T extends object">
import { computed, ref, useSlots, watch } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'
import { NuxtLink } from '#components'

/**
 * A reusable admin table: sortable columns, a text filter and a create button
 * top right. Client-side throughout — the rows are handed in.
 *
 * - `columns` defines the columns; `sortable` makes a header clickable.
 * - Cells render `row[key]` by default, overridable through the slot
 *   `#cell-<key>="{ row, value }"`.
 * - Row actions go into the slot `#actions="{ row }"`, the rightmost column.
 * - `row-link` makes the name column clickable: the function receives the row
 *   and returns its target, or `null` where that row has none. Which column
 *   carries the link is `link-column`; without it, the first.
 * - Extra filters go into the slot `#toolbar`, right of the search field.
 * - `create-label` plus `@create` renders the button top right.
 * - Pagination is client-side: `page-size` and `page-size-options` (default
 *   25, offering 10/25/50/100/250/all).
 *
 * Generic over the row type `T` — slots hand `row` back typed.
 */
export interface BaseKitDataColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
  class?: string
}

/** Page size: a fixed number of rows, or `'all'` for no limit. */
export type BaseKitPageSize = number | 'all'

const props = withDefaults(defineProps<{
  columns: BaseKitDataColumn[]
  rows: T[]
  rowKey?: string
  searchable?: boolean
  /** Fields the search looks through. Defaults to every column key. */
  searchKeys?: string[]
  searchPlaceholder?: string
  createLabel?: string
  loading?: boolean
  emptyLabel?: string
  /** Page size selected initially. */
  pageSize?: BaseKitPageSize
  /** The page sizes on offer. */
  pageSizeOptions?: BaseKitPageSize[]
  /**
   * Target per row. Set, it makes the name clickable — the route people try
   * first. The actions column stays regardless: it shows what there is besides
   * opening.
   */
  rowLink?: (row: T) => string | null | undefined
  /** The column carrying the link. Without it, the first. */
  linkColumn?: string
}>(), {
  rowKey: 'id',
  searchable: true,
  loading: false,
  pageSize: 25,
  pageSizeOptions: () => [10, 25, 50, 100, 250, 'all'],
})

const emit = defineEmits<{ create: [] }>()

const labels = useBaseKitLabels()
const slots = useSlots()
const hasActions = computed(() => !!slots.actions)

const search = ref('')
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

const searchFields = computed(() => props.searchKeys ?? props.columns.map(c => c.key))

/** The linked column — explicitly set, or the first. */
const linkKey = computed(() => props.linkColumn ?? props.columns[0]?.key ?? null)

function rowTarget(row: T, key: string): string | null {
  if (!props.rowLink || key !== linkKey.value) return null
  const target = props.rowLink(row)
  return target || null
}

/** Value of a cell — internal string indexing over the generic row type. */
function cell(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

const filtered = computed<T[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.rows
  return props.rows.filter(row =>
    searchFields.value.some((key) => {
      const v = cell(row, key)
      return v != null && String(v).toLowerCase().includes(q)
    }),
  )
})

const displayed = computed<T[]>(() => {
  if (!sortKey.value) return filtered.value
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => compare(cell(a, key), cell(b, key)) * dir)
})

// — Pagination -------------------------------------------------------------
const page = ref(1)
const pageSize = ref<BaseKitPageSize>(props.pageSize)

const total = computed(() => displayed.value.length)
const totalPages = computed(() =>
  pageSize.value === 'all' ? 1 : Math.max(1, Math.ceil(total.value / pageSize.value)),
)

const paged = computed<T[]>(() => {
  if (pageSize.value === 'all') return displayed.value
  const start = (page.value - 1) * pageSize.value
  return displayed.value.slice(start, start + pageSize.value)
})

const rangeFrom = computed(() =>
  total.value === 0 ? 0 : pageSize.value === 'all' ? 1 : (page.value - 1) * pageSize.value + 1,
)
const rangeTo = computed(() =>
  pageSize.value === 'all' ? total.value : Math.min(page.value * pageSize.value, total.value),
)

const pageSizeItems = computed(() =>
  props.pageSizeOptions.map(opt => ({
    label: opt === 'all' ? labels.value.all : String(opt),
    value: opt,
  })),
)

// Search or page size changed, so go back to page 1.
watch([search, pageSize], () => {
  page.value = 1
})

// The data shrank, through a filter say, so clamp the page into range.
watch(totalPages, (pages) => {
  if (page.value > pages) page.value = pages
})

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function toggleSort(col: BaseKitDataColumn): void {
  if (!col.sortable) return
  if (sortKey.value !== col.key) {
    sortKey.value = col.key
    sortDir.value = 'asc'
  }
  else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  }
  else {
    sortKey.value = null // dritter Klick: Sortierung aus
  }
}

function sortIcon(col: BaseKitDataColumn): string | null {
  if (sortKey.value !== col.key) return null
  return sortDir.value === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar: search on the left, filters and create on the right -->
    <div v-if="searchable || $slots.toolbar || createLabel" class="flex flex-wrap items-center justify-between gap-3">
      <UInput
        v-if="searchable"
        v-model="search"
        icon="i-lucide-search"
        :placeholder="searchPlaceholder ?? labels.search"
        class="w-72 max-w-full"
      />
      <span v-else />

      <div class="flex flex-wrap items-center gap-2">
        <slot name="toolbar" />
        <UButton v-if="createLabel" color="primary" icon="i-lucide-plus" @click="emit('create')">
          {{ createLabel }}
        </UButton>
      </div>
    </div>

    <!-- States -->
    <div v-if="loading" class="py-12 text-center text-muted">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
    </div>
    <div v-else-if="!displayed.length">
      <slot name="empty">
        <BaseKitEmptyState
          :variant="search.trim() ? 'search' : 'empty'"
          :title="search.trim() ? labels.noResults : (emptyLabel ?? labels.empty)"
          :description="search.trim() ? labels.noResultsHint : undefined"
        />
      </slot>
    </div>

    <!-- Table -->
    <table v-else class="w-full text-sm">
      <thead class="border-b border-neutral-200 text-left text-muted dark:border-neutral-800">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="py-2 font-medium"
            :class="[col.align === 'right' ? 'text-right' : '', col.class]"
            :aria-sort="col.sortable ? (sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="inline-flex cursor-pointer select-none items-center gap-1"
              :class="col.align === 'right' ? 'justify-end' : ''"
              @click="toggleSort(col)"
            >
              {{ col.label }}
              <UIcon v-if="sortIcon(col)" :name="sortIcon(col)!" class="size-3.5" />
            </button>
            <span v-else class="inline-flex items-center gap-1" :class="col.align === 'right' ? 'justify-end' : ''">
              {{ col.label }}
            </span>
          </th>
          <th v-if="hasActions" class="py-2 text-right font-medium" />
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
        <tr
          v-for="row in paged"
          :key="String(cell(row, rowKey))"
          class="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="py-2"
            :class="[col.align === 'right' ? 'text-right' : '', col.class]"
          >
            <component
              :is="rowTarget(row, col.key) ? NuxtLink : 'span'"
              :to="rowTarget(row, col.key) ?? undefined"
              :class="rowTarget(row, col.key) ? 'font-medium hover:text-primary-700 dark:hover:text-primary-300' : undefined"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="cell(row, col.key)">
                {{ cell(row, col.key) ?? '—' }}
              </slot>
            </component>
          </td>
          <td v-if="hasActions" class="py-2 text-right">
            <div class="flex justify-end gap-2">
              <slot name="actions" :row="row" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Footer: page size on the left, range and paging on the right -->
    <div
      v-if="!loading && displayed.length"
      class="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-muted"
    >
      <div class="flex items-center gap-2">
        <span>{{ labels.perPage }}</span>
        <USelect v-model="pageSize" :items="pageSizeItems" size="sm" class="w-24" />
      </div>
      <div class="flex items-center gap-3">
        <span>{{ labels.paginationRange({ from: rangeFrom, to: rangeTo, total }) }}</span>
        <UPagination
          v-if="totalPages > 1"
          v-model:page="page"
          :total="total"
          :items-per-page="pageSize === 'all' ? total : pageSize"
          :sibling-count="1"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
