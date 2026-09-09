<script setup lang="ts">
/**
 * One empty state for all of them: icon, an action-shaped heading, optional
 * explanation, optional primary action in the default slot.
 *
 * `variant` separates the two cases that look alike and mean different things:
 * - `empty`  — nothing has been created yet; leads to the first step.
 * - `search` — the query ran and found nothing; confirms it, offers a fix.
 *
 * The icon follows the variant and can be overridden through `icon`. The
 * action (a `UButton`, say) goes into the default slot.
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
