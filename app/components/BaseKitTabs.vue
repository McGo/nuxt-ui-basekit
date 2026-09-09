<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'

/**
 * Tab-Gruppierung — Pattern, um auf einer Seite mehrere Bereiche (z.B.
 * Einstellungs-Gruppen) zu gliedern, gerade bei vielen Feldern.
 *
 * Generisch: pro Tab ein benannter Slot (= dessen `key`). Aktiver Tab optional
 * über `v-model` steuerbar, sonst der erste.
 *
 *   <BaseKitTabs :items="[
 *     { key: 'general', label: 'Allgemein', icon: 'i-lucide-settings' },
 *     { key: 'access',  label: 'Zugriff',   icon: 'i-lucide-lock' },
 *   ]">
 *     <template #general> … </template>
 *     <template #access>  … </template>
 *   </BaseKitTabs>
 *
 * Deep-Linking: mit `hash-nav` ist der aktive Tab über den URL-Hash adressierbar
 * (`…/seite#access`). Beim Laden gewinnt ein passender Hash; ein Tab-Wechsel
 * schreibt den Hash via `router.replace` (kein History-Spam). Bei mehreren
 * Tab-Gruppen auf einer Seite nur EINE mit `hash-nav` betreiben.
 *
 * Der Hash greift bewusst erst `onMounted`: der Server sieht ihn gar nicht
 * (Browser schicken ihn nicht mit), und ein davon abweichender erster Render
 * im Client zerlegt die Hydration — dann stand die Markierung auf dem einen
 * Tab und der Inhalt kam vom anderen. Aus demselben Grund läuft er über
 * `select()`, damit ein gebundenes `v-model` den Tab aus dem Hash mitbekommt.
 *
 * A11y: tablist/tab/tabpanel-Rollen, Pfeiltasten links/rechts wechseln.
 *
 * Layout-Konvention: die Tab-Leiste NICHT in eine `UCard` wrappen — Tabs +
 * Inhalt liegen direkt auf der Seite. Feinere Struktur je Tab-Inhalt (Gruppen,
 * Fieldset, einzelne Cards) nach Bedarf INNERHALB des jeweiligen Slots.
 */
const props = withDefaults(defineProps<{
  /** Tab-Definitionen (Reihenfolge = Anzeigereihenfolge). */
  items: Array<{ key: string, label: string, icon?: string }>
  /** Aktiver Tab-Key (v-model). Ohne Bindung wird der erste Tab aktiv. */
  modelValue?: string
  /** Aktiven Tab über den URL-Hash adressierbar machen (`#<key>`). */
  hashNav?: boolean
}>(), {
  modelValue: undefined,
  hashNav: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const route = useRoute()
const router = useRouter()

/** Gültiger Tab-Key aus dem aktuellen URL-Hash, sonst null. */
function keyFromHash(): string | null {
  if (!props.hashNav) return null
  const key = String(route.hash ?? '').replace(/^#/, '')
  return props.items.some(i => i.key === key) ? key : null
}

const active = ref<string>(props.modelValue ?? props.items[0]?.key ?? '')

/** Hat der Nutzer selbst gewählt? Dann gewinnt seine Wahl über den Hash. */
const picked = ref(false)

// Hash erst im Client anwenden — siehe Kommentar oben.
onMounted(() => applyHash())

// v-model rein: Auswahl von außen übernehmen.
watch(() => props.modelValue, (next) => {
  if (next !== undefined && next !== active.value) active.value = next
})

// Hash ändert sich (Direktlink, Zurück/Vorwärts) → passenden Tab aktivieren.
watch(() => route.hash, () => {
  const key = keyFromHash()
  if (key !== null && key !== active.value) active.value = key
})

// Items wechseln. Zwei Fälle: der Tab aus dem Hash taucht erst jetzt auf
// (rechte-abhängige Tabs kommen mit dem Bootstrap nach) — dann übernehmen,
// solange der Nutzer nicht selbst gewählt hat. Sonst: fällt der aktive Tab
// weg, zurück auf den ersten.
watch(() => props.items, (items) => {
  if (!picked.value && applyHash()) return
  if (!items.some(i => i.key === active.value)) active.value = items[0]?.key ?? ''
})

/**
 * Tab aus dem Hash übernehmen, falls er zu einem Item passt und nicht schon
 * aktiv ist. Zählt nicht als Nutzer-Wahl. Liefert `true`, wenn gewechselt
 * wurde.
 */
function applyHash(): boolean {
  const key = keyFromHash()
  if (key === null || key === active.value) return false
  active.value = key
  emit('update:modelValue', key)
  return true
}

function select(key: string): void {
  picked.value = true
  active.value = key
  emit('update:modelValue', key)

  if (props.hashNav && String(route.hash ?? '').replace(/^#/, '') !== key) {
    router.replace({ hash: `#${key}` })
  }
}

const activeIndex = computed(() => props.items.findIndex(i => i.key === active.value))

function onKey(e: KeyboardEvent): void {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  e.preventDefault()
  const len = props.items.length
  if (len === 0) return
  const dir = e.key === 'ArrowRight' ? 1 : -1
  const next = (activeIndex.value + dir + len) % len
  select(props.items[next]!.key)
}
</script>

<template>
  <div class="basekit-tabs">
    <div
      role="tablist"
      class="flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-800"
      @keydown="onKey"
    >
      <button
        v-for="item in items"
        :id="`basekit-tab-${item.key}`"
        :key="item.key"
        type="button"
        role="tab"
        :aria-selected="item.key === active"
        :tabindex="item.key === active ? 0 : -1"
        class="-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors"
        :class="item.key === active
          ? 'border-primary-500 text-primary-700 dark:text-primary-300'
          : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
        @click="select(item.key)"
      >
        <UIcon v-if="item.icon" :name="item.icon" class="size-4" />
        {{ item.label }}
      </button>
    </div>

    <div
      role="tabpanel"
      :aria-labelledby="`basekit-tab-${active}`"
      class="pt-4"
    >
      <slot :name="active" />
    </div>
  </div>
</template>
