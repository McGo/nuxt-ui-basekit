import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseKitPullToRefresh from '../app/components/BaseKitPullToRefresh.vue'

const UIcon = { props: ['name'], template: '<i :data-icon="name" />' }

function touch(type: string, y: number): TouchEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent
  Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [{ clientY: y }] })
  return event
}

function setup(scrollTop = 0, refresh: () => unknown = () => undefined) {
  const scroller = document.createElement('div')
  Object.defineProperty(scroller, 'scrollTop', { value: scrollTop, writable: true })
  document.body.appendChild(scroller)
  const wrapper = mount(BaseKitPullToRefresh, {
    props: { target: scroller, refresh },
    global: { stubs: { UIcon } },
    attachTo: document.body,
  })
  return { scroller, wrapper }
}

describe('BaseKitPullToRefresh', () => {
  it('refreshes after a pull past the threshold', async () => {
    const refresh = vi.fn()
    const { scroller } = setup(0, refresh)

    scroller.dispatchEvent(touch('touchstart', 100))
    scroller.dispatchEvent(touch('touchmove', 300))
    scroller.dispatchEvent(touch('touchend', 0))
    await nextTick()

    expect(refresh).toHaveBeenCalledOnce()
  })

  it('does nothing on a short pull', async () => {
    const refresh = vi.fn()
    const { scroller } = setup(0, refresh)

    scroller.dispatchEvent(touch('touchstart', 100))
    scroller.dispatchEvent(touch('touchmove', 140))
    scroller.dispatchEvent(touch('touchend', 0))
    await nextTick()

    expect(refresh).not.toHaveBeenCalled()
  })

  it('ignores the gesture while the content is scrolled down', async () => {
    // Otherwise every scroll back up would end in a reload.
    const refresh = vi.fn()
    const { scroller } = setup(120, refresh)

    scroller.dispatchEvent(touch('touchstart', 100))
    const move = touch('touchmove', 300)
    scroller.dispatchEvent(move)
    scroller.dispatchEvent(touch('touchend', 0))
    await nextTick()

    expect(refresh).not.toHaveBeenCalled()
    expect(move.defaultPrevented).toBe(false)
  })

  it('leaves an upward swipe to the browser', () => {
    const { scroller } = setup(0)

    scroller.dispatchEvent(touch('touchstart', 300))
    const move = touch('touchmove', 100)
    scroller.dispatchEvent(move)

    expect(move.defaultPrevented).toBe(false)
  })

  it('holds back the native rubber band while pulling', () => {
    const { scroller } = setup(0)

    scroller.dispatchEvent(touch('touchstart', 100))
    const move = touch('touchmove', 200)
    scroller.dispatchEvent(move)

    expect(move.defaultPrevented).toBe(true)
  })

  it('shows the spinner until the refresh settles', async () => {
    let finish!: () => void
    const refresh = () => new Promise<void>((resolve) => { finish = resolve })
    const { scroller, wrapper } = setup(0, refresh)

    scroller.dispatchEvent(touch('touchstart', 100))
    scroller.dispatchEvent(touch('touchmove', 300))
    scroller.dispatchEvent(touch('touchend', 0))
    await nextTick()
    expect(wrapper.find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(true)

    finish()
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()
    expect(wrapper.find('[data-icon="i-lucide-loader-circle"]').exists()).toBe(false)
  })
})
