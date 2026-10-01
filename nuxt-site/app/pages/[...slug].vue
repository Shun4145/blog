<script setup lang="ts">
import type { NotesCollectionItem } from '@nuxt/content'
import SectionOverview from '~/components/SectionOverview.vue'
import AllPosts from '~/components/AllPosts.vue'
import ProjectsOverview from '~/components/ProjectsOverview.vue'
import '~/assets/css/reading.css'

const route = useRoute()
definePageMeta({ key: route => route.path })
const { entries, articles, projectChapters, contentUrl, tagPath } = useSiteInventory()
function normalize(path: string) {
  try { return decodeURIComponent(path).replace(/\/+$/, '') || '/' }
  catch { throw createError({ statusCode: 404, statusMessage: '页面不存在' }) }
}
const normalized = computed(() => normalize(route.path))
const { data: note, error, status } = await useAsyncData(
  () => `note:${normalized.value}`,
  async () => {
    const document = await queryCollection('notes').path(normalized.value).first()
    if (!document || document.draft) throw createError({ statusCode: 404, statusMessage: '页面不存在' })
    return document
  },
)
if (error.value || !note.value) throw createError({ statusCode: 404, statusMessage: '页面不存在' })
watch([error, status], ([failure, state]) => {
  if (failure || (state === 'success' && !note.value)) {
    showError(createError({ statusCode: 404, statusMessage: '页面不存在' }))
  }
})
provide('reading-note', note)
const document = computed(() => note.value as NotesCollectionItem)
const components = { 'section-overview': SectionOverview, 'all-posts': AllPosts, 'projects-overview': ProjectsOverview, projects: ProjectsOverview }
const sectionTitles: Record<string, string> = { projects: '项目', agent: 'Agent 技术笔记', rag: 'RAG 技术笔记' }
const parentPath = computed(() => normalized.value.slice(0, normalized.value.lastIndexOf('/')) || '/')
const breadcrumbs = computed(() => {
  const parts = normalized.value.split('/').filter(Boolean)
  return parts.slice(0, -1).map((part, index) => {
    const path = `/${parts.slice(0, index + 1).join('/')}`
    const entry = entries.find(item => normalize(item.path) === path)
    return { path: contentUrl(entry?.path || path), title: entry?.title || sectionTitles[part] || part }
  })
})
const siblings = computed(() => {
  const pool = document.value.kind === 'project-chapter' ? projectChapters : document.value.kind === 'article' ? articles : []
  return pool.filter(entry => normalize(entry.path).slice(0, normalize(entry.path).lastIndexOf('/')) === parentPath.value)
    .sort((a, b) => (a.source || a.path).localeCompare(b.source || b.path, 'zh-CN', { numeric: true }))
})
const position = computed(() => siblings.value.findIndex(entry => normalize(entry.path) === normalized.value))
const previous = computed(() => position.value > 0 ? siblings.value[position.value - 1] : undefined)
const next = computed(() => position.value >= 0 ? siblings.value[position.value + 1] : undefined)
type TocLink = { id: string; text: string; depth: number; children?: TocLink[] }
function flattenToc(links: TocLink[]): TocLink[] {
  return links.flatMap(link => [...(link.depth >= 2 && link.depth <= 3 ? [link] : []), ...flattenToc(link.children || [])])
}
const toc = computed(() => document.value.toc === false ? [] : flattenToc(document.value.body?.toc?.links || []))
const projectIndex = computed(() => document.value.kind === 'page' && /^\/projects\/[^/]+$/.test(normalized.value)
  && !JSON.stringify(document.value.body).includes('section-overview'))
const isArticle = computed(() => ['article', 'project-chapter'].includes(document.value.kind))
useSeoMeta({
  title: () => document.value.title,
  description: () => document.value.description || '',
  ogType: () => isArticle.value ? 'article' : 'website',
  articlePublishedTime: () => isArticle.value ? document.value.date || undefined : undefined,
  articleModifiedTime: () => isArticle.value ? document.value.lastmod || document.value.date || undefined : undefined,
})
</script>

<template>
  <div class="reading-page">
    <nav class="reading-breadcrumbs" aria-label="面包屑">
      <NuxtLink to="/">首页</NuxtLink>
      <template v-for="crumb in breadcrumbs" :key="crumb.path">
        <span aria-hidden="true">/</span><NuxtLink :to="crumb.path">{{ crumb.title }}</NuxtLink>
      </template>
      <span aria-hidden="true">/</span><span aria-current="page">{{ document.title }}</span>
    </nav>
    <div class="reading-layout">
      <article class="reading-article">
        <header class="reading-header">
          <p class="reading-kicker">{{ document.kind === 'project-chapter' ? '项目记录' : document.kind === 'article' ? '技术笔记' : '阅读索引' }}</p>
          <h1>{{ document.title }}</h1>
          <p v-if="document.description" class="reading-description">{{ document.description }}</p>
          <div v-if="document.date || document.lastmod" class="reading-meta">
            <span v-if="document.date">发布于 <time :datetime="document.date">{{ document.date.slice(0, 10) }}</time></span>
            <span v-if="document.lastmod && document.lastmod !== document.date">更新于 <time :datetime="document.lastmod">{{ document.lastmod.slice(0, 10) }}</time></span>
          </div>
          <ul v-if="document.tags?.length" class="reading-tags" aria-label="文章标签">
            <li v-for="tag in document.tags" :key="tag"><NuxtLink :to="tagPath(tag)">{{ tag }}</NuxtLink></li>
          </ul>
        </header>
        <details v-if="toc.length" class="reading-mobile-toc">
          <summary>本文目录 · {{ toc.length }} 节</summary>
          <nav aria-label="本文目录（移动端）"><ul class="reading-toc-list">
            <li v-for="link in toc" :key="link.id" :class="{ 'reading-toc-sub': link.depth === 3 }"><a :href="`#${encodeURIComponent(link.id)}`">{{ link.text }}</a></li>
          </ul></nav>
        </details>
        <ContentRenderer :value="document" :components="components" class="prose reading-prose" />
        <SectionOverview v-if="projectIndex" :metadata="document" />
        <nav v-if="previous || next" class="reading-pagination" aria-label="章节导航">
          <NuxtLink v-if="previous" :to="contentUrl(previous.path)"><span>← 上一篇</span><strong>{{ previous.title }}</strong></NuxtLink>
          <NuxtLink v-if="next" :to="contentUrl(next.path)" class="reading-next"><span>下一篇 →</span><strong>{{ next.title }}</strong></NuxtLink>
        </nav>
      </article>
      <aside v-if="toc.length" class="reading-desktop-toc">
        <nav aria-label="本文目录"><p class="reading-kicker">本文目录</p><ul class="reading-toc-list">
          <li v-for="link in toc" :key="link.id" :class="{ 'reading-toc-sub': link.depth === 3 }"><a :href="`#${encodeURIComponent(link.id)}`">{{ link.text }}</a></li>
        </ul></nav>
      </aside>
    </div>
  </div>
</template>
