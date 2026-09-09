/**
 * Ersatz für Nuxts virtuelles `#imports` in Vitest.
 *
 * BaseKit holt sich von dort nur `useRoute` und `useRouter` — die Reiter
 * adressieren den aktiven Reiter über den URL-Hash. Mehr braucht das Paket
 * nicht, und mehr steht deshalb auch nicht hier.
 *
 * Ein Test, der ein bestimmtes Verhalten des Routers prüfen will, mockt das
 * Modul im Fall selbst.
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
