<script setup lang="ts">
import { NuxtLink } from '#components'

/**
 * The row of tabs along the bottom edge of a phone screen.
 *
 *  ┌──────────────────────────────────────────┐
 *  │                                          │
 *  │               page content               │
 *  │                                          │
 *  ├──────────────────────────────────────────┤
 *  │   ⌂        ▦        ✉ ²       ☰          │
 *  │  Home    Events   Inbox     More         │
 *  └──────────────────────────────────────────┘
 *          ↑ safe-area inset below the row
 *
 * On a phone the sidebar is gone and the menu hides behind a button in the
 * top corner — the one place a thumb does not reach. A tab bar puts the few
 * destinations people actually move between where the thumb already is, and
 * keeps them there on every page. That is most of what makes a web app feel
 * like an app.
 *
 * Three to five entries. Fewer and the row is a waste of height, more and the
 * labels stop fitting. Everything beyond that goes behind the last tab, which
 * then opens the full menu: give it no `to` and handle `select`.
 *
 * The component draws the row and nothing else. Where it sits is the
 * caller's decision: as the last child of a full-height flex column (a
 * dashboard panel), or with `class="fixed inset-x-0 bottom-0"` in a document
 * that scrolls — in which case the page needs matching bottom padding.
 *
 * Which tab is active is also the caller's decision. The component cannot
 * know whether `/` means "exactly the start page" or "everything", and a
 * guess that lights up two tabs at once is worse than none.
 *
 * The bottom padding uses `env(safe-area-inset-bottom)` so the labels clear
 * the home indicator on iPhones. That value is only non-zero when the page
 * declares `viewport-fit=cover` in its viewport meta.
 *
 * Usage:
 *
 *   <BaseKitTabBar
 *     :items="[
 *       { key: 'home', label: 'Home', icon: 'i-lucide-house', to: '/', active: route.path === '/' },
 *       { key: 'inbox', label: 'Inbox', icon: 'i-lucide-inbox', to: '/inbox', badge: 2 },
 *       { key: 'more', label: 'More', icon: 'i-lucide-menu' },
 *     ]"
 *     @select="key => key === 'more' && (menuOpen = true)"
 *   />
 */
export interface BaseKitTabBarItem {
  key: string
  label: string
  icon: string
  /** Route or URL. Without it the tab is a button and reports `select`. */
  to?: string
  /** Opens `to` in a new tab, outside the router. */
  external?: boolean
  active?: boolean
  /** Count or short text on the icon. Empty, `0` and `null` show nothing. */
  badge?: string | number | null
}

defineProps<{
  items: BaseKitTabBarItem[]
  /** Accessible name of the navigation landmark. */
  label?: string
}>()

const emit = defineEmits<{ select: [key: string] }>()

function showsBadge(badge: BaseKitTabBarItem['badge']): boolean {
  return badge !== undefined && badge !== null && badge !== '' && badge !== 0
}
</script>

<template>
  <nav class="basekit-tab-bar" :aria-label="label" data-test="tab-bar">
    <template v-for="item in items" :key="item.key">
      <component
        :is="item.to ? (item.external ? 'a' : NuxtLink) : 'button'"
        v-bind="item.to
          ? (item.external ? { href: item.to, target: '_blank', rel: 'noopener' } : { to: item.to })
          : { type: 'button' }"
        class="basekit-tab-bar-item"
        :data-active="item.active ? '' : undefined"
        :aria-current="item.active ? 'page' : undefined"
        :data-test="`tab-${item.key}`"
        @click="!item.to && emit('select', item.key)"
      >
        <span class="basekit-tab-bar-icon">
          <UIcon :name="item.icon" class="size-6" />
          <span v-if="showsBadge(item.badge)" class="basekit-tab-bar-badge" data-test="tab-badge">
            {{ item.badge }}
          </span>
        </span>
        <span class="basekit-tab-bar-label">{{ item.label }}</span>
      </component>
    </template>
  </nav>
</template>

<style scoped>
/*
 * Inside `@layer components` on purpose. The caller places the bar with
 * utilities — `lg:hidden`, `fixed inset-x-0 bottom-0` — and Tailwind puts
 * those in `@layer utilities`. Unlayered CSS beats every layer, so without
 * this wrapper `display: flex` below would win over `lg:hidden` and the bar
 * would show on desktops as well.
 */
@layer components {
  .basekit-tab-bar {
    display: flex;
    align-items: stretch;
    border-top: 1px solid var(--ui-border);
    background: var(--basekit-tab-bar-background, var(--ui-bg));
    padding-bottom: env(safe-area-inset-bottom);
  }

  .basekit-tab-bar-item {
    display: flex;
    flex: 1 1 0;
    min-width: 0;
    min-height: 3.5rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    color: var(--ui-text-muted);
    /* No grey flash on tap in iOS WebViews — the active colour is the feedback. */
    -webkit-tap-highlight-color: transparent;
  }

  .basekit-tab-bar-item[data-active] {
    color: var(--basekit-tab-bar-active, var(--ui-primary));
  }

  .basekit-tab-bar-icon {
    position: relative;
    display: inline-flex;
  }

  .basekit-tab-bar-badge {
    position: absolute;
    top: -0.25rem;
    left: 100%;
    margin-left: -0.5rem;
    min-width: 1.125rem;
    height: 1.125rem;
    padding: 0 0.3rem;
    border-radius: 999px;
    background: var(--ui-error);
    color: #fff;
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.125rem;
    text-align: center;
  }

  .basekit-tab-bar-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.6875rem;
    font-weight: 500;
  }
}
</style>
