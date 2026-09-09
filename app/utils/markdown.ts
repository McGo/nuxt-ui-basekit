import MarkdownIt from 'markdown-it'

/**
 * Markdown → HTML für den Text-Block (`richtext`-Widget, jetzt Markdown).
 *
 * Bewusst `html: false`: roher HTML im Markdown wird NICHT durchgereicht — das
 * schließt die wichtigste XSS-Lücke ohne separaten Sanitizer (markdown-it
 * blockt zudem `javascript:`-Links per Default-`validateLink`). `linkify` macht
 * nackte URLs klickbar, `typographer` glättet Anführungszeichen/Bindestriche.
 *
 * Geteilt zwischen Anzeige und Editor-Vorschau, damit
 * Bearbeiten und Ausgabe identisch aussehen.
 */
const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
})

export function renderMarkdown(source?: string | null): string {
  if (!source) return ''
  return md.render(String(source))
}
