<script setup lang="ts">
/**
 * Folds its content away to nothing, or back open.
 *
 * `height: auto` does not animate, and measuring the content in script to
 * animate a pixel height means a resize observer for a row in a list. A grid
 * row does it in CSS: `1fr` is as tall as the content, `0fr` is nothing, and
 * the step between the two is animated like any other length.
 *
 *   <li v-show="!check.isGone(item.id)">
 *     <BaseKitCollapse :open="!check.isLeaving(item.id)">…</BaseKitCollapse>
 *   </li>
 *
 * It only folds. Padding and borders of the element around it stay, so the
 * row's padding belongs inside, and the element around is hidden by the
 * caller once the fold is done.
 */
withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: true,
})
</script>

<template>
  <div class="basekit-collapse" :class="{ 'basekit-collapse--closed': !open }" :aria-hidden="!open" data-test="collapse">
    <div class="basekit-collapse__inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.basekit-collapse {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 320ms ease, opacity 250ms ease;
}
.basekit-collapse--closed {
  grid-template-rows: 0fr;
  opacity: 0;
}
.basekit-collapse__inner {
  min-height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .basekit-collapse {
    transition: none;
  }
}
</style>
