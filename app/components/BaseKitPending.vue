<script setup lang="ts">
/**
 * A loading state for a page or a section of one.
 *
 * Pages that fetch in `onMounted` show their form immediately otherwise — with
 * empty fields that fill themselves a blink later. Whoever types fast writes
 * into a field that is about to be overwritten; whoever reads slowly takes the
 * record for empty.
 *
 * Hence: spinner first, content after. The spinner says "in a moment", the
 * empty form says "nothing here" — and only one of those is true.
 *
 * Two ways, both valid:
 *
 *   <BaseKitPending :pending="pending">
 *     <UForm …>   <!-- appears once the data is in -->
 *   </BaseKitPending>
 *
 *   <BaseKitPending v-if="pending" />
 *
 * Set `label` only where the operation takes a while and has a name ("Searching").
 * On an ordinary form the bare spinner is more honest than a word nobody reads.
 */
withDefaults(defineProps<{
  /** While true, the spinner stands in for the content. */
  pending?: boolean
  /** Optional label below the spinner. */
  label?: string
  /**
   * Height of the area. `page` for a whole page, `inline` for a section within
   * one — otherwise the layout jumps when the content arrives.
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
