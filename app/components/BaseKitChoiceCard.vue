<script setup lang="ts">
/**
 * Pick one of a handful of variants, for the case where the variants can be
 * shown — themes, layouts, templates. A dropdown gives you names only; here
 * the preview sits right next to the label.
 *
 *  ┌──────────────────────────┐
 *  │                          │  ← `preview` slot (a stylised rendering)
 *  │        Preview           │
 *  ├──────────────────────────┤
 *  │ Title         [ Active ] │  ← active: a badge, otherwise an Apply button
 *  │ Description              │
 *  └──────────────────────────┘
 *
 * Usage — cards in a grid, one per variant:
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
 *       <template #preview><MyPreview :id="o.id" /></template>
 *     </BaseKitChoiceCard>
 *   </div>
 *
 * The card itself triggers nothing — the button does the choosing. Where a
 * choice takes effect for everyone at once, a stray click is otherwise made
 * quickly.
 */
withDefaults(defineProps<{
  /** Name of the variant. */
  title: string
  /** A short explanation below the title. */
  description?: string
  /** This variant is the active one. */
  active?: boolean
  /** A save is in flight — disables the button. */
  pending?: boolean
  /** Label of the button that applies this variant. */
  applyLabel?: string
  /** Label of the active badge. */
  activeLabel?: string
  /** Aspect ratio of the preview area. */
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
