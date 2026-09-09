/**
 * HTML → Markdown (turndown). Zwei Einsätze, beide nur im Admin/Editor — daher
 * bewusst getrennt von `markdown.ts` (das im öffentlichen Widget-Bundle steckt
 * und turndown nicht mitziehen soll):
 *   - Tiptap speichert HTML → hier nach Markdown serialisieren.
 *   - Legacy-Text-Blöcke mit rohem `config.html` einmalig nach Markdown wandeln.
 *
 * **turndown wird bewusst erst beim ersten Aufruf geladen.** Das Paket ist
 * CommonJS; ein Import auf Modulebene landet im Server-Bundle und wirft dort
 * beim Rendern „require is not defined in ES module scope". Der Editor läuft
 * ohnehin nur im Browser — auf dem Server wird die Funktion nie aufgerufen.
 */
type Turndown = { turndown: (html: string) => string }

let instance: Turndown | null = null

function service(): Turndown | null {
  if (instance) return instance
  if (import.meta.server) return null

  // Synchroner Zugriff auf ein bereits geladenes Modul: der Editor ruft
  // `prepare()` beim Einhängen auf, bevor gespeichert werden kann.
  return instance
}

/**
 * Lädt turndown im Browser vor. Die Editor-Komponenten rufen das beim
 * Einhängen auf, damit {@link htmlToMarkdown} danach synchron bleiben kann.
 */
export async function prepareHtmlToMarkdown(): Promise<void> {
  if (instance || import.meta.server) return
  const { default: TurndownService } = await import('turndown')
  instance = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  }) as Turndown
}

export function htmlToMarkdown(html?: string | null): string {
  if (!html) return ''
  const td = service()
  // Ohne geladenes turndown (Server, oder prepare() vergessen) lieber das
  // Original zurückgeben als eine Ausnahme zu werfen — der Text ginge sonst
  // beim Speichern verloren.
  return td ? td.turndown(String(html)).trim() : String(html)
}
