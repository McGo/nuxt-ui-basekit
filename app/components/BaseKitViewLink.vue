<script setup lang="ts">
/**
 * Weg vom Bearbeiten-Formular zur Ansicht derselben Sache.
 *
 * Die Gegenrichtung gab es längst: In der Ansicht stehen die Kontext-Aktionen
 * („Bearbeiten", „Inhalt pflegen"). Der Rückweg fehlte — wer eine Rubrik
 * bearbeitet hatte, kam nur über den Umweg Übersicht → Frontend → Rubrik
 * dorthin, um das Ergebnis zu sehen.
 *
 * Steht neben dem Rücksprung im Seitenkopf, an derselben Stelle wie dort:
 * Erst die Ansicht, dann der Rücksprung zur Liste — die Reihenfolge folgt der
 * Häufigkeit, mit der man beides braucht.
 *
 * **Nur zeigen, wenn es die Ansicht gibt.** Ein neu angelegter Datensatz hat
 * noch keine, und ein Link ins Leere ist schlechter als kein Link. Deshalb
 * gehört das `v-if` an die Aufrufstelle, wo bekannt ist, ob gespeichert wurde.
 */
import { computed } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

const props = withDefaults(defineProps<{
  to: string
  /**
   * Öffnet die Ansicht in einem neuen Reiter. Voreingestellt, weil man beim
   * Bearbeiten meist nachsehen und weiterarbeiten will — nicht wechseln und
   * die ungespeicherten Änderungen verlieren.
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
