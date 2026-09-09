/**
 * Vitest-Setup.
 *
 * Ersetzt Nuxts virtuelles `#imports` durch Mocks, damit die Komponenten ohne
 * Nuxt-Boot laufen. Als `vi.fn()`, nicht als feste Funktionen: die Tests der
 * Reiter setzen Route und Router je Fall (`mockReturnValueOnce`), um das
 * Verhalten am URL-Hash zu prüfen.
 *
 * Absichtlich schmal — BaseKit holt sich von dort nur `useRoute` und
 * `useRouter`. Was das Paket nicht benutzt, steht hier auch nicht.
 */
import { vi } from 'vitest'
import { ref } from 'vue'

const zustaende = new Map<string, ReturnType<typeof ref>>()

vi.mock('#imports', () => ({
  useRoute: vi.fn(() => ({ path: '/', params: {}, query: {}, hash: '' })),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  useState: vi.fn((key: string, init?: () => unknown) => {
    if (!zustaende.has(key)) zustaende.set(key, ref(init ? init() : null))
    return zustaende.get(key)!
  }),
}))
