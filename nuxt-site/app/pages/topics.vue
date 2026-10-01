<script setup lang="ts">
const { articles, legacyContentUrl } = useSiteInventory()
const topics = [
  { key: 'agent', name: 'Agent', description: '从工具调用、MCP 到多智能体协作。', path: '/agent/' },
  { key: 'rag', name: 'RAG', description: '从知识入库、检索到生成与效果评估。', path: '/rag/' },
]
useSeoMeta({ title: '专题', description: '围绕一个问题持续积累的技术笔记与学习路线。' })
</script>

<template>
  <section class="page-section">
    <p class="eyebrow">持续积累</p><h1>沿着问题，深入一点。</h1>
    <p class="page-intro">把相关笔记串成路线，方便从头阅读，也方便回来查找。</p>
    <div class="topic-grid">
      <a v-for="topic in topics" :key="topic.key" :href="legacyContentUrl(topic.path)" class="topic-panel">
        <span class="entry-category">{{ articles.filter(article => article.section === topic.key).length }} 篇笔记</span>
        <h2>{{ topic.name }}</h2><p>{{ topic.description }}</p><span>查看专题 ↗</span>
      </a>
    </div>
  </section>
</template>
