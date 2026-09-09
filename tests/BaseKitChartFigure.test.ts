import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitChartFigure from '../app/components/charts/BaseKitChartFigure.vue'

const UCard = { template: '<section><slot /></section>' }
const UButton = {
  props: ['icon', 'ariaLabel'],
  emits: ['click'],
  template: '<button :data-icon="icon" @click="$emit(\'click\')" />',
}
const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }
const NuxtLink = { props: ['to'], template: '<a :href="to"><slot /></a>' }

function render(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BaseKitChartFigure, {
    props: { title: 'Aktivität', ...props },
    slots: { default: '<div data-test="plot" />', table: '<table data-test="table" />', ...slots },
    global: { stubs: { UCard, UButton, UIcon, NuxtLink } },
  })
}

/** Visibility through `v-show` — the nodes stay, only `display` changes. */
function visible(wrapper: ReturnType<typeof render>, selector: string): boolean {
  const el = wrapper.find(selector).element.parentElement
  return el ? el.style.display !== 'none' : false
}

describe('BaseKitChartFigure', () => {
  it('renders title and subtitle', () => {
    expect(render({ subtitle: 'Letzte 30 Tage' }).text()).toContain('Aktivität')
    expect(render({ subtitle: 'Letzte 30 Tage' }).text()).toContain('Letzte 30 Tage')
  })

  it('shows the chart first and keeps the table out of the way', () => {
    const wrapper = render()
    expect(visible(wrapper, '[data-test="plot"]')).toBe(true)
    expect(visible(wrapper, '[data-test="table"]')).toBe(false)
  })

  it('switches to the table view and back', async () => {
    const wrapper = render()

    await wrapper.find('button').trigger('click')
    expect(visible(wrapper, '[data-test="table"]')).toBe(true)
    expect(visible(wrapper, '[data-test="plot"]')).toBe(false)

    await wrapper.find('button').trigger('click')
    expect(visible(wrapper, '[data-test="plot"]')).toBe(true)
  })

  it('drops the toggle when there is no table to switch to', () => {
    const wrapper = render({ tableAvailable: false })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[data-test="table"]').exists()).toBe(false)
  })

  it('turns the title into a link when a target is given', () => {
    const wrapper = render({ href: '/admin/users' })
    expect(wrapper.find('a').attributes('href')).toBe('/admin/users')
    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('keeps the title a heading without a target', () => {
    const wrapper = render()
    expect(wrapper.find('h2').text()).toBe('Aktivität')
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('dims the content while a reload is in flight instead of dropping it', () => {
    const wrapper = render({ stale: true })
    expect(wrapper.html()).toContain('opacity-60')
    expect(wrapper.find('[data-test="plot"]').exists()).toBe(true)
  })
})
