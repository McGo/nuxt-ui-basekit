/**
 * Stand-in for Nuxt's virtual `#imports` under Vitest.
 *
 * BaseKit only takes `useRoute` and `useRouter` from there — the tabs address
 * the active tab through the URL fragment. The package needs no more than
 * that, so no more than that is here.
 *
 * A test that wants particular router behaviour mocks the module itself.
 */
import { ref, type Ref } from 'vue'

export function useRoute(): { path: string, params: Record<string, unknown>, query: Record<string, unknown>, hash: string } {
  return { path: '/', params: {}, query: {}, hash: '' }
}

export function useRouter(): { replace: (to: unknown) => void, push: (to: unknown) => void } {
  return { replace: () => {}, push: () => {} }
}

export function useState<T>(_key: string, init?: () => T): Ref<T | null> {
  return ref<T | null>(init ? init() : null) as Ref<T | null>
}
