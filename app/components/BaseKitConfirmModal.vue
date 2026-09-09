<script setup lang="ts">
/**
 * Global gemountetes Bestätigungs-Modal — wird vom `basekit:confirm`-Store
 * gesteuert (siehe `useConfirm()`). Genau eine Instanz pro Layout genügt,
 * sie beantwortet alle Abfragen.
 *
 * Ersetzt native `window.confirm`-Dialoge: gethemt, dark-mode-fähig,
 * destruktive Aktionen als roter Bestätigen-Button. Schließen ohne Klick
 * (Escape/Backdrop) zählt als Abbruch.
 */
import { computed } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'
import { useConfirmStore } from '../stores/confirm'

const store = useConfirmStore()
const labels = useBaseKitLabels()

const opts = computed(() => store.options)

const open = computed({
  get: () => store.open,
  set: (value: boolean) => {
    // Backdrop-/Escape-Schließen ohne Bestätigung → Abbruch.
    if (!value) store.settle(false)
  },
})
</script>

<template>
  <UModal
    :open="open"
    :title="opts.title ?? labels.confirmTitle"
    :ui="{ content: 'max-w-md' }"
    @update:open="open = $event"
  >
    <template #body>
      <p class="text-sm text-muted">
        {{ opts.description ?? labels.confirmBody }}
      </p>
      <div class="mt-6 flex justify-end gap-2">
        <UButton type="button" color="neutral" variant="ghost" @click="store.settle(false)">
          {{ opts.cancelLabel ?? labels.cancel }}
        </UButton>
        <UButton
          type="button"
          :color="opts.color ?? 'primary'"
          :icon="opts.icon"
          @click="store.settle(true)"
        >
          {{ opts.confirmLabel ?? labels.confirm }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
