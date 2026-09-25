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

// BaseKitSectionTabs: a customer record with sections and sub-sections.
const sections = [
  { key: 'overview', label: 'Overview', icon: 'i-lucide-layout-dashboard', children: [{ key: 'overview', label: 'Overview' }] },
  {
    key: 'work', label: 'Work & time', icon: 'i-lucide-list-checks', children: [
      { key: 'tasks', label: 'Tasks', badge: 4 },
      { key: 'time', label: 'Time' },
    ],
  },
  { key: 'communication', label: 'Communication', icon: 'i-lucide-messages-square', children: [{ key: 'notes', label: 'Notes' }, { key: 'mail', label: 'Mail' }] },
  { key: 'documents', label: 'Documents', icon: 'i-lucide-file-text', children: [{ key: 'documents', label: 'Documents' }] },
  { key: 'finance', label: 'Finance', icon: 'i-lucide-receipt', children: [{ key: 'invoices', label: 'Invoices' }, { key: 'costs', label: 'Costs' }] },
]

// The section tabs read the address. Open a section with sub-sections, so the
// screenshot shows both rows.
const route = useRoute()
const router = useRouter()
onMounted(() => {
  if (!route.query.section) router.replace({ query: { section: 'work', sub: 'tasks' } })
})

// BaseKitScopeBreadcrumb: customer › project › epic, siblings on demand.
const scope = [
  {
    key: 'acme', label: 'Harbour Books Ltd', to: '/', kind: 'customer', icon: 'i-lucide-building-2',
    siblings: () => [
      { key: 'acme', label: 'Harbour Books Ltd', to: '/', icon: 'i-lucide-building-2' },
      { key: 'mill', label: 'Old Mill Bakery', to: '/', icon: 'i-lucide-building-2' },
      { key: 'fern', label: 'Fern & Stone Gardens', to: '/', icon: 'i-lucide-building-2' },
    ],
  },
  {
    key: 'shop', label: 'Online shop', prefix: '007', to: '/', kind: 'project', icon: 'i-lucide-folder-kanban',
    siblings: () => [
      { key: 'shop', label: '007 Online shop', to: '/' },
      { key: 'pos', label: '008 Till system', to: '/' },
    ],
  },
  { key: 'checkout', label: 'Checkout', to: '/', kind: 'epic', siblings: () => [{ key: 'checkout', label: 'Checkout', to: '/' }, { key: 'import', label: 'Product import', to: '/' }] },
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
    <div data-shot="BaseKitPageBar" class="shot">
      <BaseKitPageBar title="Administrator" feedback="Saved a moment ago" @action="() => {}">
        <template #actions>
          <BaseKitBackLink to="/roles" />
        </template>
      </BaseKitPageBar>
      <div class="space-y-3 pt-4 text-sm text-muted">
        <p>A long form scrolls underneath — the bar and its answer stay put.</p>
        <p>Title on the left, actions and Save on the right, every time.</p>
        <p>Without an <code>@action</code> listener the button is left out — a
          list that only lists has no Save to show.</p>
      </div>
    </div>

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

    <div data-shot="BaseKitSectionTabs" class="shot">
      <BaseKitSectionTabs :items="sections" bar-class="border border-default rounded-md bg-default">
        <template #default="{ section, sub }">
          <p class="text-sm text-muted">
            Section <code>{{ section }}</code>, sub-section <code>{{ sub }}</code> — both in the address.
          </p>
        </template>
      </BaseKitSectionTabs>
    </div>

    <div data-shot="BaseKitScopeBreadcrumb" class="shot">
      <BaseKitScopeBreadcrumb :levels="scope" :marker="{ icon: 'i-lucide-flag' }">
        <template #after>
          <UBadge label="Active" color="success" variant="subtle" />
        </template>
      </BaseKitScopeBreadcrumb>
    </div>

    <div data-shot="BaseKitSettingRow" class="shot">
      <BaseKitSettingRow
        title="Public listing"
        description="Show this page in the site-wide index and in search results."
      >
        <USwitch :model-value="true" />
      </BaseKitSettingRow>
    </div>

    <div data-shot="BaseKitFormSection" class="shot">
      <BaseKitFormSection
        title="Who may start topics?"
        description="Empty means everyone who can see the section. Otherwise limited to the roles, users or groups picked below."
      >
        <UFormField label="Users" help="Named people, regardless of role.">
          <USelectMenu :items="[]" placeholder="Pick users …" class="w-full" />
        </UFormField>
        <UFormField label="Roles">
          <USelectMenu :items="[]" placeholder="Pick roles …" class="w-full" />
        </UFormField>
      </BaseKitFormSection>
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

    <div data-shot="BaseKitChartLegend" class="shot">
      <BaseKitChartLegend :items="series.map(s => ({ key: s.key, label: s.label }))" />
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
