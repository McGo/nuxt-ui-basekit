/**
 * Vitest setup.
 *
 * Replaces Nuxt's virtual `#imports` with mocks so the components run without
 * booting Nuxt. As `vi.fn()` rather than fixed functions: the tabs tests set
 * route and router per case through `mockReturnValueOnce` to exercise the
 * URL-fragment behaviour.
 *
 * Deliberately narrow — BaseKit only takes `useRoute` and `useRouter` from
 * there. What the package does not use is not here either.
 */
import { vi } from 'vitest'
import { ref } from 'vue'

const states = new Map<string, ReturnType<typeof ref>>()

vi.mock('#imports', () => ({
  useRoute: vi.fn(() => ({ path: '/', params: {}, query: {}, hash: '' })),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  useState: vi.fn((key: string, init?: () => unknown) => {
    if (!states.has(key)) states.set(key, ref(init ? init() : null))
    return states.get(key)!
  }),
}))
