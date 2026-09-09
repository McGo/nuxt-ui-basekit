import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * What this package is not allowed to do.
 *
 * BaseKit was carved out of an application, and the cut only holds as long as
 * nobody sews it shut again. There are three kinds of relapse, and all three
 * surface only in somebody else's project, where something renders empty or
 * fails to build at all:
 *
 * 1. an import of something that exists only in the application of origin,
 * 2. a translation key instead of a label from `useBaseKit()`,
 * 3. a CSS variable that a foreign application sets.
 *
 * Allowed are npm packages, the Nuxt aliases `#imports` and `#components`, and
 * relative paths inside the package.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = 'app'

function sourceFiles(): string[] {
  const found: string[] = []

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) { walk(path); continue }
      if (/\.(vue|ts)$/.test(entry)) found.push(relative(ROOT, path))
    }
  }

  walk(join(ROOT, SOURCE))
  return found.sort()
}

const FILES = sourceFiles()

function imports(content: string): string[] {
  return [...content.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map(m => m[1]!)
}

/** Comment lines explain the rules and must not trip them. */
function code(file: string): string[] {
  return readFileSync(join(ROOT, file), 'utf8')
    .split('\n')
    .filter(line => !/^\s*(\*|\/\/|\/\*)/.test(line))
}

describe('BaseKit stands on its own', () => {
  it('finds any files at all', () => {
    expect(FILES.length).toBeGreaterThan(20)
  })

  it('reaches only into its own package with relative paths', () => {
    const offences: string[] = []

    for (const file of FILES) {
      for (const spec of imports(readFileSync(join(ROOT, file), 'utf8'))) {
        if (!spec.startsWith('.')) continue

        const target = relative(ROOT, resolve(dirname(join(ROOT, file)), spec))
        if (target.startsWith('..') || !target.startsWith(SOURCE + '/')) {
          offences.push(`${file} → ${spec}`)
        }
      }
    }

    expect(offences).toEqual([])
  })

  it('depends only on packages listed in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    const allowed = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      'vue',
      '#imports',
      '#components',
    ])

    const missing = new Set<string>()
    for (const file of FILES) {
      for (const spec of imports(readFileSync(join(ROOT, file), 'utf8'))) {
        if (spec.startsWith('.') || spec.startsWith('node:')) continue
        // Sub-paths like `@tiptap/extension-link` count towards the package itself.
        const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]!
        if (!allowed.has(name) && !allowed.has(spec)) missing.add(`${file} → ${spec}`)
      }
    }

    expect([...missing]).toEqual([])
  })

  it('never calls vue-i18n — labels arrive through useBaseKit()', () => {
    const offences = FILES.filter((file) => {
      const lines = code(file).join('\n')
      return imports(lines).includes('vue-i18n') || /\buseI18n\s*\(/.test(lines)
    })

    expect(offences).toEqual([])
  })

  it('carries no translation keys in its source', () => {
    const offences: string[] = []

    for (const file of FILES) {
      for (const line of code(file)) {
        const hit = line.match(/\bt\(\s*['"][a-z][a-z_]*\.[a-z_.]+['"]/)
        if (hit) offences.push(`${file}: ${hit[0]}`)
      }
    }

    expect(offences).toEqual([])
  })

  it('uses only --basekit-* as its own CSS tokens', () => {
    const offences: string[] = []
    // Real custom properties only: read once (`var(--x)`), set once (`--x:`).
    // A BEM modifier like `.basekit-upload--drag` is neither and must not
    // trip this.
    const read = /var\(\s*(--[a-z][a-z0-9-]*)/g
    const written = /(?:^|[;{\s])(--[a-z][a-z0-9-]*)\s*:/gm
    const own = (name: string) => name.startsWith('--basekit-') || name.startsWith('--ui-')

    for (const file of FILES) {
      const content = readFileSync(join(ROOT, file), 'utf8')
      for (const regex of [read, written]) {
        for (const hit of content.matchAll(regex)) {
          if (!own(hit[1]!)) offences.push(`${file}: ${hit[1]}`)
        }
      }
    }

    expect(offences).toEqual([])
  })

  it('names every component with the BaseKit prefix', () => {
    const wrong = FILES
      .filter(f => f.startsWith('app/components/') && f.endsWith('.vue'))
      .filter(f => !/\/BaseKit[A-Z]\w*(\.global)?\.vue$/.test(f))

    expect(wrong).toEqual([])
  })
})
