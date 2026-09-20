import MarkdownIt from 'markdown-it'

/**
 * Markdown to HTML.
 *
 * `html: true`, and that needs a word. Markdown legitimately carries HTML:
 * turndown passes through what has no Markdown equivalent — a `<br>` inside a
 * link text, for one — and so does any import from an HTML-based editor.
 * Masking it here did not make such content safe, it made it unreadable: the
 * tags showed up as literal text, and the next edit wrote that text back as
 * Markdown. The damage was permanent.
 *
 * **Sanitising belongs to whoever stores the text, not to whoever renders
 * it.** A consumer that keeps user input must clean it on write; then what
 * arrives here is already reduced to harmless markup. Rendering it is then the
 * honest thing to do — while masking only hides that the cleaning happened.
 *
 * `linkify` makes bare URLs clickable, `typographer` smooths quotes and
 * dashes. Shared between display and editor preview, so that editing and
 * output look the same.
 */
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
})

export function renderMarkdown(source?: string | null): string {
  if (!source) return ''
  return md.render(String(source))
}
