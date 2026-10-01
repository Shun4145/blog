<script setup lang="ts">
const { articles, projectChapters, legacyContentUrl } = useSiteInventory()
const selected = ref('all')
const visible = computed(() => [...articles, ...projectChapters]
  .filter(article => selected.value === 'all' || article.section === selected.value)
  .sort((a, b) => (b.lastmod || b.date || '').localeCompare(a.lastmod || a.date || '')))
useSeoMeta({ title: '文章', description: 'AI 应用、软件工程与学习实践的文章索引。' })
</script>

<template>
  <section class="page-section">
    <p class="eyebrow">文章索引</p>
    <h1>把探索写下来。</h1>
    <p class="page-intro">从 AI 应用开始，记录构建软件的过程、遇到的问题与解决方法。</p>
    <fieldset class="article-filters">
      <legend>按专题筛选</legend>
      <label v-for="filter in [{ value: 'all', label: '全部' }, { value: 'agent', label: 'Agent' }, { value: 'rag', label: 'RAG' }, { value: 'projects', label: '项目记录' }]" :key="filter.value">
        <input v-model="selected" type="radio" name="topic" :value="filter.value">{{ filter.label }}
      </label>
    </fieldset>
    <p class="result-count" aria-live="polite">共 {{ visible.length }} 篇文章</p>
    <div class="entry-list">
      <a v-for="article in visible" :key="article.path" :href="legacyContentUrl(article.path)" class="entry-row">
        <div><span class="entry-category">{{ article.section === 'agent' ? 'Agent' : article.section === 'rag' ? 'RAG' : '项目记录' }}</span><h2>{{ article.title }}</h2><p>{{ article.description }}</p></div>
        <span class="entry-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  </section>
</template>
