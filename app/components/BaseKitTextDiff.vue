<script setup lang="ts">
import { computed } from 'vue'
import { wordDiff } from '../utils/word-diff'

/**
 * Shows how a text changed, word by word, in one flow: removed words struck
 * through, added words marked. Line breaks stay.
 *
 * Meant for reading, not for merging — which version wins is decided
 * elsewhere. The markup is `<del>` and `<ins>`, so assistive technology
 * announces the changes without a legend.
 *
 *   <BaseKitTextDiff :before="old.title" :after="current.title" />
 *
 * Two empty texts render nothing; so does an unchanged one, apart from the
 * text itself.
 */
const props = defineProps<{
  before: string
  after: string
}>()

const parts = computed(() => wordDiff(props.before ?? '', props.after ?? ''))
</script>

<template>
  <p class="basekit-text-diff" data-test="text-diff">
    <template v-for="(part, index) in parts" :key="index">
      <del v-if="part.type === 'removed'" class="basekit-text-diff__removed">{{ part.text }}</del>
      <ins v-else-if="part.type === 'added'" class="basekit-text-diff__added">{{ part.text }}</ins>
      <span v-else>{{ part.text }}</span>
    </template>
  </p>
</template>

<style scoped>
.basekit-text-diff {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.55;
}
.basekit-text-diff__removed {
  color: var(--ui-error, #b42318);
  background: color-mix(in srgb, var(--ui-error, #b42318) 10%, transparent);
  text-decoration-thickness: 1.5px;
}
.basekit-text-diff__added {
  color: var(--ui-success, #067647);
  background: color-mix(in srgb, var(--ui-success, #067647) 12%, transparent);
  text-decoration: none;
}
</style>
