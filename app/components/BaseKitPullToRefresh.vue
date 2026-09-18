<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Pull down at the top of a list to reload it.
 *
 *  ┌──────────────────────────────┐
 *  │ Header                       │
 *  ├──────────────────────────────┤
 *  │             ( ↻ )            │  ← drops in while pulling
 *  │ first entry                  │
 *  │ …                            │
 *
 * Phones taught everyone this gesture. A web page inside a native WebView
 * does not get it for free: the browser's own version belongs to the
 * document, and a page whose content scrolls inside a container — a
 * dashboard panel — never triggers it. So the page does it itself.
 *
 * The component watches one scroll container (`target`). It only engages
 * while that container sits at the very top and the finger moves downwards;
 * any other touch passes through untouched, so scrolling feels exactly as
 * before. Past `threshold` pixels of pull, letting go calls `refresh` and
 * shows a spinner until the returned promise settles.
 *
 * The native rubber band is suppressed during the pull (the move is
 * cancelled), otherwise the content would slide down under the indicator
 * and the two would fight. That needs a non-passive listener, which is why
 * the component attaches its own instead of taking events via props.
 *
 * Place it as the first child inside the scroll container. It is `sticky`
 * with no height, so it stays at the top edge of the visible area and takes
 * no room when idle. When the document itself scrolls under a sticky header,
 * pass `document.scrollingElement` as `target`, put the component right after
 * the header and shift it down: `class="top-(--ui-header-height)"`.
 *
 * Usage:
 *
 *   <div ref="scroller" class="overflow-y-auto">
 *     <BaseKitPullToRefresh :target="scroller" :refresh="reload" />
 *     …
 *   </div>
 *
 * Without touch input nothing ever fires — on a desktop the component is
 * inert.
 */
const props = withDefaults(defineProps<{
  /** The element that scrolls. `null` until the caller has it. */
  target: HTMLElement | null | undefined
  /** Called on release past the threshold. May return a promise. */
  refresh: () => unknown
  /** Distance in px the indicator has to travel before a release counts. */
  threshold?: number
  disabled?: boolean
  /** Accessible name of the spinner while it runs. */
  label?: string
}>(), {
  threshold: 72,
  disabled: false,
  label: undefined,
})

/** Travel of the indicator, already damped. */
const pull = ref(0)
const busy = ref(false)
/** Finger down and pulling — the indicator follows without easing. */
const dragging = ref(false)
let startY: number | null = null
let attached: HTMLElement | null = null

// Half the finger's travel: the indicator lags behind like a spring, which is
// what makes the gesture read as "pulling" rather than dragging.
const RESISTANCE = 0.5

const progress = computed(() => Math.min(pull.value / props.threshold, 1))
const armed = computed(() => pull.value >= props.threshold)

function atTop(el: HTMLElement): boolean {
  return el.scrollTop <= 0
}

function onStart(event: TouchEvent): void {
  if (props.disabled || busy.value || !attached || !atTop(attached) || event.touches.length !== 1) {
    startY = null
    return
  }
  startY = event.touches[0]!.clientY
}

function onMove(event: TouchEvent): void {
  if (startY === null || !attached) return

  const distance = event.touches[0]!.clientY - startY
  if (distance <= 0 || !atTop(attached)) {
    // Upwards, or the content moved after all: this is a scroll, not a pull.
    startY = null
    dragging.value = false
    pull.value = 0
    return
  }

  if (event.cancelable) event.preventDefault()
  dragging.value = true
  pull.value = Math.min(distance * RESISTANCE, props.threshold * 1.5)
}

async function onEnd(): Promise<void> {
  if (startY === null) return
  startY = null
  dragging.value = false

  if (!armed.value) {
    pull.value = 0
    return
  }

  busy.value = true
  pull.value = props.threshold
  try {
    await props.refresh()
  }
  finally {
    busy.value = false
    pull.value = 0
  }
}

function attach(el: HTMLElement | null | undefined): void {
  detach()
  if (!el) return
  el.addEventListener('touchstart', onStart, { passive: true })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd)
  el.addEventListener('touchcancel', onEnd)
  attached = el
}

function detach(): void {
  if (!attached) return
  attached.removeEventListener('touchstart', onStart)
  attached.removeEventListener('touchmove', onMove)
  attached.removeEventListener('touchend', onEnd)
  attached.removeEventListener('touchcancel', onEnd)
  attached = null
}

// Client only: on the server there is no element and no touch.
onMounted(() => {
  attach(props.target)
  watch(() => props.target, el => attach(el))
})
onBeforeUnmount(detach)

defineExpose({ pull, busy, dragging })
</script>

<template>
  <div class="basekit-pull" data-test="pull-to-refresh">
    <div
      v-show="pull > 0 || busy"
      class="basekit-pull-indicator"
      :class="{ 'basekit-pull-settling': !dragging }"
      :style="{ transform: `translate(-50%, ${pull - 44}px)`, opacity: busy ? 1 : progress }"
      :role="busy ? 'status' : undefined"
      :aria-label="busy ? label : undefined"
      data-test="pull-indicator"
    >
      <UIcon
        :name="busy ? 'i-lucide-loader-circle' : 'i-lucide-arrow-down'"
        class="size-5"
        :class="busy ? 'animate-spin' : ''"
        :style="busy ? undefined : { transform: `rotate(${armed ? 180 : 0}deg)` }"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * In `@layer components` so the caller can move the anchor with a utility —
 * in a document with a sticky header the indicator belongs below it:
 * `class="top-(--ui-header-height)"`. Unlayered, `top: 0` here would win.
 */
@layer components {
  .basekit-pull {
    position: sticky;
    top: 0;
    z-index: 20;
    height: 0;
  }

  .basekit-pull-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    display: flex;
    width: 2.5rem;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--ui-bg);
    color: var(--basekit-pull-color, var(--ui-primary));
    box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
  }

  /* Glide back after release; while the finger is down it follows directly. */
  .basekit-pull-settling {
    transition: transform 180ms ease-out, opacity 180ms ease-out;
  }

  .basekit-pull-indicator :deep(svg),
  .basekit-pull-indicator > * {
    transition: transform 150ms ease-out;
  }
}
</style>
