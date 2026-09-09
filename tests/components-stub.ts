/**
 * Ersatz für Nuxts virtuelles `#components` in Vitest.
 *
 * `BaseKitDataTable` importiert `NuxtLink` von dort als Komponente, nicht als
 * Name. Damit greift ein `global.stubs.NuxtLink` im Test nicht mehr — der
 * Ersatz muss hier stehen und sich wie ein Link verhalten, sonst prüfen die
 * Tests etwas anderes, als die Anwendung rendert.
 */
import { defineComponent, h } from 'vue'

export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: [String, Object], default: undefined } },
  setup(props, { slots }) {
    return () => h('a', { href: typeof props.to === 'string' ? props.to : undefined }, slots.default?.())
  },
})
