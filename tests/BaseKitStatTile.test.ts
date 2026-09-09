import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitStatTile from '../app/components/BaseKitStatTile.vue'

const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }
const NuxtLink = { props: ['to'], template: '<a :href="to"><slot /></a>' }

function render(props: Record<string, unknown> = {}) {
  return mount(BaseKitStatTile, {
    props: { label: 'Einsendungen', value: 3, ...props },
    global: { stubs: { UIcon, NuxtLink } },
  })
}

describe('BaseKitStatTile', () => {
  it('renders label and value', () => {
    const wrapper = render()
    expect(wrapper.text()).toContain('Einsendungen')
    expect(wrapper.text()).toContain('3')
  })

  it('becomes a link when a target is given', () => {
    expect(render({ href: '/admin/forms' }).find('a').attributes('href')).toBe('/admin/forms')
  })

  it('stays a plain box without a target', () => {
    expect(render().find('a').exists()).toBe(false)
  })

  it('flags an alert tone with an icon, not with colour alone', () => {
    const wrapper = render({ tone: 'alert', value: 2 })
    expect(wrapper.find('[data-icon="i-lucide-alert-triangle"]').exists()).toBe(true)
  })

  it('leaves a zero alone even with an alert tone', () => {
    // „0 kaputte Videos" ist der Normalzustand und keine Warnung.
    const wrapper = render({ tone: 'alert', value: 0 })
    expect(wrapper.find('[data-icon="i-lucide-alert-triangle"]').exists()).toBe(false)
    expect(wrapper.find('p.text-error').exists()).toBe(false)
  })

  it('renders the hint below the value', () => {
    expect(render({ hint: 'Letzte 7 Tage' }).text()).toContain('Letzte 7 Tage')
  })
})
