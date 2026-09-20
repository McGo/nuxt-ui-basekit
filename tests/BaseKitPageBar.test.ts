import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitPageBar from '../app/components/BaseKitPageBar.vue'

/**
 * The bar that keeps a page's action in sight.
 *
 * What is worth testing is the order and the arbitration: title, extras,
 * links, answer, action — the same on an editor that saves and on a list that
 * creates. And that an error wins over a stale confirmation, because the two
 * next to each other say opposite things about the same click.
 */
const UButton = {
  props: ['loading', 'disabled', 'icon'],
  emits: ['click'],
  template: '<button class="u-btn" :disabled="disabled" :data-loading="loading ? \'1\' : \'\'" @click="$emit(\'click\')"><slot /></button>',
}

const stubs = { UButton }

function render(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BaseKitPageBar, { props, slots, global: { stubs } })
}

/** With a listener — the only way a button appears at all. */
function renderActing(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(BaseKitPageBar, { props, slots, attrs: { onAction: () => {} }, global: { stubs } })
}

describe('BaseKitPageBar', () => {
  it('shows the title and lets the slot carry markup the prop cannot', () => {
    expect(render({ title: 'Administrator' }).get('h1').text()).toBe('Administrator')

    const w = render({ title: 'plain' }, { title: '<em>Rich</em>' })
    expect(w.get('h1 em').text()).toBe('Rich')
    expect(w.text()).not.toContain('plain')
  })

  it('leaves the heading out entirely when there is no title', () => {
    // An empty h1 still occupies a line and reads like a missing name.
    expect(render().find('h1').exists()).toBe(false)
  })

  it('asks the caller to act', async () => {
    // Checked through the listener, not `emitted()`: `action` is deliberately
    // not a declared emit — see the component for why.
    let geklickt = 0
    const w = mount(BaseKitPageBar, {
      props: { title: 'Role' },
      attrs: { onAction: () => { geklickt += 1 } },
      global: { stubs },
    })

    await w.get('[data-test="page-bar-action"]').trigger('click')

    expect(geklickt).toBe(1)
  })

  it('blocks the button while working and when disabled', () => {
    expect(renderActing({ pending: true }).get('[data-test="page-bar-action"]').attributes('data-loading')).toBe('1')
    expect(renderActing({ disabled: true }).get('[data-test="page-bar-action"]').attributes('disabled')).toBeDefined()
  })

  it('shows no button at all when nobody is listening', () => {
    // The point of the whole thing: a page that only lists something has no
    // single action, and should not have to say so. It used to be the other
    // way round — two thirds of the callers wrote `<template #action />` to
    // get rid of a "Save" they never asked for, and whoever forgot shipped a
    // button that looked real and did nothing.
    expect(render({ title: 'Users' }).find('[data-test="page-bar-action"]').exists()).toBe(false)
  })

  it('falls back to Save and lets the page name its own action', () => {
    expect(renderActing().get('[data-test="page-bar-action"]').text()).toBe('Save')
    expect(renderActing({ actionLabel: 'Sichern' }).get('[data-test="page-bar-action"]').text()).toBe('Sichern')
  })

  it('says nothing until there is something to say', () => {
    expect(render({ title: 'Role' }).find('[data-test="page-bar-message"]').exists()).toBe(false)
  })

  it('lets the error win over a stale confirmation', () => {
    // Both at once would say "saved" and "failed" about the same click.
    const w = render({ error: 'Title is required.', feedback: 'Saved' })
    const message = w.get('[data-test="page-bar-message"]')

    expect(message.text()).toBe('Title is required.')
    expect(message.attributes('data-kind')).toBe('error')
  })

  it('confirms when nothing went wrong', () => {
    const w = render({ feedback: 'Saved' })

    expect(w.get('[data-test="page-bar-message"]').attributes('data-kind')).toBe('feedback')
  })

  it('keeps title, links and action in that order', () => {
    // Not "Saved" as the confirmation: it contains "Save", and indexOf then
    // finds the button inside the message instead of the button itself.
    const w = renderActing({ title: 'Role', feedback: 'Stored' }, { actions: '<a class="back">Back</a>' })
    const text = w.text()

    expect(text.indexOf('Role')).toBeLessThan(text.indexOf('Back'))
    expect(text.indexOf('Back')).toBeLessThan(text.indexOf('Stored'))
    expect(text.indexOf('Stored')).toBeLessThan(text.indexOf('Save'))
  })

  it('hands the corner over when the page brings its own', () => {
    // A form split into tabs that each store on their own has no single Save.
    const w = render({ title: 'Group' }, { action: '<button class="mine">Store tab</button>' })

    expect(w.find('[data-test="page-bar-action"]').exists()).toBe(false)
    expect(w.get('.mine').text()).toBe('Store tab')
  })

  it('sticks to whatever scrolls', () => {
    // The whole point: it stays while the form underneath moves.
    expect(render({ title: 'Role' }).get('[data-test="page-bar"]').classes()).toContain('basekit-page-bar')
  })
})
