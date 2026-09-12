import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitResizeHandle from '../app/components/BaseKitResizeHandle.vue'

/**
 * The edge between two panes.
 *
 * Everything worth testing here is arithmetic with a sign: dragging left has
 * to widen a right-hand pane and narrow a left-hand one, and neither may leave
 * the limits. Getting the sign wrong produces a handle that runs away from the
 * pointer, which looks broken long before anyone calls it a bug.
 */
function handle(props: Record<string, unknown> = {}) {
  return mount(BaseKitResizeHandle, { props: { width: 300, ...props } })
}

/**
 * The bits of a pointer event the component reads. `currentTarget` is not
 * among them: the DOM sets it, and passing one makes `trigger` throw.
 */
function zeiger(x: number): Record<string, unknown> {
  return { button: 0, clientX: x, pointerId: 1 }
}

async function ziehe(w: ReturnType<typeof handle>, von: number, nach: number) {
  const el = w.get('[role="separator"]')
  await el.trigger('pointerdown', zeiger(von))
  await el.trigger('pointermove', zeiger(nach))

  return w.emitted('update:width')?.at(-1)?.[0] as number | undefined
}

describe('BaseKitResizeHandle', () => {
  it('widens a right-hand pane when the pointer goes left', async () => {
    expect(await ziehe(handle(), 800, 700)).toBe(400)
  })

  it('turns the sign around for a pane on the left', async () => {
    expect(await ziehe(handle({ side: 'right' }), 300, 400)).toBe(400)
  })

  it('stays inside the limits', async () => {
    expect(await ziehe(handle({ min: 280, max: 560 }), 800, 100)).toBe(560)
    expect(await ziehe(handle({ min: 280, max: 560 }), 800, 1500)).toBe(280)
  })

  it('ignores a move that never started with a press', async () => {
    const w = handle()
    await w.get('[role="separator"]').trigger('pointermove', zeiger(100))

    expect(w.emitted('update:width')).toBeUndefined()
  })

  it('lets go on pointerup', async () => {
    const w = handle()
    const el = w.get('[role="separator"]')
    await el.trigger('pointerdown', zeiger(800))
    await el.trigger('pointerup', zeiger(800))
    await el.trigger('pointermove', zeiger(600))

    expect(w.emitted('update:width')).toBeUndefined()
  })

  it('keeps quiet while the width does not actually change', async () => {
    // A pointer that jitters within a pixel would otherwise write to storage
    // on every frame.
    const w = handle()
    const el = w.get('[role="separator"]')
    await el.trigger('pointerdown', zeiger(800))
    await el.trigger('pointermove', zeiger(800))

    expect(w.emitted('update:width')).toBeUndefined()
  })

  it('moves with the arrow keys, four times as far with Shift', async () => {
    const w = handle({ step: 16, min: 200 })
    const el = w.get('[role="separator"]')

    await el.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:width')?.at(-1)?.[0]).toBe(316)

    await el.trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect(w.emitted('update:width')?.at(-1)?.[0]).toBe(236)
  })

  it('jumps to the limits with Home and End', async () => {
    const w = handle({ min: 280, max: 560 })
    const el = w.get('[role="separator"]')

    await el.trigger('keydown', { key: 'Home' })
    expect(w.emitted('update:width')?.at(-1)?.[0]).toBe(280)

    await el.trigger('keydown', { key: 'End' })
    expect(w.emitted('update:width')?.at(-1)?.[0]).toBe(560)
  })

  it('returns to the given width on a double click', async () => {
    const w = handle({ width: 520, reset: 300 })
    await w.get('[role="separator"]').trigger('dblclick')

    expect(w.emitted('update:width')?.at(-1)?.[0]).toBe(300)

    const ohne = handle({ width: 520 })
    await ohne.get('[role="separator"]').trigger('dblclick')
    expect(ohne.emitted('update:width')).toBeUndefined()
  })

  it('carries its value for anyone not using a pointer', () => {
    const el = handle({ min: 280, max: 560 }).get('[role="separator"]')

    expect(el.attributes('aria-orientation')).toBe('vertical')
    expect(el.attributes('tabindex')).toBe('0')
    expect(el.attributes('aria-valuenow')).toBe('300')
    expect(el.attributes('aria-valuemin')).toBe('280')
    expect(el.attributes('aria-valuemax')).toBe('560')
    expect(el.attributes('aria-label')).toBe('Resize panel')
  })
})
