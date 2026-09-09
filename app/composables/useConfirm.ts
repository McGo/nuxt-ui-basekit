import { useConfirmStore } from '../stores/confirm'
import type { BaseKitConfirmOptions } from '../stores/confirm'

/**
 * Bestätigungsabfrage als Ersatz für natives `window.confirm`.
 *
 * Öffnet das global gemountete `BaseKitConfirmModal` und liefert ein Promise,
 * das mit `true`/`false` auflöst.
 *
 *   const confirm = useConfirm()
 *   if (!(await confirm({ description: t('…'), color: 'error', confirmLabel: t('common.delete') }))) return
 */
export function useConfirm(): (opts?: BaseKitConfirmOptions) => Promise<boolean> {
  const store = useConfirmStore()
  return (opts?: BaseKitConfirmOptions) => store.ask(opts)
}
