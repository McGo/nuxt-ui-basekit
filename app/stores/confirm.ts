import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Options for one confirmation prompt. */
export interface BaseKitConfirmOptions {
  /** Dialog title. Falls back to the `confirmTitle` label. */
  title?: string
  /** Explanation or consequence — spell it out for anything destructive. */
  description?: string
  /** Label of the confirm button. Falls back to the `confirm` label. */
  confirmLabel?: string
  /** Label of the cancel button. Falls back to the `cancel` label. */
  cancelLabel?: string
  /** Colour of the confirm button — `error` for destructive actions. */
  color?: 'error' | 'primary'
  /** Optional icon on the confirm button. */
  icon?: string
}

/**
 * The confirmation store — replaces native `window.confirm` dialogs with a
 * themed, dark-mode-capable prompt.
 *
 * `ask()` opens the globally mounted `BaseKitConfirmModal` and returns a
 * promise resolving to `true` (confirmed) or `false` (cancelled or closed).
 * The resolver lives outside reactivity so exactly one answer goes back per
 * prompt.
 *
 * Used through the `useConfirm()` composable:
 *   const confirm = useConfirm()
 *   if (!(await confirm({ description: t('…'), color: 'error' }))) return
 */
export const useConfirmStore = defineStore('basekit:confirm', () => {
  const open = ref(false)
  const options = ref<BaseKitConfirmOptions>({})
  let resolver: ((value: boolean) => void) | null = null

  function ask(opts: BaseKitConfirmOptions = {}): Promise<boolean> {
    // A prompt still running is resolved as cancelled.
    resolver?.(false)
    options.value = opts
    open.value = true
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  /** Answer the prompt and close the dialog. */
  function settle(value: boolean): void {
    open.value = false
    resolver?.(value)
    resolver = null
  }

  return { open, options, ask, settle }
})
