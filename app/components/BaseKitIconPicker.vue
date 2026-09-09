<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * A form control for `i-lucide-*` names — display plus picker, no free text.
 * The trigger shows the chosen icon, or a placeholder; a click opens a popover
 * with a search field and a grid of curated icons. `modelValue` is the icon
 * name, an empty string meaning no icon.
 *
 * Curated rather than the full Iconify set, on purpose: it keeps the bundle
 * small and needs no extra data source. When an icon is missing, the list
 * below grows by a line.
 */
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const labels = useBaseKitLabels()

const open = ref(false)
const search = ref('')

// Curated Lucide icons, the ones that come up in navigation and content.
const ICONS: string[] = [
  'i-lucide-home', 'i-lucide-layout-dashboard', 'i-lucide-layout-grid', 'i-lucide-list',
  'i-lucide-file-text', 'i-lucide-file', 'i-lucide-files', 'i-lucide-folder',
  'i-lucide-folder-open', 'i-lucide-newspaper', 'i-lucide-book-open', 'i-lucide-book',
  'i-lucide-graduation-cap', 'i-lucide-library', 'i-lucide-calendar', 'i-lucide-calendar-days',
  'i-lucide-clock', 'i-lucide-image', 'i-lucide-images', 'i-lucide-video',
  'i-lucide-film', 'i-lucide-music', 'i-lucide-play', 'i-lucide-camera',
  'i-lucide-mic', 'i-lucide-headphones', 'i-lucide-users', 'i-lucide-user',
  'i-lucide-user-round', 'i-lucide-contact', 'i-lucide-mail', 'i-lucide-phone',
  'i-lucide-map-pin', 'i-lucide-map', 'i-lucide-compass', 'i-lucide-globe',
  'i-lucide-info', 'i-lucide-help-circle', 'i-lucide-circle-help', 'i-lucide-settings',
  'i-lucide-cog', 'i-lucide-wrench', 'i-lucide-hammer', 'i-lucide-plug',
  'i-lucide-shield', 'i-lucide-lock', 'i-lucide-key', 'i-lucide-star',
  'i-lucide-heart', 'i-lucide-bookmark', 'i-lucide-tag', 'i-lucide-tags',
  'i-lucide-flag', 'i-lucide-award', 'i-lucide-trophy', 'i-lucide-target',
  'i-lucide-lightbulb', 'i-lucide-sparkles', 'i-lucide-shopping-cart', 'i-lucide-shopping-bag',
  'i-lucide-package', 'i-lucide-gift', 'i-lucide-store', 'i-lucide-briefcase',
  'i-lucide-building', 'i-lucide-building-2', 'i-lucide-factory', 'i-lucide-warehouse',
  'i-lucide-message-square', 'i-lucide-messages-square', 'i-lucide-message-circle', 'i-lucide-bell',
  'i-lucide-megaphone', 'i-lucide-search', 'i-lucide-link', 'i-lucide-external-link',
  'i-lucide-download', 'i-lucide-upload', 'i-lucide-share-2', 'i-lucide-table',
  'i-lucide-columns-3', 'i-lucide-rows-3', 'i-lucide-kanban', 'i-lucide-chart-bar',
  'i-lucide-chart-line', 'i-lucide-chart-pie', 'i-lucide-trending-up', 'i-lucide-activity',
  'i-lucide-euro', 'i-lucide-credit-card', 'i-lucide-receipt', 'i-lucide-percent',
  'i-lucide-wallet', 'i-lucide-banknote', 'i-lucide-leaf', 'i-lucide-tree-pine',
  'i-lucide-sun', 'i-lucide-moon', 'i-lucide-cloud', 'i-lucide-droplet',
  'i-lucide-flame', 'i-lucide-zap', 'i-lucide-wifi', 'i-lucide-rss',
  'i-lucide-clipboard', 'i-lucide-clipboard-list', 'i-lucide-check', 'i-lucide-check-circle',
  'i-lucide-circle-check', 'i-lucide-bookmark-check', 'i-lucide-heart-handshake', 'i-lucide-handshake',
  'i-lucide-hand-helping', 'i-lucide-baby', 'i-lucide-dumbbell', 'i-lucide-bike',
  'i-lucide-car', 'i-lucide-bus', 'i-lucide-plane', 'i-lucide-ship',
  'i-lucide-utensils', 'i-lucide-coffee', 'i-lucide-cake', 'i-lucide-pizza',
]

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return ICONS
  return ICONS.filter(name => name.includes(q))
})

function pick(name: string): void {
  emit('update:modelValue', name)
  open.value = false
}

function clear(): void {
  emit('update:modelValue', '')
  open.value = false
}
</script>

<template>
  <UPopover v-model:open="open">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md border border-default px-3 py-2 text-left transition-colors hover:bg-elevated"
    >
      <span class="flex size-6 shrink-0 items-center justify-center">
        <UIcon v-if="props.modelValue" :name="props.modelValue" class="size-5" />
        <UIcon v-else name="i-lucide-image" class="size-5 text-dimmed" />
      </span>
      <span class="flex-1 truncate text-sm" :class="{ 'text-muted': !props.modelValue }">
        {{ props.modelValue || labels.iconChoose }}
      </span>
      <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-dimmed" />
    </button>

    <template #content>
      <div class="w-72 space-y-2 p-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          size="sm"
          autofocus
          :placeholder="labels.search"
        />
        <div class="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto">
          <button
            v-for="name in filtered"
            :key="name"
            type="button"
            class="flex aspect-square items-center justify-center rounded hover:bg-elevated"
            :class="{ 'bg-primary/10 ring-1 ring-primary': name === props.modelValue }"
            :title="name"
            @click="pick(name)"
          >
            <UIcon :name="name" class="size-5" />
          </button>
        </div>
        <p v-if="filtered.length === 0" class="text-xs text-muted">
          {{ labels.iconEmpty }}
        </p>
        <div v-if="props.modelValue" class="border-t border-default pt-2">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clear"
          >
            {{ labels.iconClear }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
