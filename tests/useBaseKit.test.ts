import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import BaseKitBackLink from '../app/components/BaseKitBackLink.vue'
import {
  BASEKIT_DEFAULTS,
  baseKitKey,
  useBaseKit,
  type BaseKitConfig,
} from '../app/composables/useBaseKit'

/**
 * The contract between the kit and the application using it.
 *
 * Two things have to hold for the package to stand on its own: without an
 * application it still renders something readable, and with one, that
 * application's table wins. Both are checked here.
 */

function withConfig(config: Partial<BaseKitConfig>) {
  return computed<BaseKitConfig>(() => ({
    ...BASEKIT_DEFAULTS,
    ...config,
    labels: { ...BASEKIT_DEFAULTS.labels, ...config.labels },
  }))
}

describe('useBaseKit', () => {
  it('renders the defaults when no application provides anything', () => {
    const w = mount(BaseKitBackLink, {
      props: { to: '/admin/users' },
      global: { stubs: { NuxtLink: { template: '<a><slot /></a>' }, UIcon: true } },
    })

    expect(w.text()).toBe('Back to overview')
  })

  it('takes the application labels when it provides some', () => {
    const w = mount(BaseKitBackLink, {
      props: { to: '/admin/users' },
      global: {
        provide: { [baseKitKey as symbol]: withConfig({ labels: { ...BASEKIT_DEFAULTS.labels, back: 'Back to list' } }) },
        stubs: { NuxtLink: { template: '<a><slot /></a>' }, UIcon: true },
      },
    })

    expect(w.text()).toBe('Back to list')
  })

  it('still lets a prop win over the provided label', () => {
    const w = mount(BaseKitBackLink, {
      props: { to: '/admin/users', label: 'Back to sections' },
      global: {
        provide: { [baseKitKey as symbol]: withConfig({ labels: { ...BASEKIT_DEFAULTS.labels, back: 'Back to list' } }) },
        stubs: { NuxtLink: { template: '<a><slot /></a>' }, UIcon: true },
      },
    })

    expect(w.text()).toBe('Back to sections')
  })

  it('passes the locale through for Intl', () => {
    let seen = ''
    const Probe = defineComponent({
      setup() {
        const config = useBaseKit()
        seen = config.value.locale
        return () => h('div')
      },
    })

    mount(Probe, {
      global: { provide: { [baseKitKey as symbol]: withConfig({ locale: 'fr-FR' }) } },
    })

    expect(seen).toBe('fr-FR')
  })

  it('covers every label with a default', () => {
    // A missing default otherwise only shows up where an application fills
    // the table incompletely — and then renders empty.
    for (const [name, value] of Object.entries(BASEKIT_DEFAULTS.labels)) {
      if (typeof value === 'function') continue
      if (typeof value === 'object') {
        for (const [sub, v] of Object.entries(value)) {
          expect(v, `${name}.${sub}`).toBeTruthy()
        }
        continue
      }
      expect(value, name).toBeTruthy()
    }

    expect(BASEKIT_DEFAULTS.labels.paginationRange({ from: 1, to: 25, total: 300 }))
      .toBe('1–25 of 300')
  })
})
