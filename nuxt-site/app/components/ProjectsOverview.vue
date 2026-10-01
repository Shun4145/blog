<script setup lang="ts">
import type { Ref } from 'vue'
import '~/assets/css/reading.css'

type Metadata = { path?: string; planned?: string[] }
const props = defineProps<{ path?: string; metadata?: Metadata; planned?: string[] }>()
const inherited = inject<Ref<Metadata | null>>('reading-note', ref(null))
const route = useRoute()
const { entries, projectChapters, contentUrl } = useSiteInventory()
const metadata = computed(() => props.metadata || inherited.value || {})
const path = computed(() => decodeURIComponent(props.path || metadata.value.path || route.path).replace(/\/+$/, '') || '/projects')
const projects = computed(() => entries.filter(entry => {
  const candidate = decodeURIComponent(entry.path).replace(/\/+$/, '')
  return entry.kind === 'page' && entry.section === 'projects' && candidate.startsWith(`${path.value}/`) && !candidate.slice(path.value.length + 1).includes('/')
}).sort((a, b) => (a.weight ?? Infinity) - (b.weight ?? Infinity) || (a.source || a.path).localeCompare(b.source || b.path, 'zh-CN', { numeric: true })))
function chapters(path: string) {
  const prefix = `${decodeURIComponent(path).replace(/\/+$/, '')}/`
  return projectChapters.filter(entry => decodeURIComponent(entry.path).startsWith(prefix))
    .sort((a, b) => (a.source || a.path).localeCompare(b.source || b.path, 'zh-CN', { numeric: true }))
}
const planned = computed(() => props.planned || metadata.value.planned || [])
</script>

<template>
  <section class="reading-index reading-projects" aria-label="项目索引">
    <article v-for="project in projects" :key="project.path" class="reading-project">
      <h2><NuxtLink :to="contentUrl(project.path)">{{ project.title }}</NuxtLink></h2>
      <p v-if="project.description">{{ project.description }}</p>
      <NuxtLink :to="contentUrl(project.path)" class="reading-project-link">阅读项目概览 →</NuxtLink>
      <ol class="reading-entry-list"><li v-for="chapter in chapters(project.path)" :key="chapter.path"><NuxtLink :to="contentUrl(chapter.path)"><strong>{{ chapter.title }}</strong><span class="reading-entry-arrow" aria-hidden="true">→</span></NuxtLink></li></ol>
    </article>
    <p v-if="!projects.length" class="reading-empty">暂无已发布项目。</p>
    <div v-if="planned.length" class="reading-planned"><h3>后续计划</h3><ul><li v-for="item in planned" :key="item">{{ item }}</li></ul></div>
  </section>
</template>
