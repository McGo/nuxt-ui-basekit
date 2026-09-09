<script setup lang="ts">
/**
 * Setting-Row — Pattern für eine einzelne Einstellung in einer Settings-Card.
 *
 *  ┌──────────────────────────────────────────────────────┐
 *  │ Titel                                       [Action] │
 *  │ Beschreibungstext (optional, mehrzeilig)             │
 *  └──────────────────────────────────────────────────────┘
 *
 * Titel + Action stehen auf einer Zeile (Action rechts, Titel links).
 * Die Beschreibung steht darunter, linksbündig zum Titel.
 *
 * Verwendung:
 *
 *   <BaseKitSettingRow title="Benachrichtigungen" description="E-Mails und Push erhalten">
 *     <USwitch v-model="notifications" />
 *   </BaseKitSettingRow>
 *
 *   <BaseKitSettingRow title="Sprache" description="Wird beim Speichern übernommen">
 *     <USelect v-model="staged" :items="locales" />
 *   </BaseKitSettingRow>
 *
 * Der `meta`-Slot nimmt eine Zusatzzeile unter der Beschreibung auf — Bestand,
 * Sperrgrund, Hinweis. Sie steht bewusst getrennt von `description`: das Feld
 * trägt den einen erklärenden Satz, und eine Zahl ist keine Erklärung.
 *
 *   <BaseKitSettingRow title="E-Learning" description="Kurse und Nachweise.">
 *     <USwitch v-model="on" />
 *     <template #meta><span>4 Kurse</span></template>
 *   </BaseKitSettingRow>
 *
 * Mehrere Rows in einer Card werden über Tailwind divider getrennt:
 *
 *   <UCard>
 *     <div class="divide-y divide-default">
 *       <BaseKitSettingRow ... />
 *       <BaseKitSettingRow ... />
 *     </div>
 *   </UCard>
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="py-3 first:pt-0 last:pb-0">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-1 text-xs text-muted">
          {{ description }}
        </p>
        <div v-if="$slots.meta" class="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          <slot name="meta" />
        </div>
      </div>
      <div class="shrink-0">
        <slot />
      </div>
    </div>
  </div>
</template>
