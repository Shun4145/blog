<script setup lang="ts">
const { entries, projectChapters, legacyContentUrl } = useSiteInventory()
const project = entries.find(entry => entry.source === 'content/projects/rag-knowledge-base/_index.md')
useSeoMeta({ title: '项目', description: '真实问题、技术方案与工程实践的项目记录。' })
</script>

<template>
  <section class="page-section">
    <p class="eyebrow">项目与复盘</p><h1>把想法做成可用的东西。</h1>
    <p class="page-intro">记录从架构设计到工程落地的选择、实现与复盘。</p>
    <article class="project-panel">
      <span class="entry-category">RAG / Python / LangChain</span>
      <h2>{{ project?.title || '企业内部知识问答助手' }}</h2>
      <p>{{ project?.description || '覆盖知识入库、混合检索、重排、缓存与质量评测的项目实践。' }}</p>
      <a :href="legacyContentUrl(project?.path || '/projects/rag-knowledge-base/')" class="text-link">阅读项目记录 ↗</a>
      <div class="chapter-list">
        <a v-for="chapter in projectChapters" :key="chapter.path" :href="legacyContentUrl(chapter.path)">{{ chapter.title }} <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  </section>
</template>
