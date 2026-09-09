import { useConfirmStore } from '../stores/confirm'
import type { BaseKitConfirmOptions } from '../stores/confirm'

/**
 * A confirmation prompt in place of the native `window.confirm`.
 *
 * Opens the globally mounted `BaseKitConfirmModal` and returns a promise that
 * resolves to `true` or `false`.
 *
 *   const confirm = useConfirm()
 *   if (!(await confirm({ description: t('…'), color: 'error', confirmLabel: t('common.delete') }))) return
 */
export function useConfirm(): (opts?: BaseKitConfirmOptions) => Promise<boolean> {
  const store = useConfirmStore()
  return (opts?: BaseKitConfirmOptions) => store.ask(opts)
}
