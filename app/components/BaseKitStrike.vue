<script setup lang="ts">
/**
 * Text that gets struck through by a line drawn from the left.
 *
 * `text-decoration: line-through` cannot be animated: it is there or it is
 * not. Here the line is a background image on an inline element, and its
 * width is what moves. On a title that wraps, the background runs through
 * the line boxes one after another, so a two-line title is struck line by
 * line, the way a pen would do it.
 *
 * Rendered struck from the start, it simply is struck — the line only moves
 * when `active` changes. That makes it the replacement for `line-through` in
 * both places: the row that is being ticked off and the one that was ticked
 * off yesterday.
 *
 *   <BaseKitStrike :active="check.isStruck(item.id) || !!item.bought_at">{{ item.title }}</BaseKitStrike>
 *
 * The line takes the text colour. Muting the text is up to the caller.
 */
withDefaults(defineProps<{
  active?: boolean
}>(), {
  active: false,
})
</script>

<template>
  <span class="basekit-strike" :class="{ 'basekit-strike--on': active }" data-test="strike" :data-active="active">
    <slot />
  </span>
</template>

<style scoped>
.basekit-strike {
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: 0 58%;
  background-size: 0% 1.5px;
  transition: background-size 450ms ease-in-out;
}
.basekit-strike--on {
  background-size: 100% 1.5px;
}

@media (prefers-reduced-motion: reduce) {
  .basekit-strike {
    transition: none;
  }
}
</style>
