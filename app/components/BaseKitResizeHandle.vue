<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBaseKitLabels } from '../composables/useBaseKit'

/**
 * The edge between two panes, grabbed to move it.
 *
 *   ┌────────────┬╌┬──────────┐
 *   │  content   │ │ settings │
 *   │            │▮│          │   ▮ = the grip, visible on hover and focus
 *   └────────────┴╌┴──────────┘
 *
 * A fixed side panel is a guess about content nobody has seen yet. Three
 * settings fit into 300 px; eleven do not, and the ones that are pickers wrap
 * into two rows. Making the guess adjustable costs a strip of eight pixels.
 *
 * The component owns no width. It reports what the pointer did — `width` in,
 * `update:width` out — so the page decides what to do with the number and
 * where to keep it. That also keeps the handle usable on the other side: with
 * `side="right"` dragging to the right widens instead of narrows.
 *
 * Reachable without a pointer, because a pane that can only be resized by
 * dragging is a pane some people cannot resize at all: it is a `separator`
 * with a value, the arrow keys move it in steps, Home and End go to the
 * limits. A double click returns to `reset`, if one is given.
 *
 * `touch-action: none` is not decoration. Without it the browser takes the
 * gesture for scrolling and the handle never sees the second pointer event.
 */
const props = withDefaults(defineProps<{
  /** Current width of the pane in pixels. */
  width: number
  min?: number
  max?: number
  /**
   * Which edge of the pane the handle sits on. `left` (the default) is a pane
   * on the right of the screen: dragging left makes it wider.
   */
  side?: 'left' | 'right'
  /** Width restored on a double click. Without it, double click does nothing. */
  reset?: number
  /** Step of a single arrow key press. Shift multiplies it by four. */
  step?: number
  /** Accessible name; falls back to the shared label. */
  label?: string
}>(), {
  min: 240,
  max: 640,
  side: 'left',
  reset: undefined,
  step: 16,
  label: undefined,
})

const emit = defineEmits<{ 'update:width': [number] }>()

const labels = useBaseKitLabels()

const beschriftung = computed(() => props.label ?? labels.value.resize)

const zieht = ref(false)

/** Dragging left widens a right-hand pane, and the other way around. */
const richtung = computed(() => (props.side === 'left' ? -1 : 1))

function begrenzt(wert: number): number {
  return Math.min(props.max, Math.max(props.min, Math.round(wert)))
}

function melde(wert: number): void {
  const neu = begrenzt(wert)
  if (neu !== props.width) emit('update:width', neu)
}

let startX = 0
let startBreite = 0

function onPointerDown(event: PointerEvent): void {
  // Nur die primäre Taste; ein Rechtsklick auf die Kante soll nichts ziehen.
  if (event.button !== 0) return

  startX = event.clientX
  startBreite = props.width
  zieht.value = true
  // Der Zeiger gehört ab jetzt dem Griff, auch wenn er die acht Pixel
  // verlässt — sonst reißt der Zug beim ersten schnellen Wisch ab. Optional
  // aufgerufen: in einer Testumgebung ohne echtes Zeigermodell gibt es die
  // Methode nicht, und daran soll das Ziehen nicht scheitern.
  griff(event)?.setPointerCapture?.(event.pointerId)
  event.preventDefault()
}

/** Das Element, auf dem der Zug läuft. */
function griff(event: PointerEvent): HTMLElement | null {
  return (event.currentTarget ?? null) as HTMLElement | null
}

function onPointerMove(event: PointerEvent): void {
  if (!zieht.value) return

  melde(startBreite + (event.clientX - startX) * richtung.value)
}

function onPointerUp(event: PointerEvent): void {
  if (!zieht.value) return

  zieht.value = false
  griff(event)?.releasePointerCapture?.(event.pointerId)
}

function onKeydown(event: KeyboardEvent): void {
  const schritt = props.step * (event.shiftKey ? 4 : 1)

  // Die Pfeiltaste bewegt die Kante, nicht die Breite: nach links heißt für
  // ein rechtes Feld breiter. `richtung` dreht das Vorzeichen mit der Seite.
  switch (event.key) {
    case 'ArrowLeft': melde(props.width - schritt * richtung.value); break
    case 'ArrowRight': melde(props.width + schritt * richtung.value); break
    case 'Home': melde(props.min); break
    case 'End': melde(props.max); break
    default: return
  }

  event.preventDefault()
}

function onDoubleClick(): void {
  if (props.reset !== undefined) melde(props.reset)
}
</script>

<template>
  <div
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
    :aria-label="beschriftung"
    :aria-valuenow="width"
    :aria-valuemin="min"
    :aria-valuemax="max"
    class="group relative w-2 shrink-0 cursor-col-resize touch-none select-none outline-none"
    :class="zieht ? 'bg-primary/10' : 'hover:bg-elevated focus-visible:bg-elevated'"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeydown"
    @dblclick="onDoubleClick"
  >
    <span
      class="pointer-events-none absolute top-1/2 left-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity"
      :class="zieht ? 'bg-primary opacity-100' : 'bg-accented opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'"
    />
  </div>
</template>
