/**
 * Word-level difference between two texts.
 *
 * Tokens are words and the whitespace between them, so that the joined parts
 * reproduce both texts exactly: `same` + `removed` is the old text, `same` +
 * `added` the new one. Line breaks are whitespace tokens and survive, which
 * keeps paragraphs apart when the result is rendered with `pre-wrap`.
 *
 * The comparison is a longest common subsequence over tokens. That is
 * quadratic in the number of tokens, which is fine for the texts a person
 * reads side by side — a title, an excerpt, the paragraphs of an article. For
 * longer input it gives up on the fine grain and reports the whole text as
 * replaced rather than blocking the page.
 */
export type WordDiffPart = { type: 'same' | 'added' | 'removed', text: string }

const MAX_TOKENS = 4000

export function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? []
}

export function wordDiff(before: string, after: string): WordDiffPart[] {
  if (before === after) return before === '' ? [] : [{ type: 'same', text: before }]

  const a = tokenize(before)
  const b = tokenize(after)

  if (a.length * b.length > MAX_TOKENS * MAX_TOKENS / 4) {
    return merge([
      ...(before ? [{ type: 'removed' as const, text: before }] : []),
      ...(after ? [{ type: 'added' as const, text: after }] : []),
    ])
  }

  // lcs[i][j]: length of the common subsequence of a[i..] and b[j..].
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!)
    }
  }

  const parts: WordDiffPart[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      parts.push({ type: 'same', text: a[i]! })
      i++
      j++
    }
    else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      parts.push({ type: 'removed', text: a[i]! })
      i++
    }
    else {
      parts.push({ type: 'added', text: b[j]! })
      j++
    }
  }
  while (i < a.length) parts.push({ type: 'removed', text: a[i++]! })
  while (j < b.length) parts.push({ type: 'added', text: b[j++]! })

  return merge(parts)
}

/** Adjacent parts of the same type become one. */
function merge(parts: WordDiffPart[]): WordDiffPart[] {
  const out: WordDiffPart[] = []
  for (const part of parts) {
    const last = out[out.length - 1]
    if (last && last.type === part.type) last.text += part.text
    else out.push({ ...part })
  }
  return out
}
