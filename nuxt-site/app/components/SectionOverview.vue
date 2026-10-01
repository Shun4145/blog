<script setup lang="ts">
import type { Ref } from 'vue'
import '~/assets/css/reading.css'

type Metadata = { path?: string; section?: string; planned?: string[] }
const props = defineProps<{ section?: string; path?: string; planned?: string[]; metadata?: Metadata }>()
const route = useRoute()
const inherited = inject<Ref<Metadata | null>>('reading-note', ref(null))
const { entries, contentUrl } = useSiteInventory()
const metadata = computed(() => props.metadata || inherited.value || {})
const path = computed(() => decodeURIComponent(props.path || (props.section ? `/${props.section}` : metadata.value.path || route.path)).replace(/\/+$/, '') || '/')
const section = computed(() => props.section || metadata.value.section || path.value.split('/')[1])
const visible = computed(() => entries.filter(entry => {
  const entryPath = decodeURIComponent(entry.path).replace(/\/+$/, '') || '/'
  return entry.kind !== 'page' && entry.section === section.value && entryPath.startsWith(`${path.value}/`)
}).sort((a, b) => (a.source || a.path).localeCompare(b.source || b.path, 'zh-CN', { numeric: true })))
const planned = computed(() => props.planned || metadata.value.planned || [])
</script>

<template>
  <section class="reading-index" aria-label="章节索引">
    <h2>按顺序阅读</h2>
    <ol class="reading-entry-list">
      <li v-for="entry in visible" :key="entry.path">
        <NuxtLink :to="contentUrl(entry.path)"><span><strong>{{ entry.title }}</strong><span v-if="entry.description" class="reading-entry-description">{{ entry.description }}</span></span><span class="reading-entry-arrow" aria-hidden="true">→</span></NuxtLink>
      </li>
    </ol>
    <p v-if="!visible.length" class="reading-empty">本专题暂无已发布章节。</p>
    <div v-if="planned.length" class="reading-planned"><h3>后续计划</h3><ul><li v-for="item in planned" :key="item">{{ item }}</li></ul></div>
  </section>
</template>
