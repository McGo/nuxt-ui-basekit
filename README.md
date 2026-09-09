# nuxt-ui-basekit

Basis-Komponenten für Nuxt 4 auf [Nuxt UI](https://ui.nuxt.com) — als Nuxt-Layer.
Tabellen, Reiter, Diagramme, Auswahl-Dialoge, Leerzustände: die Bausteine, die
in jedem Verwaltungs-Frontend wieder anfallen und die Nuxt UI nicht mitbringt.

Das Paket kennt keine Anwendung. Es hat keine Stores außer einem für die
Rückfrage, keine Endpunkte, keine Übersetzungsschlüssel und keine Farben, die
zu einer Marke gehören. Was es anzeigt, bekommt es hereingereicht.

## Einbinden

```bash
npm i -D nuxt-ui-basekit
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['nuxt-ui-basekit'],
})
```

`@nuxt/ui`, `nuxt` und `pinia` sind Peers, sie stehen im Konsumenten und
werden nicht mitgeliefert. Die Komponenten sind danach global verfügbar, ohne
Import.

## Was drin ist

| Gruppe | Komponenten |
|---|---|
| Struktur | `BaseKitTabs` · `BaseKitSettingRow` · `BaseKitEmptyState` · `BaseKitChoiceCard` · `BaseKitPending` |
| Listen | `BaseKitDataTable` · `BaseKitStatTile` |
| Auswahl | `BaseKitRecordPicker` · `BaseKitIconPicker` · `BaseKitFileUpload` |
| Wege | `BaseKitBackLink` · `BaseKitViewLink` |
| Rückfrage | `BaseKitConfirmModal` + `useConfirm()` |
| Text | `BaseKitMarkdownEditor` |
| Diagramme | `BaseKitChartBars` · `-Columns` · `-Donut` · `-Meter` · `-Figure` |

Jede Komponente trägt ihre Erklärung im Kopf der Datei — was sie tut, wann sie
die richtige Wahl ist und wann nicht.

## Beschriftungen und Sprache

Die Komponenten rufen kein `vue-i18n` auf und kennen keine
Übersetzungsschlüssel. Ohne Zutun rendern sie deutsche Voreinstellungen; wer
eigene Texte oder mehrere Sprachen führt, reicht sie über ein Plugin herein:

```ts
// plugins/basekit.ts
import { computed } from 'vue'
import { baseKitKey, BASEKIT_DEFAULTS } from 'nuxt-ui-basekit/labels'

export default defineNuxtPlugin((nuxtApp) => {
  const config = computed(() => {
    const { t, locale } = nuxtApp.$i18n as Composer

    return {
      locale: locale.value,
      labels: { ...BASEKIT_DEFAULTS.labels, search: t('common.search') },
    }
  })

  nuxtApp.vueApp.provide(baseKitKey, config)
})
```

Zwei Dinge, die dabei Zeit kosten können:

- **`useI18n()` gehört nicht ins Plugin.** Es verlangt einen
  Komponenten-Setup-Kontext und wirft dort `MUST_BE_CALL_SETUP_TOP`
  (Fehlercode 26). Beim serverseitigen Rendern heißt das: 500 auf jeder Seite.
  Die Instanz kommt über `nuxtApp.$i18n`, und zwar erst beim Lesen des
  `computed` — dann ist auch die Plugin-Reihenfolge gleichgültig.
- **Einzelne Beschriftungen** bleiben als Prop überschreibbar. Die Tabelle
  trägt nur, was ohne Angabe herauskommt.

## Farben

Die Komponenten greifen ausschließlich auf `--basekit-*` zu. Die
Voreinstellungen stehen in `app/assets/css/basekit.css` und werden vom Layer
geladen. Ein Projekt mit eigenem Theme legt sie in seinem eigenen Stylesheet
darauf:

```css
:root {
  --basekit-accent: var(--meine-markenfarbe, #2563eb);
  --basekit-surface: var(--meine-kartenflaeche, #ffffff);
}
```

Die fünf Diagrammfarben sind als Satz geprüft — Lichtheitsband, Chroma und
Abstand zwischen Nachbarn, auch unter Farbfehlsichtigkeit. Wer sie
überschreibt, sollte das als Satz tun und nicht einzeln; wer mehr als fünf
Reihen hat, fasst zusammen, statt eine sechste Farbe zu erfinden.

## Entwickeln

```bash
npm install
npx nuxi prepare     # erzeugt .nuxt/tsconfig.json, sonst laufen die Tests nicht
npm test
npm run lint         # nuxi typecheck
```

`tests/grenze.test.ts` hält fest, was das Paket nicht darf: keine Importe
außerhalb des Pakets, keine Abhängigkeit, die nicht in der `package.json`
steht, kein `vue-i18n`, keine Übersetzungsschlüssel, keine fremden
CSS-Variablen. Der Test ist der Grund, warum sich das Paket überhaupt
herausschneiden ließ — ohne ihn wäre die Trennung nach dem dritten Feature
wieder zu.

## Veröffentlichen

Zwei Workflows unter `.github/workflows`. `pruefen` läuft auf `main` und in
jedem Pull Request und führt `nuxi prepare`, `nuxi typecheck` und die Tests
aus. `veroeffentlichen` hängt an einem Tag `vX.Y.Z`, prüft noch einmal und
schiebt das Paket dann nach npmjs.com. Ein Build-Schritt fehlt, weil der Layer
als Rohquelle ausgeliefert wird und Nuxt ihn im Konsumenten übersetzt.

Eine neue Fassung:

```bash
npm version patch        # hebt die package.json und setzt den Tag
git push --follow-tags
```

Der Job vergleicht den Tag mit der Zahl in der `package.json` und bricht ab,
wenn die beiden auseinanderlaufen. Veröffentlicht wird mit `--provenance`:
auf npmjs steht dann nachprüfbar, aus welchem Commit das Paket stammt.

Dafür braucht das Repo ein Secret `NPM_TOKEN` — ein Automation-Token aus dem
npm-Konto, einzutragen unter *Settings → Secrets and variables → Actions*.

## Herkunft

Entstanden in einem Verwaltungs-Frontend und dort über Monate in Gebrauch,
bevor es hier ein eigenes Paket wurde.

## Lizenz

MIT — siehe [LICENSE](LICENSE).
