<script setup lang="ts">
/**
 * A named group of fields inside a form.
 *
 *  ┌──────────────────────────────────────────────────────┐
 *  │ Title                                                │
 *  │ Description (optional, may wrap)                     │
 *  │                                                      │
 *  │ [ fields ]                                           │
 *  └──────────────────────────────────────────────────────┘
 *
 * The point is the type ladder. A form has four levels, and they have to be
 * four sizes, or the reader cannot tell what contains what:
 *
 *   section title        text-base  font-semibold
 *   section description  text-sm    muted
 *   field label          text-sm    font-medium   (UFormField)
 *   field help           text-xs    muted         (UFormField)
 *
 * Hand-rolling the heading as `text-sm font-medium` puts it at field-label
 * weight. It then reads as a sibling of the fields it contains, and a question
 * like "Who may start topics?" sits at the same level as "Users" — one inside
 * the other, both shouting equally loud.
 *
 * Usage:
 *
 *   <BaseKitFormSection title="Who may start topics?" description="Empty means everyone who can see it.">
 *     <UFormField label="Users"><USelectMenu … /></UFormField>
 *     <UFormField label="Roles"><USelectMenu … /></UFormField>
 *   </BaseKitFormSection>
 *
 * The `description` slot takes markup where the plain prop is not enough — a
 * link, an inline hint. Prop and slot are exclusive; the slot wins.
 *
 * Not a card and not a box. A form section is a heading with fields under it;
 * framing every group turns a page of settings into a page of boxes.
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section>
    <h3 class="text-base font-semibold">
      {{ title }}
    </h3>

    <p v-if="$slots.description || description" class="mt-1 text-sm text-muted">
      <slot name="description">{{ description }}</slot>
    </p>

    <div class="mt-4 space-y-4">
      <slot />
    </div>
  </section>
</template>
