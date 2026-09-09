<script setup lang="ts">
/**
 * The way back from a detail page to its list.
 *
 * Always in the same place: top right of the page header. Before this, every
 * page solved it differently — sometimes a button above the heading, sometimes
 * a small link, sometimes a button on the right, labelled either with the name
 * of the list or with "Back". Anyone moving between two areas had to look for
 * the way back anew each time.
 *
 * The label is therefore fixed, and it names the direction rather than the
 * target. `label` overrides it for the cases where the way back leads to a
 * parent record instead of a list.
 */
import { computed } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

const props = withDefaults(defineProps<{
  to: string
  label?: string
}>(), {
  label: undefined,
})

const labels = useBaseKitLabels()

const text = computed(() => props.label ?? labels.value.back)
</script>

<template>
  <UButton
    :to="props.to"
    icon="i-lucide-arrow-left"
    size="sm"
    color="neutral"
    variant="ghost"
    class="shrink-0"
  >
    {{ text }}
  </UButton>
</template>
