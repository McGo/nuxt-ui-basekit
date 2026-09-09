<script setup lang="ts">
import { ref } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * File selection by click or drag and drop. Hands the chosen files up through
 * `select` and does NOT upload them itself — that stays with the caller, who
 * knows whether this is an image or a video.
 */
const props = withDefaults(defineProps<{
  accept?: string
  multiple?: boolean
  label?: string
  disabled?: boolean
}>(), {
  accept: '*/*',
  multiple: false,
  disabled: false,
})

const emit = defineEmits<{ select: [files: File[]] }>()

const labels = useBaseKitLabels()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

function pick(): void {
  if (!props.disabled) input.value?.click()
}

function onChange(event: Event): void {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  if (files.length) emit('select', files)
  // Reset, so the same file can be picked again.
  if (input.value) input.value.value = ''
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  if (props.disabled) return
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('select', props.multiple ? files : files.slice(0, 1))
}
</script>

<template>
  <div
    class="basekit-upload"
    :class="{ 'basekit-upload--drag': dragging, 'basekit-upload--disabled': disabled }"
    role="button"
    tabindex="0"
    @click="pick"
    @keydown.enter.prevent="pick"
    @keydown.space.prevent="pick"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="input"
      type="file"
      class="basekit-upload__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onChange"
    >
    <UIcon name="i-lucide-upload-cloud" class="basekit-upload__icon" />
    <span class="basekit-upload__label">{{ label ?? labels.upload }}</span>
  </div>
</template>

<style scoped>
.basekit-upload {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; min-height: 110px; padding: 16px; cursor: pointer; text-align: center;
  border: 1px dashed var(--basekit-border-strong, #d6dbe4); border-radius: 12px;
  color: var(--basekit-text-muted, #667085); background: var(--basekit-surface, #fff);
  transition: border-color .12s, background .12s;
}
.basekit-upload:hover, .basekit-upload--drag { border-color: var(--basekit-accent, #2563eb); background: var(--basekit-surface-muted, #f7f9fc); }
.basekit-upload--disabled { opacity: .5; cursor: not-allowed; }
.basekit-upload__input { display: none; }
.basekit-upload__icon { font-size: 1.5rem; }
.basekit-upload__label { font-size: 0.8125rem; font-weight: 500; }

/* Dark mode: override the drop zone's light fallbacks. */
:where(.dark) .basekit-upload { border-color: #1f2937; background: #0f172a; color: #9ca3af; }
:where(.dark) .basekit-upload:hover, :where(.dark) .basekit-upload--drag { background: #1f2937; }
</style>
