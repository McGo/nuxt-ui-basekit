<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * The bar that keeps a page's action in sight while the page scrolls.
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ Title          [start]      [actions]  feedback  [ Save ]    │  ← stays
 *  ├──────────────────────────────────────────────────────────────┤
 *  │ field                                                        │
 *  │ field                          scrolls                       │
 *  │ …                                                            │
 *  └──────────────────────────────────────────────────────────────┘
 *
 * Every page has one thing it is mainly for: an editor saves, a list creates,
 * a report exports. That action belongs where it stays reachable. Put it at
 * the end of a twenty-field form and nobody finds it; worse, the answer to it
 * — the error, the confirmation — then sits at the far end of the page as
 * well, so whoever clicks learns nothing about what happened.
 *
 * Hence one bar for both kinds of page. Not two: a list and an editor that
 * arrange their heading, their links and their button differently are two
 * layouts a reader has to learn, for no gain.
 *
 * `position: sticky` rather than a full-height flex column: the bar has to
 * work inside pages somebody else wrote, and rebuilding each of them into a
 * 100vh layout is a change to all of them. Sticky attaches to whatever
 * scrolls — the viewport in a plain document, the panel body in a dashboard
 * shell — and asks nothing of the page but a place to stand.
 *
 * Usage — an editor:
 *
 *   <BaseKitPageBar :title="role.name" :pending="saving" :error="error" @action="save">
 *     <template #actions><BaseKitBackLink to="/admin/roles" /></template>
 *   </BaseKitPageBar>
 *
 * …and a list, which needs nothing but its own label and icon:
 *
 *   <BaseKitPageBar title="Sections" :action-label="t('spaces.add')" action-icon="i-lucide-plus" @action="create" />
 *
 * The order is fixed on purpose, and that is what the slots are for: title,
 * what belongs to the title, the secondary links, the answer, the action.
 *
 * `action` as a slot for the page whose corner holds something else entirely —
 * a form split into tabs that each store on their own, or two buttons side by
 * side. Passing it drops the default button and the caller owns the corner.
 *
 * **No listener, no button.** A page that only lists things has no single
 * action, and it should not have to say so: the button appears when someone
 * passes `@action` or fills the slot, and otherwise the corner stays empty.
 * It was the other way round at first, and that was a trap — two thirds of the
 * callers had to write `<template #action />` to get rid of a "Save" they never
 * asked for, and whoever forgot got a button that looked real and did nothing.
 */
const props = withDefaults(defineProps<{
  /** Shown on the left. The `title` slot takes markup the prop cannot. */
  title?: string
  /** The action's label. Defaults to "Save" from `useBaseKit()`. */
  actionLabel?: string
  actionIcon?: string
  /** Spins the button and blocks a second click. */
  pending?: boolean
  /** Greys the button out — nothing to do yet, or no permission to. */
  disabled?: boolean
  /** What went wrong, already translated. Wins over `feedback`. */
  error?: string | null
  /** Confirmation, already translated — shown until the caller clears it. */
  feedback?: string | null
}>(), {
  title: '',
  actionLabel: '',
  actionIcon: 'i-lucide-check',
  pending: false,
  disabled: false,
  error: null,
  feedback: null,
})

/**
 * Is anybody listening? `@action` lands in `attrs` as `onAction`, and that is
 * the honest signal: it is exactly what the caller wrote, so it cannot drift
 * from a second `showAction` prop saying the same thing.
 *
 * **Hence no `defineEmits` for it.** Vue strips listeners of declared emits
 * out of `attrs`, which would make the check always false — and the button
 * would vanish everywhere, including the editors that need it. Declaring the
 * emit and asking whether anyone listens are mutually exclusive; the question
 * is worth more here than the typed emit.
 */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs() as { onAction?: () => void }
const hasAction = computed(() => typeof attrs.onAction === 'function')

const labels = useBaseKitLabels()
const label = computed(() => props.actionLabel || labels.value.save)

/** Error beats confirmation: a stale "saved" next to a red line reads as both. */
const message = computed(() => props.error ?? props.feedback)
</script>

<template>
  <div v-bind="{ ...$attrs, onAction: undefined }" class="basekit-page-bar" data-test="page-bar">
    <div class="min-w-0 flex-1">
      <h1 v-if="$slots.title || title" class="truncate text-xl font-semibold">
        <slot name="title">{{ title }}</slot>
      </h1>
    </div>

    <slot name="start" />

    <div class="flex items-center gap-2">
      <slot name="actions" />

      <p
        v-if="message"
        class="max-w-64 truncate text-sm"
        :class="error ? 'text-error' : 'text-muted'"
        data-test="page-bar-message"
        :data-kind="error ? 'error' : 'feedback'"
      >
        {{ message }}
      </p>

      <slot name="action">
        <UButton
          v-if="hasAction"
          :icon="actionIcon"
          :loading="pending"
          :disabled="disabled"
          data-test="page-bar-action"
          @click="attrs.onAction?.()"
        >
          {{ label }}
        </UButton>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/*
 * `sticky` needs a stacking context above what scrolls past it, and a
 * background: without one the fields show through the bar. The negative
 * margins pull it out to the edges of a padded page so the line underneath
 * reaches across; the padding puts the content back where it belongs.
 *
 * The bottom margin is the bar's own, not the page's. Left to a parent's
 * `space-y`, the first line underneath ends up against the rule — and it is
 * the same first line on every page that uses this, so the gap belongs here
 * once rather than on each of them.
 */
.basekit-page-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: -1.5rem -1rem 1.5rem;
  padding: 1rem;
  background: var(--ui-bg);
  border-bottom: 1px solid var(--ui-border);
}

@media (min-width: 640px) {
  .basekit-page-bar {
    margin-left: -1.5rem;
    margin-right: -1.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
