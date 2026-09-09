<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * Auswahl eines Datensatzes über (potenziell mehrere) Modelle — die Auswahl
 * läuft in einem Modal, das per „Auswählen" / „Ändern" aufgeht. Im Modal ist
 * die Liste nach Text UND Typ filterbar.
 *
 * - **Nichts gewählt** → Button „Auswählen".
 * - **Gewählt** → Titel der Auswahl (Link zum Bearbeiten des Inhalts) + Typ-
 *   Badge + Button „Ändern".
 *
 * Modell-agnostisch — die `items` liefert der Aufrufer. `v-model` = `value`
 * der Option (oder `null`).
 */
export interface BaseKitRecordOption {
  value: number
  label: string
  /** Typ-Badge (bereits übersetzt). */
  type?: string
  /** Zusatz rechts in der Liste (z. B. Slug). */
  hint?: string
  /** Interner Link zum Bearbeiten des Inhalts. */
  editHref?: string
}

const props = withDefaults(defineProps<{
  modelValue?: number | null
  items: BaseKitRecordOption[]
  /** Titel des Auswahl-Modals. */
  title?: string
}>(), {
  modelValue: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const labels = useBaseKitLabels()

const open = ref(false)
const search = ref('')
const typeFilter = ref('')

const selected = computed(() => props.items.find(item => item.value === props.modelValue) ?? null)

const types = computed(() => [...new Set(props.items.map(item => item.type).filter((x): x is string => !!x))])
const showTypeFilter = computed(() => types.value.length > 1)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.items.filter((item) => {
    if (typeFilter.value && item.type !== typeFilter.value) return false
    if (!q) return true
    return item.label.toLowerCase().includes(q) || (item.hint?.toLowerCase().includes(q) ?? false)
  })
})

function openModal(): void {
  search.value = ''
  typeFilter.value = ''
  open.value = true
}

function choose(item: BaseKitRecordOption): void {
  emit('update:modelValue', item.value)
  open.value = false
}
</script>

<template>
  <div>
    <!-- Gewählt: Titel (Bearbeiten-Link) + Typ-Badge + Ändern -->
    <div v-if="selected" class="flex items-center gap-2">
      <NuxtLink
        v-if="selected.editHref"
        :to="selected.editHref"
        class="truncate font-medium text-primary-700 hover:underline dark:text-primary-300"
        :title="labels.edit"
      >
        {{ selected.label }}
      </NuxtLink>
      <span v-else class="truncate font-medium">{{ selected.label }}</span>

      <UBadge v-if="selected.type" color="neutral" variant="soft" size="xs">
        {{ selected.type }}
      </UBadge>

      <UButton class="ml-auto" size="xs" color="neutral" variant="subtle" @click="openModal">
        {{ labels.change }}
      </UButton>
    </div>

    <!-- Nichts gewählt: Auswählen -->
    <UButton v-else color="neutral" variant="subtle" icon="i-lucide-list" @click="openModal">
      {{ labels.select }}
    </UButton>

    <UModal v-model:open="open" :title="title ?? labels.select">
      <template #body>
        <div class="space-y-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="labels.search"
            autofocus
            class="w-full"
          />

          <div v-if="showTypeFilter" class="flex flex-wrap gap-1">
            <UButton
              size="xs"
              color="neutral"
              :variant="typeFilter === '' ? 'solid' : 'soft'"
              @click="typeFilter = ''"
            >
              {{ labels.all }}
            </UButton>
            <UButton
              v-for="ty in types"
              :key="ty"
              size="xs"
              color="neutral"
              :variant="typeFilter === ty ? 'solid' : 'soft'"
              @click="typeFilter = ty"
            >
              {{ ty }}
            </UButton>
          </div>

          <ul class="max-h-80 divide-y divide-neutral-100 overflow-auto dark:divide-neutral-800">
            <li v-for="item in filtered" :key="item.value">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
                :class="item.value === modelValue ? 'text-primary-700 dark:text-primary-300' : ''"
                @click="choose(item)"
              >
                <span class="truncate">{{ item.label }}</span>
                <UBadge v-if="item.type" color="neutral" variant="soft" size="xs">{{ item.type }}</UBadge>
                <span v-if="item.hint" class="ml-auto truncate text-xs font-mono text-dimmed">{{ item.hint }}</span>
              </button>
            </li>
            <li v-if="!filtered.length" class="px-2 py-6 text-center text-sm text-muted">
              {{ labels.noResults }}
            </li>
          </ul>
        </div>
      </template>
    </UModal>
  </div>
</template>
