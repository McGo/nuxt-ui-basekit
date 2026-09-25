import { getCurrentInstance, onBeforeUnmount, reactive } from 'vue'

/**
 * Ticking an item off a list, in steps the eye can follow.
 *
 * On a phone the finger hides what it hits. A checkbox that flips and a row
 * that vanishes in the same frame leave the question open whether the tap
 * landed on the right line at all. Hence a short sequence instead:
 *
 *   tap ─► checked ─► struck ─► leaving ─► gone + commit()
 *   0 ms     │        350 ms     1000 ms     1350 ms
 *            └── a second tap anywhere before `gone` takes it all back
 *
 * The request goes out only at the end. Until then nothing has happened on
 * the server, so undoing it costs nothing — which is the point of the delay.
 *
 * The composable holds the steps and the timers, nothing else. What a step
 * looks like is the caller's: `BaseKitCheckButton`, `BaseKitStrike` and
 * `BaseKitCollapse` are made for it, but a row can use any markup.
 *
 *   const check = useDelayedCheck<number>()
 *
 *   <li v-for="item in items" v-show="!check.isGone(item.id)">
 *     <BaseKitCollapse :open="!check.isLeaving(item.id)">
 *       <BaseKitCheckButton
 *         :checked="check.isChecked(item.id)"
 *         @toggle="check.toggle(item.id, () => markDone(item))"
 *       />
 *       <BaseKitStrike :active="check.isStruck(item.id)">{{ item.title }}</BaseKitStrike>
 *     </BaseKitCollapse>
 *   </li>
 *
 * `commit` should return the promise of the request *and the reload after
 * it*. Once it settles the item has either left the list, or the server said
 * no and the row comes back — either way the step is dropped. A commit that
 * returns nothing gets `restoreAfter` as a fallback, so a failure that nobody
 * reports does not leave a hole in the list for good.
 */
export type DelayedCheckStage = 'checked' | 'struck' | 'leaving' | 'gone'

export interface DelayedCheckOptions {
  /** From the tap until the strike starts, in ms. */
  strikeAt?: number
  /** From the tap until the row starts to fold away. */
  leaveAt?: number
  /** From the tap until the row is gone and `commit` runs. */
  commitAt?: number
  /** Without a promise from `commit`: when to show the row again. */
  restoreAfter?: number
  /** A short buzz on the tap, where the device can (Android; not iOS Safari). */
  haptic?: boolean
}

export interface DelayedCheck<K> {
  stage: (key: K) => DelayedCheckStage | null
  /** From the tap on — the box shows ticked. */
  isChecked: (key: K) => boolean
  /** From the strike on. */
  isStruck: (key: K) => boolean
  /** From folding away on. */
  isLeaving: (key: K) => boolean
  /** Committed, waiting for the list to drop the item. */
  isGone: (key: K) => boolean
  /** Starts the sequence, or takes it back while it is still running. */
  toggle: (key: K, commit: () => unknown) => void
  /** Drops a key at once, whatever step it is in. */
  reset: (key: K) => void
}

const DEFAULTS = {
  strikeAt: 350,
  leaveAt: 1000,
  commitAt: 1350,
  restoreAfter: 6000,
  haptic: true,
}

export function useDelayedCheck<K = string | number>(options: DelayedCheckOptions = {}): DelayedCheck<K> {
  const o = { ...DEFAULTS, ...options }
  const stages = reactive(new Map<K, DelayedCheckStage>()) as Map<K, DelayedCheckStage>
  const timers = new Map<K, ReturnType<typeof setTimeout>[]>()

  function stop(key: K): void {
    timers.get(key)?.forEach(clearTimeout)
    timers.delete(key)
  }

  function reset(key: K): void {
    stop(key)
    stages.delete(key)
  }

  function commitNow(key: K, commit: () => unknown): void {
    stages.set(key, 'gone')
    let result: unknown
    try {
      result = commit()
    } catch (e) {
      reset(key)
      throw e
    }

    if (result instanceof Promise) {
      stop(key)
      result.finally(() => {
        // Only if nobody has started over on the same key in the meantime.
        if (stages.get(key) === 'gone') reset(key)
      })
      return
    }

    timers.set(key, [setTimeout(() => reset(key), o.restoreAfter)])
  }

  function toggle(key: K, commit: () => unknown): void {
    const current = stages.get(key)

    // Committed already — the request is out, a tap changes nothing any more.
    if (current === 'gone') return

    if (current) {
      reset(key)
      return
    }

    if (o.haptic && typeof navigator !== 'undefined') navigator.vibrate?.(12)

    stages.set(key, 'checked')
    timers.set(key, [
      setTimeout(() => stages.set(key, 'struck'), o.strikeAt),
      setTimeout(() => stages.set(key, 'leaving'), o.leaveAt),
      setTimeout(() => commitNow(key, commit), o.commitAt),
    ])
  }

  // Outside a component (a test, a store) there is nothing to unmount.
  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      for (const key of [...timers.keys()]) stop(key)
    })
  }

  const order: DelayedCheckStage[] = ['checked', 'struck', 'leaving', 'gone']
  const atLeast = (key: K, stage: DelayedCheckStage) => {
    const current = stages.get(key)
    return !!current && order.indexOf(current) >= order.indexOf(stage)
  }

  return {
    stage: key => stages.get(key) ?? null,
    isChecked: key => atLeast(key, 'checked'),
    isStruck: key => atLeast(key, 'struck'),
    isLeaving: key => atLeast(key, 'leaving'),
    isGone: key => atLeast(key, 'gone'),
    toggle,
    reset,
  }
}
