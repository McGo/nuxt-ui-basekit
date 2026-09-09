<script setup lang="ts">
/**
 * One setting inside a settings card.
 *
 *  ┌──────────────────────────────────────────────────────┐
 *  │ Title                                       [Control] │
 *  │ Description (optional, may wrap)                     │
 *  └──────────────────────────────────────────────────────┘
 *
 * Title and control share a line, title left and control right. The
 * description sits underneath, aligned with the title.
 *
 * Usage:
 *
 *   <BaseKitSettingRow title="Notifications" description="Receive email and push">
 *     <USwitch v-model="notifications" />
 *   </BaseKitSettingRow>
 *
 *   <BaseKitSettingRow title="Language" description="Applied on save">
 *     <USelect v-model="staged" :items="locales" />
 *   </BaseKitSettingRow>
 *
 * The `meta` slot takes an extra line below the description — a count, a
 * reason something is locked, a hint. Kept apart from `description` on
 * purpose: that field carries the one explaining sentence, and a number is not
 * an explanation.
 *
 *   <BaseKitSettingRow title="E-learning" description="Courses and certificates.">
 *     <USwitch v-model="on" />
 *     <template #meta><span>4 courses</span></template>
 *   </BaseKitSettingRow>
 *
 * Several rows in one card are separated with a Tailwind divider:
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
