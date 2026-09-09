<script setup lang="ts">
/**
 * Ladezustand für eine Seite oder einen Abschnitt.
 *
 * Die Admin-Seiten holen ihre Daten in `onMounted` nach. Ohne Zwischenschritt
 * steht das Formular sofort da — mit leeren Feldern, die sich einen Wimpernschlag
 * später von selbst füllen. Wer schnell tippt, schreibt in ein Feld, das gleich
 * überschrieben wird; wer langsam liest, hält den Datensatz für leer.
 *
 * Deshalb: erst ein Kreisel, dann der Inhalt. Der Kreisel sagt „gleich", das
 * leere Formular sagt „nichts da" — und das eine ist wahr, das andere nicht.
 *
 * Zwei Wege, beide gültig:
 *
 *   <BaseKitPending :pending="pending">
 *     <UForm …>   <!-- erscheint erst, wenn die Daten stehen -->
 *   </BaseKitPending>
 *
 *   <BaseKitPending v-if="pending" />
 *
 * `label` nur setzen, wo der Vorgang länger dauert und einen Namen hat („Suche
 * läuft"). Bei einem gewöhnlichen Formular ist der Kreisel allein ehrlicher als
 * ein Wort, das niemand liest.
 */
withDefaults(defineProps<{
  /** Solange wahr, steht der Kreisel statt des Inhalts. */
  pending?: boolean
  /** Optionale Beschriftung unter dem Kreisel. */
  label?: string
  /**
   * Höhe des Bereichs. `page` für eine ganze Seite, `inline` für einen
   * Abschnitt darin — sonst springt das Layout, wenn der Inhalt erscheint.
   */
  size?: 'page' | 'inline'
}>(), {
  pending: true,
  label: undefined,
  size: 'page',
})
</script>

<template>
  <div
    v-if="pending"
    class="flex flex-col items-center justify-center gap-3 text-muted"
    :class="size === 'page' ? 'min-h-64 py-12' : 'min-h-24 py-6'"
    role="status"
    aria-live="polite"
  >
    <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
    <span v-if="label" class="text-sm">{{ label }}</span>
  </div>
  <slot v-else />
</template>
