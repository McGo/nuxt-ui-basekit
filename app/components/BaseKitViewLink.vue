<script setup lang="ts">
/**
 * The way from an edit form to the public view of the same thing.
 *
 * The opposite direction had existed for a long time: the view carries the
 * context actions ("Edit", "Manage content"). The way back was missing —
 * having edited a record, the only route to seeing the result was the detour
 * through the overview and the front end.
 *
 * Sits next to the back link in the page header, in the same spot: first the
 * view, then the way back to the list. The order follows how often each is
 * needed.
 *
 * **Only render it when the view exists.** A freshly created record has none,
 * and a link into nowhere is worse than no link. That is why the `v-if`
 * belongs at the call site, where it is known whether anything was saved.
 */
import { computed } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

const props = withDefaults(defineProps<{
  to: string
  /**
   * Opens the view in a new tab. On by default, because while editing you
   * usually want to look and carry on — not switch away and lose the unsaved
   * changes.
   */
  newTab?: boolean
  label?: string
}>(), {
  newTab: true,
  label: undefined,
})

const labels = useBaseKitLabels()

const text = computed(() => props.label ?? labels.value.view)
</script>

<template>
  <UButton
    :to="props.to"
    :target="props.newTab ? '_blank' : undefined"
    :rel="props.newTab ? 'noopener' : undefined"
    icon="i-lucide-external-link"
    size="sm"
    color="neutral"
    variant="ghost"
    class="shrink-0"
  >
    {{ text }}
  </UButton>
</template>
