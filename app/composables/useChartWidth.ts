import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Misst die Breite eines Containers, damit ein SVG in echten Pixeln zeichnen
 * kann statt über eine skalierte `viewBox`.
 *
 * Der Unterschied ist die Schrift: eine `viewBox`, die auf Containerbreite
 * hochgerechnet wird, zieht Achsenbeschriftung und Werte mit hoch — auf einer
 * breiten Karte steht dann 15-px-Text, wo 11 gemeint waren. Mit gemessener
 * Breite bleibt Text Text und nur die Geometrie wächst.
 *
 * Vor dem Mounten (SSR, erster Frame) gilt `fallback`. Das Diagramm ist damit
 * sofort da und rückt einmal zurecht, statt zu flackern.
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
      // Unter 240 px wird die Geometrie unbrauchbar; dann lieber schmal
      // zeichnen und den Container scrollen lassen.
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
