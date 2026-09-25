import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDelayedCheck } from '../app/composables/useDelayedCheck'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useDelayedCheck', () => {
  it('runs through the steps and commits only at the end', () => {
    const check = useDelayedCheck<number>({ haptic: false })
    const commit = vi.fn()

    check.toggle(1, commit)
    expect(check.stage(1)).toBe('checked')

    vi.advanceTimersByTime(350)
    expect(check.stage(1)).toBe('struck')

    vi.advanceTimersByTime(650)
    expect(check.stage(1)).toBe('leaving')
    expect(commit).not.toHaveBeenCalled()

    vi.advanceTimersByTime(350)
    expect(check.stage(1)).toBe('gone')
    expect(commit).toHaveBeenCalledOnce()
  })

  it('takes it all back on a second tap before the commit', () => {
    const check = useDelayedCheck<number>({ haptic: false })
    const commit = vi.fn()

    check.toggle(1, commit)
    vi.advanceTimersByTime(900)
    check.toggle(1, commit)
    vi.advanceTimersByTime(5000)

    expect(check.stage(1)).toBeNull()
    expect(commit).not.toHaveBeenCalled()
  })

  it('ignores a tap once the request is out', () => {
    const check = useDelayedCheck<number>({ haptic: false })
    const commit = vi.fn(() => new Promise(() => {}))

    check.toggle(1, commit)
    vi.advanceTimersByTime(1350)
    check.toggle(1, commit)

    expect(check.isGone(1)).toBe(true)
    expect(commit).toHaveBeenCalledOnce()
  })

  it('drops the step once the commit settles, also when it fails', async () => {
    const check = useDelayedCheck<number>({ haptic: false })
    let fail!: (e: Error) => void
    const commit = () => new Promise<void>((_, reject) => { fail = reject }).catch(() => {})

    check.toggle(1, commit)
    vi.advanceTimersByTime(1350)
    expect(check.isGone(1)).toBe(true)

    fail(new Error('no'))
    await vi.runAllTimersAsync()
    expect(check.stage(1)).toBeNull()
  })

  it('brings the row back after a while when commit returns nothing', () => {
    const check = useDelayedCheck<number>({ haptic: false, restoreAfter: 2000 })

    check.toggle(1, () => undefined)
    vi.advanceTimersByTime(1350)
    expect(check.isGone(1)).toBe(true)

    vi.advanceTimersByTime(2000)
    expect(check.stage(1)).toBeNull()
  })

  it('keeps keys apart', () => {
    const check = useDelayedCheck<number>({ haptic: false })

    check.toggle(1, () => undefined)
    vi.advanceTimersByTime(400)
    check.toggle(2, () => undefined)

    expect(check.isStruck(1)).toBe(true)
    expect(check.isStruck(2)).toBe(false)
    expect(check.isChecked(2)).toBe(true)
  })

  it('buzzes on the tap where the device can', () => {
    const vibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })

    useDelayedCheck<number>().toggle(1, () => undefined)
    expect(vibrate).toHaveBeenCalledOnce()
  })
})
