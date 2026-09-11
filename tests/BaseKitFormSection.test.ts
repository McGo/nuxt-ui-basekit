import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitFormSection from '../app/components/BaseKitFormSection.vue'

/**
 * A named group of fields inside a form.
 *
 * The reason this component exists is the type ladder: a hand-rolled heading
 * tends to land on `text-sm font-medium`, which is exactly what a field label
 * weighs. The section then reads as a sibling of the fields it contains.
 */
describe('BaseKitFormSection', () => {
  it('outranks a field label', () => {
    // UFormField labels are `text-sm font-medium`. The section title has to be
    // bigger than that, or the nesting is invisible.
    const w = mount(BaseKitFormSection, { props: { title: 'Access' } })
    const heading = w.get('h3')

    expect(heading.text()).toBe('Access')
    expect(heading.classes()).toContain('text-base')
    expect(heading.classes()).toContain('font-semibold')
  })

  it('places the description above the fields and below the title', () => {
    const w = mount(BaseKitFormSection, {
      props: { title: 'Access', description: 'Empty means everyone.' },
      slots: { default: '<p class="field">field</p>' },
    })

    const text = w.text()
    expect(text.indexOf('Access')).toBeLessThan(text.indexOf('Empty means everyone.'))
    expect(text.indexOf('Empty means everyone.')).toBeLessThan(text.indexOf('field'))
  })

  it('leaves the description out entirely when there is none', () => {
    // An empty paragraph still takes a line of space, and the gap reads like a
    // description someone forgot to write.
    const w = mount(BaseKitFormSection, { props: { title: 'Access' } })

    expect(w.find('p').exists()).toBe(false)
  })

  it('lets the slot carry markup the prop cannot', () => {
    const w = mount(BaseKitFormSection, {
      props: { title: 'Access', description: 'plain' },
      slots: { description: '<a href="/help">Read more</a>' },
    })

    expect(w.get('a').text()).toBe('Read more')
    expect(w.text()).not.toContain('plain')
  })

  it('renders the fields it is given', () => {
    const w = mount(BaseKitFormSection, {
      props: { title: 'Access' },
      slots: { default: '<input class="one"><input class="two">' },
    })

    expect(w.find('.one').exists()).toBe(true)
    expect(w.find('.two').exists()).toBe(true)
  })
})
