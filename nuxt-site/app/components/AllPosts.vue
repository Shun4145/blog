<script setup lang="ts">
import type { Ref } from 'vue'
import '~/assets/css/reading.css'

type Metadata = { section?: string; planned?: string[] }
const props = defineProps<{ section?: string; metadata?: Metadata; planned?: string[] }>()
const inherited = inject<Ref<Metadata | null>>('reading-note', ref(null))
const { entries, articles, projectChapters, contentUrl } = useSiteInventory()
const posts = [...articles, ...projectChapters]
const selected = ref('')
const sections = computed(() => [...new Set(posts.map(entry => entry.section))])
const section = computed(() => props.section || (props.metadata || inherited.value)?.section)
const visible = computed(() => posts.filter(entry => (!section.value || !sections.value.includes(section.value) || entry.section === section.value) && (!selected.value || entry.section === selected.value))
  .sort((a, b) => (b.lastmod || b.date || '').localeCompare(a.lastmod || a.date || '') || (a.source || a.path).localeCompare(b.source || b.path, 'zh-CN', { numeric: true })))
const groups = computed(() => {
  const result: { path: string; title: string; posts: typeof posts }[] = []
  const articles = visible.value.filter(entry => entry.kind === 'article')
  if (articles.length) result.push({ path: 'articles', title: '文章', posts: articles })
  for (const entry of visible.value.filter(entry => entry.kind === 'project-chapter')) {
    const path = decodeURIComponent(entry.path).replace(/\/+$/, '').split('/').slice(0, -1).join('/')
    let group = result.find(item => item.path === path)
    if (!group) {
      const project = entries.find(item => decodeURIComponent(item.path).replace(/\/+$/, '') === path)
      group = { path, title: project?.title || '项目章节', posts: [] }
      result.push(group)
    }
    group.posts.push(entry)
  }
  for (const group of result.filter(item => item.path !== 'articles')) {
    group.posts.sort((a, b) => (a.source || a.path).localeCompare(b.source || b.path, 'zh-CN', { numeric: true }))
  }
  return result
})
const planned = computed(() => props.planned || (props.metadata || inherited.value)?.planned || [])
</script>

<template>
  <section class="reading-index" aria-label="全部文章">
    <fieldset v-if="sections.length > 1 && !sections.includes(section || '')" class="reading-filters"><legend>按专题筛选</legend>
      <label><input v-model="selected" type="radio" value="">全部</label>
      <label v-for="item in sections" :key="item"><input v-model="selected" type="radio" :value="item">{{ item.toUpperCase() }}</label>
    </fieldset>
    <p class="reading-meta" aria-live="polite">共 {{ visible.length }} 篇文章与项目章节</p>
    <section v-for="group in groups" :key="group.path" class="reading-post-group">
      <h2>{{ group.title }}</h2>
      <ul class="reading-entry-list">
        <li v-for="entry in group.posts" :key="entry.path"><NuxtLink :to="contentUrl(entry.path)"><span><span class="reading-entry-meta">{{ entry.section.toUpperCase() }}<time v-if="entry.lastmod || entry.date" :datetime="entry.lastmod || entry.date || undefined"> · {{ (entry.lastmod || entry.date)?.slice(0, 10) }}</time></span><strong>{{ entry.title }}</strong><span v-if="entry.description" class="reading-entry-description">{{ entry.description }}</span></span><span class="reading-entry-arrow" aria-hidden="true">→</span></NuxtLink></li>
      </ul>
    </section>
    <p v-if="!visible.length" class="reading-empty">此专题暂无已发布文章或项目章节。</p>
    <div v-if="planned.length" class="reading-planned"><h3>后续计划</h3><ul><li v-for="item in planned" :key="item">{{ item }}</li></ul></div>
  </section>
</template>
