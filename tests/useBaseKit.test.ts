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
 * Der Kontrakt zwischen Kit und Anwendung.
 *
 * Zwei Dinge müssen stimmen, damit sich `base/` eines Tages als Paket
 * herausschneiden lässt: ohne Anwendung rendert es trotzdem lesbar, und mit
 * Anwendung gewinnt deren Tabelle. Beides steht hier.
 */

function mitKonfiguration(config: Partial<BaseKitConfig>) {
  return computed<BaseKitConfig>(() => ({
    ...BASEKIT_DEFAULTS,
    ...config,
    labels: { ...BASEKIT_DEFAULTS.labels, ...config.labels },
  }))
}

describe('useBaseKit', () => {
  it('rendert die Voreinstellung, wenn keine Anwendung etwas bereitstellt', () => {
    const w = mount(BaseKitBackLink, {
      props: { to: '/admin/users' },
      global: { stubs: { NuxtLink: { template: '<a><slot /></a>' }, UIcon: true } },
    })

    expect(w.text()).toBe('Back to overview')
  })

  it('nimmt die Beschriftungen der Anwendung, wenn sie welche bereitstellt', () => {
    const w = mount(BaseKitBackLink, {
      props: { to: '/admin/users' },
      global: {
        provide: { [baseKitKey as symbol]: mitKonfiguration({ labels: { ...BASEKIT_DEFAULTS.labels, back: 'Back to list' } }) },
        stubs: { NuxtLink: { template: '<a><slot /></a>' }, UIcon: true },
      },
    })

    expect(w.text()).toBe('Back to list')
  })

  it('lässt ein Prop weiterhin über die bereitgestellte Beschriftung gewinnen', () => {
    const w = mount(BaseKitBackLink, {
      props: { to: '/admin/users', label: 'Zurück zu den Rubriken' },
      global: {
        provide: { [baseKitKey as symbol]: mitKonfiguration({ labels: { ...BASEKIT_DEFAULTS.labels, back: 'Back to list' } }) },
        stubs: { NuxtLink: { template: '<a><slot /></a>' }, UIcon: true },
      },
    })

    expect(w.text()).toBe('Zurück zu den Rubriken')
  })

  it('reicht die Sprache für Intl durch', () => {
    let gelesen = ''
    const Probe = defineComponent({
      setup() {
        const config = useBaseKit()
        gelesen = config.value.locale
        return () => h('div')
      },
    })

    mount(Probe, {
      global: { provide: { [baseKitKey as symbol]: mitKonfiguration({ locale: 'fr-FR' }) } },
    })

    expect(gelesen).toBe('fr-FR')
  })

  it('deckt jede Beschriftung mit einer Voreinstellung ab', () => {
    // Eine fehlende Voreinstellung fällt sonst erst dort auf, wo eine
    // Anwendung die Tabelle nicht vollständig füllt — und rendert leer.
    for (const [name, wert] of Object.entries(BASEKIT_DEFAULTS.labels)) {
      if (typeof wert === 'function') continue
      if (typeof wert === 'object') {
        for (const [unter, u] of Object.entries(wert)) {
          expect(u, `${name}.${unter}`).toBeTruthy()
        }
        continue
      }
      expect(wert, name).toBeTruthy()
    }

    expect(BASEKIT_DEFAULTS.labels.paginationRange({ from: 1, to: 25, total: 300 }))
      .toBe('1–25 of 300')
  })
})
