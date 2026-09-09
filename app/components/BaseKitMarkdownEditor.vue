<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { renderMarkdown } from '../utils/markdown'
import { htmlToMarkdown, prepareHtmlToMarkdown } from '../utils/html-to-markdown'

/**
 * WYSIWYG-Editor für den Text-Block. v-model ist ein **Markdown-String**.
 *
 * Tiptap arbeitet intern mit HTML; die Brücke nach Markdown läuft über zwei
 * etablierte Bibliotheken statt eines Tiptap-Markdown-Plugins (versionsrobust):
 *   - Laden:    Markdown → HTML via markdown-it (`renderMarkdown`)
 *   - Speichern: HTML → Markdown via turndown
 *
 * Der Editor wird erst `onMounted` erzeugt (ProseMirror braucht DOM, SSR-sicher).
 */
const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const labels = useBaseKitLabels()

const editor = shallowRef<Editor>()

function toMarkdown(html: string): string {
  return htmlToMarkdown(html)
}

onMounted(() => {
  // turndown im Browser nachladen — Details in html-to-markdown.ts.
  prepareHtmlToMarkdown()
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: renderMarkdown(props.modelValue),
    onUpdate: ({ editor }) => emit('update:modelValue', toMarkdown(editor.getHTML())),
  })
})

onBeforeUnmount(() => editor.value?.destroy())

// Externe Wertänderung übernehmen, ohne den Cursor zu stören (nur bei echtem Diff).
watch(() => props.modelValue, (v) => {
  if (!editor.value) return
  if ((v ?? '') !== toMarkdown(editor.value.getHTML())) {
    editor.value.commands.setContent(renderMarkdown(v))
  }
})

function setLink(): void {
  if (!editor.value) return
  const prev = editor.value.getAttributes('link').href as string | undefined
  const url = window.prompt(labels.value.markdown.linkPrompt, prev ?? '')
  if (url === null) return
  if (url === '') { editor.value.chain().focus().extendMarkRange('link').unsetLink().run(); return }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function isActive(name: string, attrs?: Record<string, unknown>): boolean {
  return !!editor.value?.isActive(name, attrs)
}
</script>

<template>
  <div class="md-editor">
    <div v-if="editor" class="md-toolbar">
      <button type="button" :class="{ on: isActive('bold') }" :aria-label="labels.markdown.bold" :title="labels.markdown.bold" @click="editor.chain().focus().toggleBold().run()"><UIcon name="i-lucide-bold" class="size-4" /></button>
      <button type="button" :class="{ on: isActive('italic') }" :aria-label="labels.markdown.italic" :title="labels.markdown.italic" @click="editor.chain().focus().toggleItalic().run()"><UIcon name="i-lucide-italic" class="size-4" /></button>
      <span class="md-sep" />
      <button type="button" :class="{ on: isActive('heading', { level: 2 }) }" :aria-label="labels.markdown.h2" :title="labels.markdown.h2" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"><UIcon name="i-lucide-heading-2" class="size-4" /></button>
      <button type="button" :class="{ on: isActive('heading', { level: 3 }) }" :aria-label="labels.markdown.h3" :title="labels.markdown.h3" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"><UIcon name="i-lucide-heading-3" class="size-4" /></button>
      <span class="md-sep" />
      <button type="button" :class="{ on: isActive('bulletList') }" :aria-label="labels.markdown.bullet" :title="labels.markdown.bullet" @click="editor.chain().focus().toggleBulletList().run()"><UIcon name="i-lucide-list" class="size-4" /></button>
      <button type="button" :class="{ on: isActive('orderedList') }" :aria-label="labels.markdown.ordered" :title="labels.markdown.ordered" @click="editor.chain().focus().toggleOrderedList().run()"><UIcon name="i-lucide-list-ordered" class="size-4" /></button>
      <button type="button" :class="{ on: isActive('blockquote') }" :aria-label="labels.markdown.quote" :title="labels.markdown.quote" @click="editor.chain().focus().toggleBlockquote().run()"><UIcon name="i-lucide-quote" class="size-4" /></button>
      <button type="button" :class="{ on: isActive('code') }" :aria-label="labels.markdown.code" :title="labels.markdown.code" @click="editor.chain().focus().toggleCode().run()"><UIcon name="i-lucide-code" class="size-4" /></button>
      <span class="md-sep" />
      <button type="button" :class="{ on: isActive('link') }" :aria-label="labels.markdown.link" :title="labels.markdown.link" @click="setLink()"><UIcon name="i-lucide-link" class="size-4" /></button>
    </div>
    <EditorContent :editor="editor" class="md-content" />
  </div>
</template>

<style scoped>
.md-editor { border: 1px solid var(--basekit-border-strong, #d6dbe4); border-radius: 8px; overflow: hidden; background: #fff; }
.md-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 3px; padding: 6px 8px; border-bottom: 1px solid var(--basekit-border, #e5e8ee); background: var(--basekit-surface-muted, #f4f6fa); }
.md-toolbar button { min-width: 28px; height: 26px; padding: 0 7px; border: 1px solid transparent; border-radius: 6px; background: transparent; font: inherit; font-size: 13px; line-height: 1; color: var(--basekit-text, #101828); cursor: pointer; }
.md-toolbar button:hover { background: #fff; border-color: var(--basekit-border, #e5e8ee); }
.md-toolbar button.on { background: var(--basekit-accent, #2563eb); color: #fff; }
.md-sep { width: 1px; height: 18px; background: var(--basekit-border, #e5e8ee); margin: 0 3px; }
.md-content :deep(.ProseMirror) { min-height: 220px; padding: 12px 14px; outline: none; font-size: 0.9375rem; line-height: 1.6; }
.md-content :deep(.ProseMirror h2) { font-weight: 700; font-size: 1.25rem; margin: 0.5rem 0; }
.md-content :deep(.ProseMirror h3) { font-weight: 700; font-size: 1.1rem; margin: 0.5rem 0; }
.md-content :deep(.ProseMirror p) { margin: 0 0 0.6rem; }
.md-content :deep(.ProseMirror ul) { margin: 0 0 0.6rem 1.1rem; list-style: disc; }
.md-content :deep(.ProseMirror ol) { margin: 0 0 0.6rem 1.3rem; list-style: decimal; }
.md-content :deep(.ProseMirror blockquote) { margin: 0 0 0.6rem; padding-left: 0.9rem; border-left: 3px solid var(--basekit-accent, #2563eb); color: var(--basekit-text-muted, #667085); }
.md-content :deep(.ProseMirror code) { font-family: ui-monospace, monospace; font-size: 0.85em; background: var(--basekit-surface-muted, #f4f6fa); padding: 0.1em 0.35em; border-radius: 4px; }
.md-content :deep(.ProseMirror a) { color: var(--basekit-accent, #2563eb); text-decoration: underline; }

/* Dark-Mode: die hart hinterlegten Light-Fallbacks überschreiben. */
:where(.dark) .md-editor { background: #101828; border-color: #1f2937; }
:where(.dark) .md-toolbar { background: #0b1220; border-color: #1f2937; }
:where(.dark) .md-toolbar button { color: #e5e7eb; }
:where(.dark) .md-toolbar button:hover { background: #1f2937; border-color: #374151; }
:where(.dark) .md-sep { background: #1f2937; }
:where(.dark) .md-content :deep(.ProseMirror code) { background: #1f2937; }
</style>
