<script setup lang="ts">
/**
 * Rücksprung von einer Detailseite zur zugehörigen Liste.
 *
 * Steht immer an derselben Stelle: oben rechts im Seitenkopf. Vorher hatte
 * das jede Seite anders gelöst — mal ein Knopf über der Überschrift, mal ein
 * kleiner Link darüber, mal ein Knopf rechts im Kopf, und beschriftet war er
 * mal mit dem Namen der Liste („Rubriken"), mal mit „Zurück". Wer zwischen
 * zwei Bereichen wechselt, sucht den Weg zurück dann jedes Mal neu.
 *
 * Die Beschriftung ist deshalb fest und nennt nicht das Ziel, sondern die
 * Richtung. `label` überschreibt sie für die Fälle, in denen es nicht zu
 * einer Liste zurückgeht, sondern zum übergeordneten Datensatz.
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
