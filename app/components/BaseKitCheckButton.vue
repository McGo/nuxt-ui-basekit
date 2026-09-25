<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * The round tick at the front of a list row — for a shopping list, a task
 * list, anything that gets ticked off while the other hand holds something.
 *
 * Two things set it apart from a checkbox. The target is 44 px square while
 * the circle inside stays at 28: a thumb in a supermarket aisle is not a
 * mouse pointer. And when it turns checked, the circle gives once and a ring
 * runs off it, so the tap reads as landed before anything else happens.
 * That plays on every change to checked, including one that arrives from
 * somebody else over a socket — never on the first render.
 *
 * It holds no state of its own. Pair it with `useDelayedCheck()` for the
 * delay and the undo, or bind `checked` straight to the record.
 *
 *   <BaseKitCheckButton :checked="!!task.done_at" @toggle="toggleDone(task)" />
 *
 * The fill is `--basekit-check`, which defaults to the Nuxt UI `success`
 * colour. An application that means a different green sets it once in its
 * stylesheet.
 */
const props = withDefaults(defineProps<{
  checked?: boolean
  /** Accessible name while unchecked. Defaults to `labels.check`. */
  label?: string
  /** Accessible name while checked. Defaults to `labels.uncheck`. */
  checkedLabel?: string
  disabled?: boolean
}>(), {
  checked: false,
  label: '',
  checkedLabel: '',
  disabled: false,
})

const emit = defineEmits<{ toggle: [] }>()

const labels = useBaseKitLabels()
const name = computed(() => props.checked
  ? props.checkedLabel || labels.value.uncheck
  : props.label || labels.value.check)

/**
 * Bumped on every turn to checked. As a `key` it remounts the ring, which
 * restarts its animation — a class that stays on would play only once.
 */
const plays = ref(0)
watch(() => props.checked, (now, before) => {
  if (now && !before) plays.value++
})
</script>

<template>
  <button
    type="button"
    class="basekit-check group"
    :class="{ 'basekit-check--on': checked }"
    :aria-label="name"
    :aria-pressed="checked"
    :title="name"
    :disabled="disabled"
    data-test="check-button"
    @click="emit('toggle')"
  >
    <span v-if="plays" :key="plays" class="basekit-check__ring" aria-hidden="true" data-test="check-ring" />
    <span :key="`c${plays}`" class="basekit-check__circle" :class="{ 'basekit-check__circle--pop': plays }">
      <UIcon name="i-lucide-check" class="size-4" />
    </span>
  </button>
</template>

<style scoped>
.basekit-check {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  -webkit-tap-highlight-color: transparent;
}
.basekit-check:disabled {
  opacity: 0.5;
}

.basekit-check__circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  color: transparent;
  box-shadow: inset 0 0 0 2px var(--basekit-border-strong);
  transition: transform 150ms ease, color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}
.basekit-check:not(:disabled):hover .basekit-check__circle {
  color: var(--basekit-check);
  box-shadow: inset 0 0 0 2px var(--basekit-check);
}
.basekit-check:not(:disabled):active .basekit-check__circle {
  transform: scale(0.9);
}
.basekit-check--on .basekit-check__circle,
.basekit-check--on:not(:disabled):hover .basekit-check__circle {
  background: var(--basekit-check);
  color: var(--basekit-check-text);
  box-shadow: none;
}

/* The circle gives once, so the tap is felt as well as seen. */
.basekit-check__circle--pop {
  animation: basekit-check-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes basekit-check-pop {
  0% { transform: scale(0.7); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* A ring runs off the circle and fades. */
.basekit-check__ring {
  position: absolute;
  inset: calc(50% - 0.875rem);
  border: 2px solid var(--basekit-check);
  border-radius: 9999px;
  opacity: 0;
  pointer-events: none;
  animation: basekit-check-ring 550ms ease-out;
}
@keyframes basekit-check-ring {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(2); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .basekit-check__circle--pop,
  .basekit-check__ring {
    animation: none;
  }
}
</style>
