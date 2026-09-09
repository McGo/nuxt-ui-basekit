<script setup lang="ts">
/**
 * Every component on one page — the source of the screenshots in COMPONENTS.md.
 *
 * Each block carries a `data-shot` with the component name. `scripts/shots.py`
 * looks for exactly that and shoots every block on its own, light and dark.
 * Adding a component means adding a block here; the screenshot follows without
 * further work.
 *
 * The sample data is made up but not arbitrary: it should show what the
 * component is for. A table full of `foo` and `bar` explains nothing to
 * anybody.
 */
import type { BaseKitDataColumn } from 'nuxt-ui-basekit/app/components/BaseKitDataTable.vue'

const icon = ref('i-lucide-book-open')
const record = ref<number | null>(2)
const markdown = ref('Ships **twice a week**. See the [changelog](https://example.com) for details.')
const tab = ref('overview')

const columns: BaseKitDataColumn[] = [
  { key: 'title', label: 'Page', sortable: true },
  { key: 'section', label: 'Section', sortable: true },
  { key: 'views', label: 'Views', sortable: true, align: 'right' },
]

const rows = [
  { id: 1, title: 'Imprint', section: 'Legal', views: 1284 },
  { id: 2, title: 'Opening hours', section: 'Visit', views: 8931 },
  { id: 3, title: 'Membership', section: 'Join', views: 4417 },
  { id: 4, title: 'Privacy', section: 'Legal', views: 963 },
]

const recordItems = [
  { value: 1, label: 'Imprint', type: 'Page', hint: 'Page/imprint', editHref: '/pages/1' },
  { value: 2, label: 'Opening hours', type: 'Page', hint: 'Page/hours', editHref: '/pages/2' },
  { value: 3, label: 'Join', type: 'Section', hint: 'Section/join', editHref: '/sections/3' },
]

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'i-lucide-layout-dashboard' },
  { key: 'members', label: 'Members', icon: 'i-lucide-users' },
  { key: 'billing', label: 'Billing', icon: 'i-lucide-receipt' },
]

const barItems = [
  { key: 'search', label: 'Search', value: 4821 },
  { key: 'direct', label: 'Direct', value: 3140 },
  { key: 'social', label: 'Social', value: 1755 },
  { key: 'mail', label: 'Newsletter', value: 902 },
  { key: 'ref', label: 'Referral', value: 388 },
]

const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const series = [
  { key: 'new', label: 'New', points: [42, 55, 61, 48, 72, 30, 25] },
  { key: 'returning', label: 'Returning', points: [28, 31, 40, 37, 45, 22, 18] },
]

const slices = [
  { key: 'pages', label: 'Pages', value: 148 },
  { key: 'posts', label: 'Posts', value: 92 },
  { key: 'files', label: 'Files', value: 61 },
  { key: 'forms', label: 'Forms', value: 24 },
]

const confirm = useConfirm()
async function askSomething(): Promise<void> {
  await confirm({
    description: 'The page and all of its revisions will be removed.',
    color: 'error',
    confirmLabel: 'Delete page',
  })
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-10 p-10">
    <div data-shot="BaseKitTabs" class="shot">
      <BaseKitTabs v-model="tab" :items="tabs">
        <template #overview>
          <p class="text-sm text-muted">
            Three sections, one URL. The active pane renders in the matching slot.
          </p>
        </template>
        <template #members>
          <p class="text-sm text-muted">
            Members pane.
          </p>
        </template>
        <template #billing>
          <p class="text-sm text-muted">
            Billing pane.
          </p>
        </template>
      </BaseKitTabs>
    </div>

    <div data-shot="BaseKitSettingRow" class="shot">
      <BaseKitSettingRow
        title="Public listing"
        description="Show this page in the site-wide index and in search results."
      >
        <USwitch :model-value="true" />
      </BaseKitSettingRow>
    </div>

    <div data-shot="BaseKitEmptyState" class="shot">
      <BaseKitEmptyState
        title="No pages yet"
        description="Create your first page to see it listed here."
        icon="i-lucide-file-text"
      />
    </div>

    <div data-shot="BaseKitChoiceCard" class="shot max-w-sm">
      <BaseKitChoiceCard
        title="Two columns"
        description="Wide content next to a narrow sidebar."
        :active="true"
      />
    </div>

    <div data-shot="BaseKitPending" class="shot">
      <BaseKitPending label="Loading pages" size="inline" />
    </div>

    <div data-shot="BaseKitDataTable" class="shot">
      <BaseKitDataTable
        :columns="columns"
        :rows="rows"
        :page-size="10"
        create-label="New page"
      />
    </div>

    <div data-shot="BaseKitStatTile" class="shot grid grid-cols-3 gap-4">
      <BaseKitStatTile label="Pages" :value="148" icon="i-lucide-file-text" />
      <BaseKitStatTile label="Drafts" :value="12" hint="not public" icon="i-lucide-pencil" />
      <BaseKitStatTile label="Broken links" :value="3" tone="alert" icon="i-lucide-unlink" />
    </div>

    <div data-shot="BaseKitRecordPicker" class="shot max-w-sm">
      <BaseKitRecordPicker v-model="record" :items="recordItems" title="Link target" />
    </div>

    <div data-shot="BaseKitIconPicker" class="shot max-w-sm">
      <BaseKitIconPicker v-model="icon" />
    </div>

    <div data-shot="BaseKitFileUpload" class="shot max-w-sm">
      <BaseKitFileUpload accept="image/*" label="Drop an image or choose a file" />
    </div>

    <div data-shot="BaseKitBackLink" class="shot">
      <BaseKitBackLink to="/" />
    </div>

    <div data-shot="BaseKitViewLink" class="shot">
      <BaseKitViewLink to="https://example.com" />
    </div>

    <div data-shot="BaseKitConfirmModal-trigger" class="shot">
      <UButton color="error" icon="i-lucide-trash-2" @click="askSomething">
        Delete page
      </UButton>
    </div>

    <div data-shot="BaseKitMarkdownEditor" class="shot">
      <BaseKitMarkdownEditor v-model="markdown" />
    </div>

    <div data-shot="BaseKitChartFigure" class="shot">
      <BaseKitChartFigure title="Traffic by source" subtitle="Last 30 days">
        <BaseKitChartBars :items="barItems" />
      </BaseKitChartFigure>
    </div>

    <div data-shot="BaseKitChartBars" class="shot">
      <BaseKitChartBars :items="barItems" />
    </div>

    <div data-shot="BaseKitChartColumns" class="shot">
      <BaseKitChartColumns :categories="categories" :series="series" :height="200" />
    </div>

    <div data-shot="BaseKitChartDonut" class="shot max-w-sm">
      <BaseKitChartDonut :slices="slices" center-label="Items" />
    </div>

    <div data-shot="BaseKitChartMeter" class="shot max-w-sm">
      <BaseKitChartMeter :value="148" :total="200" label="Storage used" hint="of 200 GB" />
    </div>
  </div>
</template>

<style>
/* Shot areas get a ground of their own. An element screenshot without a
   background comes out transparent and then looks accidental on GitHub,
   depending on the theme. */
.shot {
  background: var(--ui-bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
}
</style>
