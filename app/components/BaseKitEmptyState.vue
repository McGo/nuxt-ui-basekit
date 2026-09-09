<script setup lang="ts">
/**
 * BaseKitEmptyState — einheitlicher Leerzustand: Icon + handlungsorientierte
 * Überschrift + optionaler Erklärtext + optionale Primäraktion (Default-Slot).
 *
 * `variant` trennt die beiden Fälle aus docs/18:
 * - `empty`  → „noch nichts angelegt" (führt zum ersten Schritt)
 * - `search` → „kein Suchergebnis" (bestätigt die Suche, bietet Korrektur)
 *
 * Das passende Icon wird je Variante gewählt, kann per `icon` überschrieben
 * werden. Aktion (z. B. ein `UButton`) kommt in den Default-Slot.
 */
withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
  variant?: 'empty' | 'search'
}>(), {
  variant: 'empty',
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-12 text-center">
    <UIcon
      :name="icon ?? (variant === 'search' ? 'i-lucide-search-x' : 'i-lucide-inbox')"
      class="size-10 text-dimmed"
    />
    <div>
      <p class="font-medium text-highlighted">
        {{ title }}
      </p>
      <p v-if="description" class="mx-auto mt-1 max-w-sm text-sm text-muted">
        {{ description }}
      </p>
    </div>
    <slot />
  </div>
</template>
