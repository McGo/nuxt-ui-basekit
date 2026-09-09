import MarkdownIt from 'markdown-it'

/**
 * Markdown to HTML.
 *
 * `html: false` on purpose: raw HTML inside the Markdown is NOT passed
 * through. That closes the biggest XSS hole without a separate sanitizer —
 * markdown-it also blocks `javascript:` links through its default
 * `validateLink`. `linkify` makes bare URLs clickable, `typographer` smooths
 * quotes and dashes.
 *
 * Shared between display and editor preview, so that editing and output look
 * the same.
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
