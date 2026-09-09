<script setup lang="ts">
/**
 * Auswahl-Karte — Pattern für „aus einer Handvoll Varianten eine wählen“,
 * wenn die Varianten sich zeigen lassen (Themes, Layouts, Vorlagen).
 * Ein Dropdown zeigt nur Namen; hier steht die Vorschau daneben.
 *
 *  ┌──────────────────────────┐
 *  │                          │  ← Slot `preview` (stilisierte Vorschau)
 *  │        Vorschau          │
 *  ├──────────────────────────┤
 *  │ Titel          [ Aktiv ] │  ← aktiv: Badge, sonst Knopf „Übernehmen“
 *  │ Beschreibung             │
 *  └──────────────────────────┘
 *
 * Verwendung (Karten in einem Grid, eine pro Variante):
 *
 *   <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
 *     <BaseKitChoiceCard
 *       v-for="o in options"
 *       :key="o.id"
 *       :title="o.label"
 *       :active="o.id === activeId"
 *       :active-label="t('common.active')"
 *       :apply-label="t('common.apply')"
 *       :pending="pending"
 *       @apply="apply(o.id)"
 *     >
 *       <template #preview><MeineVorschau :id="o.id" /></template>
 *     </BaseKitChoiceCard>
 *   </div>
 *
 * Die Karte selbst löst nichts aus — gewählt wird über den Knopf. Bei einer
 * Auswahl, die sofort für alle gilt, ist ein Klick daneben sonst schnell
 * passiert.
 */
withDefaults(defineProps<{
  /** Name der Variante. */
  title: string
  /** Kurze Erläuterung unter dem Titel. */
  description?: string
  /** Diese Variante ist die aktive. */
  active?: boolean
  /** Läuft gerade ein Speichervorgang (sperrt den Knopf). */
  pending?: boolean
  /** Beschriftung des Knopfes für „diese Variante übernehmen“. */
  applyLabel?: string
  /** Beschriftung des Aktiv-Kennzeichens. */
  activeLabel?: string
  /** Seitenverhältnis der Vorschaufläche. */
  ratio?: string
}>(), {
  description: undefined,
  active: false,
  pending: false,
  applyLabel: 'Übernehmen',
  activeLabel: 'Aktiv',
  ratio: 'aspect-[16/10]',
})

defineEmits<{ apply: [] }>()
</script>

<template>
  <div
    class="basekit-choice-card overflow-hidden rounded-lg border bg-white transition-colors dark:bg-neutral-900"
    :class="active
      ? 'border-primary-500 ring-1 ring-primary-500'
      : 'border-neutral-200 dark:border-neutral-800'"
    :aria-current="active ? 'true' : undefined"
  >
    <div :class="['overflow-hidden border-b border-neutral-200 dark:border-neutral-800', ratio]">
      <slot name="preview" />
    </div>

    <div class="flex items-start justify-between gap-3 p-3">
      <div class="min-w-0">
        <h3 class="truncate text-sm font-medium">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-0.5 text-xs text-neutral-500">
          {{ description }}
        </p>
      </div>

      <UBadge
        v-if="active"
        color="primary"
        variant="subtle"
        icon="i-lucide-check"
        class="shrink-0"
      >
        {{ activeLabel }}
      </UBadge>
      <UButton
        v-else
        size="xs"
        color="neutral"
        variant="subtle"
        class="shrink-0"
        :loading="pending"
        @click="$emit('apply')"
      >
        {{ applyLabel }}
      </UButton>
    </div>
  </div>
</template>
