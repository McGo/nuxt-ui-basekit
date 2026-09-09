/**
 * Stand-in for Nuxt's virtual `#components` under Vitest.
 *
 * `BaseKitDataTable` imports `NuxtLink` from there as a component, not as a
 * name. A `global.stubs.NuxtLink` in the test therefore no longer applies —
 * the replacement has to live here and behave like a link, otherwise the tests
 * check something other than what the application renders.
 */
import { defineComponent, h } from 'vue'

export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: [String, Object], default: undefined } },
  setup(props, { slots }) {
    return () => h('a', { href: typeof props.to === 'string' ? props.to : undefined }, slots.default?.())
  },
})
