import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Optionen für eine Bestätigungsabfrage. */
export interface BaseKitConfirmOptions {
  /** Titel des Dialogs (Default: `common.confirm.title`). */
  title?: string
  /** Erklärtext / Konsequenz — bei Destruktivem ausformulieren. */
  description?: string
  /** Beschriftung des Bestätigen-Buttons (Default: `common.confirm.confirm`). */
  confirmLabel?: string
  /** Beschriftung des Abbrechen-Buttons (Default: `common.cancel`). */
  cancelLabel?: string
  /** Farbe des Bestätigen-Buttons — `error` für destruktive Aktionen. */
  color?: 'error' | 'primary'
  /** Optionales Icon am Bestätigen-Button. */
  icon?: string
}

/**
 * Zentraler Bestätigungs-Store — ersetzt native `window.confirm`-Dialoge durch
 * eine gethemte, dark-mode-fähige Abfrage.
 *
 * `ask()` öffnet das global gemountete `BaseKitConfirmModal` und liefert ein
 * Promise, das mit `true` (bestätigt) oder `false` (abgebrochen/geschlossen)
 * auflöst. Der Resolver lebt außerhalb der Reaktivität, damit genau eine
 * Antwort pro Abfrage zurückgeht.
 *
 * Genutzt über das Composable `useConfirm()`:
 *   const confirm = useConfirm()
 *   if (!(await confirm({ description: t('…'), color: 'error' }))) return
 */
export const useConfirmStore = defineStore('basekit:confirm', () => {
  const open = ref(false)
  const options = ref<BaseKitConfirmOptions>({})
  let resolver: ((value: boolean) => void) | null = null

  function ask(opts: BaseKitConfirmOptions = {}): Promise<boolean> {
    // Läuft noch eine Abfrage, wird sie als abgebrochen aufgelöst.
    resolver?.(false)
    options.value = opts
    open.value = true
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  /** Abfrage beantworten und Dialog schließen. */
  function settle(value: boolean): void {
    open.value = false
    resolver?.(value)
    resolver = null
  }

  return { open, options, ask, settle }
})
