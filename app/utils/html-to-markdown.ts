/**
 * HTML to Markdown, through turndown. Kept apart from `markdown.ts` on
 * purpose: that one may end up in a public bundle and should not drag turndown
 * along, while this one is only ever needed where something is edited.
 *
 * **turndown is loaded lazily, and that is deliberate.** The package is
 * CommonJS; an import at module level lands in the server bundle and throws
 * "require is not defined in ES module scope" while rendering. The editor runs
 * in the browser anyway — on the server this function is never called.
 */
type Turndown = { turndown: (html: string) => string }

let instance: Turndown | null = null

function service(): Turndown | null {
  if (instance) return instance
  if (import.meta.server) return null

  // Synchronous access to an already loaded module: the editor calls
  // `prepare()` on mount, well before anything can be saved.
  return instance
}

/**
 * Preloads turndown in the browser. The editor components call this on mount
 * so {@link htmlToMarkdown} can stay synchronous afterwards.
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
  // Without turndown loaded — on the server, or when prepare() was forgotten
  // — return the original rather than throwing: the text would otherwise be
  // lost on save.
  return td ? td.turndown(String(html)).trim() : String(html)
}
