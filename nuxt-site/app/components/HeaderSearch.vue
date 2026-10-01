<script setup lang="ts">
type SearchEntry = { title: string; description: string; text: string; tags: string[]; path: string }
const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const query = ref('')
const open = ref(false)
const loading = ref(false)
const failed = ref(false)
const index = shallowRef<SearchEntry[] | null>(null)
const route = useRoute()
const terms = computed(() => query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean))
const results = computed(() => {
  if (!terms.value.length) return []
  return (index.value || []).filter(entry => {
    const text = `${entry.title} ${entry.description} ${entry.text} ${entry.tags.join(' ')}`.toLocaleLowerCase()
    return terms.value.every(term => text.includes(term))
  })
})
async function show() {
  open.value = true
  if (index.value || loading.value) return
  loading.value = true
  failed.value = false
  try { index.value = (await import('~~/data/search-index.json')).default }
  catch { failed.value = true }
  finally { loading.value = false }
}
function dismiss() { open.value = false }
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) dismiss()
}
function shortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    input.value?.focus()
    void show()
  }
  if (event.key === 'Escape' && open.value) dismiss()
}
function firstResult(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    root.value?.querySelector<HTMLAnchorElement>('.header-search-result')?.focus()
  } else if (event.key === 'Enter' && results.value[0]) {
    event.preventDefault()
    navigateTo(results.value[0].path)
    dismiss()
  }
}
function focusSearch() { input.value?.focus(); void show() }
watch(() => route.fullPath, async () => {
  dismiss()
  if (route.query.search === '1') { await nextTick(); focusSearch() }
})
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('keydown', shortcut)
  if (route.query.search === '1') focusSearch()
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('keydown', shortcut)
})
</script>

<template>
  <div ref="root" class="header-search" @focusout="event => { if (!root?.contains(event.relatedTarget as Node)) dismiss() }">
    <div class="header-search-field">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
      <input ref="input" v-model="query" type="search" aria-label="搜索文章、项目和代码，快捷键 Ctrl 或 Command K" aria-controls="header-search-results" :aria-expanded="open" placeholder="搜索文章、项目和代码…" autocomplete="off" @focus="show" @input="show" @keydown="firstResult">
      <kbd aria-hidden="true">⌘ / Ctrl K</kbd>
    </div>
    <div v-show="open" id="header-search-results" class="header-search-dropdown" role="region" aria-label="站内搜索结果">
      <p v-if="loading" class="header-search-status" role="status">正在加载搜索…</p>
      <div v-else-if="failed" class="header-search-status" role="status">搜索加载失败。<button type="button" @click="show">重试</button></div>
      <template v-else-if="terms.length">
        <p class="header-search-status" role="status">找到 {{ results.length }} 条结果</p>
        <ul class="header-search-list">
          <li v-for="entry in results" :key="entry.path"><NuxtLink :to="entry.path" class="header-search-result" @click="dismiss"><strong>{{ entry.title }}</strong><span>{{ entry.description }}</span></NuxtLink></li>
        </ul>
        <p v-if="!results.length" class="header-search-status">没有找到相关内容，试试更短的关键词。</p>
      </template>
      <p v-else class="header-search-status">搜索标题与完整正文，例如：混合检索、MCP、缓存。</p>
    </div>
  </div>
</template>
