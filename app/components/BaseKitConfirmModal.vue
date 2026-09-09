<script setup lang="ts">
/**
 * The globally mounted confirmation modal, driven by the `basekit:confirm`
 * store — see `useConfirm()`. Exactly one instance per layout is enough; it
 * answers every prompt.
 *
 * Replaces native `window.confirm` dialogs: themed, dark-mode-capable, with a
 * red confirm button for destructive actions. Closing without a click, by
 * Escape or backdrop, counts as cancel.
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
    // Closing by backdrop or Escape without confirming means cancel.
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
