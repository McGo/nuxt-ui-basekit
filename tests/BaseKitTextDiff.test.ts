import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseKitTextDiff from '../app/components/BaseKitTextDiff.vue'
import { wordDiff } from '../app/utils/word-diff'

describe('wordDiff', () => {
  it('reproduces both texts from its parts', () => {
    const before = 'The camp starts on Monday.\n\nBring shoes.'
    const after = 'The training camp starts on Tuesday.\n\nBring shoes.'
    const parts = wordDiff(before, after)

    expect(parts.filter(p => p.type !== 'added').map(p => p.text).join('')).toBe(before)
    expect(parts.filter(p => p.type !== 'removed').map(p => p.text).join('')).toBe(after)
    expect(parts.filter(p => p.type === 'removed').map(p => p.text.trim())).toContain('Monday.')
    expect(parts.filter(p => p.type === 'added').map(p => p.text.trim())).toContain('Tuesday.')
  })

  it('reports nothing for two empty texts and one part for equal ones', () => {
    expect(wordDiff('', '')).toEqual([])
    expect(wordDiff('Same', 'Same')).toEqual([{ type: 'same', text: 'Same' }])
  })

  it('treats a text that appears from nothing as added', () => {
    expect(wordDiff('', 'New')).toEqual([{ type: 'added', text: 'New' }])
    expect(wordDiff('Old', '')).toEqual([{ type: 'removed', text: 'Old' }])
  })
})

describe('BaseKitTextDiff', () => {
  it('marks removed and added words with del and ins', () => {
    const w = mount(BaseKitTextDiff, { props: { before: 'red apple', after: 'green apple' } })

    expect(w.find('del').text()).toBe('red')
    expect(w.find('ins').text()).toBe('green')
    expect(w.text()).toContain('apple')
  })
})
