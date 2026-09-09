import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Measures a container so an SVG can draw in real pixels instead of going
 * through a scaled `viewBox`.
 *
 * The difference is the type: a `viewBox` scaled up to container width drags
 * axis labels and values up with it — a wide card then shows 15px text where
 * 11 was meant. With a measured width, text stays text and only the geometry
 * grows.
 *
 * Before mount (SSR, first frame) `fallback` applies. The chart is therefore
 * there straight away and settles once, rather than flickering.
 */
export function useChartWidth(fallback = 640): {
  el: Ref<HTMLElement | null>
  width: Ref<number>
} {
  const el = ref<HTMLElement | null>(null)
  const width = ref(fallback)
  let observer: ResizeObserver | null = null

  onMounted(() => {
    if (!el.value || typeof ResizeObserver === 'undefined') return

    observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width ?? 0
      // Below 240px the geometry becomes useless; draw narrow and let the
      // container scroll instead.
      if (measured > 0) width.value = Math.max(240, Math.round(measured))
    })
    observer.observe(el.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { el, width }
}
