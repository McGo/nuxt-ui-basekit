# nuxt-ui-basekit

Base components for Nuxt 4 on top of [Nuxt UI](https://ui.nuxt.com) — as a Nuxt
layer. Tables, tabs, charts, pickers, empty states: the parts that come up again
in every admin frontend and that Nuxt UI does not ship.

The package knows nothing about your application. It has no stores beyond the
one behind the confirmation dialog, no endpoints, no translation keys and no
colours that belong to a brand. Whatever it displays is handed in.

**[→ Every component with a screenshot](https://github.com/McGo/nuxt-ui-basekit/blob/main/COMPONENTS.md)**

## Install

```bash
npm i -D nuxt-ui-basekit
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['nuxt-ui-basekit'],
})
```

`@nuxt/ui`, `nuxt` and `pinia` are peers — they live in the consumer and are not
bundled along. The components are globally available afterwards, no import.

Nuxt UI itself still needs its stylesheet, the same as in any project that uses
it:

```css
/* app/assets/css/main.css, referenced from nuxt.config.ts */
@import "tailwindcss";
@import "@nuxt/ui";
```

## What is in it

| Group | Components |
|---|---|
| Structure | `BaseKitTabs` · `BaseKitSettingRow` · `BaseKitFormSection` · `BaseKitEmptyState` · `BaseKitChoiceCard` · `BaseKitPending` |
| Lists | `BaseKitDataTable` · `BaseKitStatTile` |
| Pickers | `BaseKitRecordPicker` · `BaseKitIconPicker` · `BaseKitFileUpload` |
| Navigation | `BaseKitBackLink` · `BaseKitViewLink` |
| Confirmation | `BaseKitConfirmModal` + `useConfirm()` |
| Text | `BaseKitMarkdownEditor` |
| Charts | `BaseKitChartBars` · `-Columns` · `-Donut` · `-Meter` · `-Figure` |

Each component carries its reasoning in the file header — what it does, when it
is the right choice and when it is not. [COMPONENTS.md](https://github.com/McGo/nuxt-ui-basekit/blob/main/COMPONENTS.md) has the
short version of each, with a screenshot.

## Labels and language

The components never call `vue-i18n` and know no translation keys. Left alone
they render English defaults; anyone with their own wording or several
languages hands them in through a plugin:

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

`locale` is a BCP-47 tag and drives `Intl` — thousands separators, percentages
and date formats in the charts follow it.

Two things that can cost an afternoon:

- **`useI18n()` does not belong in the plugin.** It requires a component setup
  context and throws `MUST_BE_CALL_SETUP_TOP` (error 26) there. Under server-side
  rendering that means a 500 on every page. Take the instance from
  `nuxtApp.$i18n`, and only when the `computed` is read — then plugin order
  stops mattering too.
- **Individual labels stay overridable as props.** The table above only decides
  what comes out when nothing is passed.

## Colours

The components only ever reach for `--basekit-*`. The defaults live in
`app/assets/css/basekit.css` and are loaded by the layer. A project with its own
theme puts its values on top, in its own stylesheet:

```css
:root {
  --basekit-accent: var(--my-brand-colour, #2563eb);
  --basekit-surface: var(--my-card-surface, #ffffff);
}
```

The five chart colours are validated as a set — lightness band, chroma and the
distance between neighbours, colour vision deficiency included. Override them as
a set rather than one at a time; if you have more than five series, group them
instead of inventing a sixth colour.

## Development

```bash
npm install
npx nuxi prepare     # writes .nuxt/tsconfig.json, without it the tests fail
npm test
npm run lint         # nuxi typecheck
```

`tests/grenze.test.ts` pins down what the package is not allowed to do: no
imports from outside the package, no dependency that is missing from
`package.json`, no `vue-i18n`, no translation keys, no foreign CSS variables.
That test is the reason the package could be carved out at all — without it the
separation would have closed up again by the third feature.

`playground/` is a small Nuxt app that pulls the layer in the way a consumer
would. It is the place to look at a component, and the source of the
screenshots in [COMPONENTS.md](https://github.com/McGo/nuxt-ui-basekit/blob/main/COMPONENTS.md):

```bash
cd playground && npm install && npm run dev
```

### Lockfile

Adding a dependency on macOS or Windows means pulling the lockfile through
Linux/x64 afterwards — otherwise the platform-specific optional packages
(`@emnapi/*` and relatives) are missing and `npm ci` fails in the workflow:

```bash
docker run --rm --platform linux/amd64 -v "$PWD:/app" -w /app \
  node:24 npm install --package-lock-only
```

The architecture matters: on Apple Silicon the container runs as arm64 without
`--platform`, and then exactly the x64 variants the runner needs are still
missing. Run `npm ci` locally afterwards to get your own binaries back.

## Releasing

Two workflows under `.github/workflows`. `pruefen` runs on `main` and on every
pull request and does `nuxi prepare`, `nuxi typecheck` and the tests.
`veroeffentlichen` hangs off a `vX.Y.Z` tag, checks again and publishes to
npmjs.com. There is no build step: the layer ships as raw source and Nuxt
compiles it in the consumer.

```bash
npm version patch        # bumps package.json and sets the tag
git push --follow-tags
```

The job compares the tag against the number in `package.json` and stops if they
disagree. Publishing runs over OIDC through npm's trusted publishing — no token
in the repository — and with `--provenance`, so npmjs records which commit the
package was built from.

## Origin

Grown inside an admin frontend and in use there for months before it became a
package of its own.

## License

MIT — see [LICENSE](LICENSE).
