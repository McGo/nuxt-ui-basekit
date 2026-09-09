import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Was dieses Paket nicht darf.
 *
 * BaseKit ist aus einer Anwendung herausgeschnitten worden, und der Schnitt
 * hält nur, solange niemand ihn wieder zunäht. Drei Sorten Rückfall gibt es,
 * und alle drei fallen erst im fremden Projekt auf, wenn dort etwas leer
 * rendert oder gar nicht baut:
 *
 * 1. ein Import auf etwas, das nur in der Herkunfts-Anwendung existiert,
 * 2. ein Übersetzungsschlüssel statt einer Beschriftung aus `useBaseKit()`,
 * 3. eine CSS-Variable, die eine fremde Anwendung setzt.
 *
 * Erlaubt sind npm-Pakete, die Nuxt-Aliase `#imports` und `#components` und
 * relative Pfade innerhalb des Pakets.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const QUELLE = 'app'

function quelldateien(): string[] {
  const gefunden: string[] = []

  function lauf(dir: string): void {
    for (const eintrag of readdirSync(dir)) {
      const pfad = join(dir, eintrag)
      if (statSync(pfad).isDirectory()) { lauf(pfad); continue }
      if (/\.(vue|ts)$/.test(eintrag)) gefunden.push(relative(ROOT, pfad))
    }
  }

  lauf(join(ROOT, QUELLE))
  return gefunden.sort()
}

const DATEIEN = quelldateien()

function importe(inhalt: string): string[] {
  return [...inhalt.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map(m => m[1]!)
}

/** Kommentarzeilen erklären die Regeln und sollen sie nicht auslösen. */
function code(datei: string): string[] {
  return readFileSync(join(ROOT, datei), 'utf8')
    .split('\n')
    .filter(z => !/^\s*(\*|\/\/|\/\*)/.test(z))
}

describe('BaseKit steht für sich', () => {
  it('findet überhaupt Dateien', () => {
    expect(DATEIEN.length).toBeGreaterThan(20)
  })

  it('greift mit relativen Pfaden nur ins eigene Paket', () => {
    const verstoesse: string[] = []

    for (const datei of DATEIEN) {
      for (const spez of importe(readFileSync(join(ROOT, datei), 'utf8'))) {
        if (!spez.startsWith('.')) continue

        const ziel = relative(ROOT, resolve(dirname(join(ROOT, datei)), spez))
        if (ziel.startsWith('..') || !ziel.startsWith(QUELLE + '/')) {
          verstoesse.push(`${datei} → ${spez}`)
        }
      }
    }

    expect(verstoesse).toEqual([])
  })

  it('hängt nur an Paketen, die in der package.json stehen', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    const erlaubt = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      'vue',
      '#imports',
      '#components',
    ])

    const fehlend = new Set<string>()
    for (const datei of DATEIEN) {
      for (const spez of importe(readFileSync(join(ROOT, datei), 'utf8'))) {
        if (spez.startsWith('.') || spez.startsWith('node:')) continue
        // Unterpfade wie `@tiptap/extension-link` zählen zum Paket selbst.
        const paket = spez.startsWith('@') ? spez.split('/').slice(0, 2).join('/') : spez.split('/')[0]!
        if (!erlaubt.has(paket) && !erlaubt.has(spez)) fehlend.add(`${datei} → ${spez}`)
      }
    }

    expect([...fehlend]).toEqual([])
  })

  it('ruft kein vue-i18n auf — Beschriftungen kommen über useBaseKit()', () => {
    const verstoesse = DATEIEN.filter((datei) => {
      const zeilen = code(datei).join('\n')
      return importe(zeilen).includes('vue-i18n') || /\buseI18n\s*\(/.test(zeilen)
    })

    expect(verstoesse).toEqual([])
  })

  it('trägt keine Übersetzungsschlüssel im Quelltext', () => {
    const verstoesse: string[] = []

    for (const datei of DATEIEN) {
      for (const zeile of code(datei)) {
        const treffer = zeile.match(/\bt\(\s*['"][a-z][a-z_]*\.[a-z_.]+['"]/)
        if (treffer) verstoesse.push(`${datei}: ${treffer[0]}`)
      }
    }

    expect(verstoesse).toEqual([])
  })

  it('benutzt ausschließlich --basekit-* als eigene CSS-Token', () => {
    const verstoesse: string[] = []
    // Nur echte Custom Properties: einmal gelesen (`var(--x)`), einmal gesetzt
    // (`--x:`). Ein BEM-Modifier wie `.basekit-upload--drag` ist keins und
    // darf hier nicht anschlagen.
    const gelesen = /var\(\s*(--[a-z][a-z0-9-]*)/g
    const gesetzt = /(?:^|[;{\s])(--[a-z][a-z0-9-]*)\s*:/gm
    const eigen = (name: string) => name.startsWith('--basekit-') || name.startsWith('--ui-')

    for (const datei of DATEIEN) {
      const inhalt = readFileSync(join(ROOT, datei), 'utf8')
      for (const regex of [gelesen, gesetzt]) {
        for (const treffer of inhalt.matchAll(regex)) {
          if (!eigen(treffer[1]!)) verstoesse.push(`${datei}: ${treffer[1]}`)
        }
      }
    }

    expect(verstoesse).toEqual([])
  })

  it('benennt jede Komponente mit dem BaseKit-Präfix', () => {
    const falsch = DATEIEN
      .filter(d => d.startsWith('app/components/') && d.endsWith('.vue'))
      .filter(d => !/\/BaseKit[A-Z]\w*(\.global)?\.vue$/.test(d))

    expect(falsch).toEqual([])
  })
})
