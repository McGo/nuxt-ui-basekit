import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../app/utils/markdown'

/**
 * These cases exist because the renderer switched from `html: false` to
 * `html: true`, and that is exactly the kind of decision someone reverses a
 * year later without knowing why it was made. The reasoning is in
 * `markdown.ts`; what it means in practice is here.
 */
describe('renderMarkdown', () => {
  it('renders ordinary Markdown', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>')
    expect(renderMarkdown('- one\n- two')).toContain('<li>one</li>')
  })

  it('returns an empty string for nothing', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown(null)).toBe('')
    expect(renderMarkdown(undefined)).toBe('')
  })

  it('passes embedded HTML through instead of escaping it', () => {
    // The case that started this: turndown leaves a `<br>` inside a link text
    // alone, because Markdown has no way to express it there. Escaping turned
    // it into visible text, and the next edit stored that text for good.
    expect(renderMarkdown('[label<br>](https://example.test)')).toContain('<br>')
    expect(renderMarkdown('a <br> b')).not.toContain('&lt;br&gt;')
  })

  it('still refuses a javascript: target in a Markdown link', () => {
    // markdown-it's own `validateLink`, unaffected by `html`. It does not
    // strip the text — it declines to build a link at all, so the source stays
    // visible as plain text. What matters is that no anchor carries the
    // target.
    const out = renderMarkdown('[x](javascript:alert(1))')

    expect(out).not.toContain('<a')
    expect(out).not.toContain('href')
  })

  /**
   * The counterpart, and the reason the consumer has to sanitise on write:
   * inside raw HTML, markdown-it validates nothing. Whoever stores the text
   * must have removed this before it ever reaches the renderer — in Metis that
   * is the `SanitizedMarkdown` / `SanitizedComposition` cast, plus
   * `metis:sanitize-content` for rows written before those existed.
   *
   * The test asserts the gap on purpose. If it ever starts failing because
   * markdown-it filters raw HTML too, that is worth knowing rather than
   * quietly relying on.
   */
  it('does NOT filter raw HTML — sanitising belongs to whoever stores it', () => {
    const out = renderMarkdown('<a href="javascript:alert(1)">x</a>')

    expect(out).toContain('javascript:')
  })

  it('makes bare URLs clickable and smooths typography', () => {
    expect(renderMarkdown('https://example.test')).toContain('<a href="https://example.test"')
    expect(renderMarkdown('"quoted"')).toContain('“quoted”')
  })
})
