import { computed } from 'vue'
import { baseKitKey, BASEKIT_DEFAULTS } from 'nuxt-ui-basekit/labels'

/**
 * The plugin from the README, verbatim in its import.
 *
 * It hands in nothing but the defaults — its job is to keep the documented
 * `nuxt-ui-basekit/labels` entry point inside every playground build. That
 * import once broke production builds in consumers while typecheck and tests
 * stayed green.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.provide(baseKitKey, computed(() => BASEKIT_DEFAULTS))
})
