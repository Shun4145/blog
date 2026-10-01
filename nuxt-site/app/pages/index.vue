<script setup lang="ts">
const { entries, articles, legacyContentUrl } = useSiteInventory()
type Entry = (typeof entries)[number]
useSeoMeta({
  title: 'Shun · 技术与实践',
  description: 'Shun 的个人博客，记录 AI 应用、软件工程与个人实践。分享技术笔记与真实项目，把想法写清楚，把系统做扎实。',
  ogTitle: 'Shun · 技术与实践',
  ogDescription: '技术笔记、真实项目，以及解决问题的过程。',
})
const dateValue = (entry: Entry) => {
  const value = Date.parse(String(entry.lastmod || entry.date || ''))
  return Number.isFinite(value) ? value : 0
}
const recentArticles = [...articles].filter(entry => !entry.draft)
  .sort((a, b) => dateValue(b) - dateValue(a) || a.title.localeCompare(b.title, 'zh-CN')).slice(0, 4)
const project = entries.find(entry => !entry.draft && /\/projects\/rag-knowledge-base\/?$/.test(entry.path))
const topics = [
  { name: 'Agent', to: '/agent/', description: '从工具调用到智能体协作，理解协议与应用设计。' },
  { name: 'RAG', to: '/rag/', description: '从知识检索到答案评估，记录可靠问答的实现过程。' },
]
const displayDate = (entry: Entry) => dateValue(entry) ? new Date(dateValue(entry)).toISOString().slice(0, 10) : ''
</script>

<template>
  <article class="blog-home">
    <section class="blog-intro" aria-labelledby="home-title">
      <div>
        <p class="blog-label">技术笔记 · 项目实践 · 个人记录</p>
        <h1 id="home-title">你好，我是 <span>Shun</span>。</h1>
        <p class="blog-lead">一名大模型应用开发工程师。这里记录 AI 应用、软件工程与个人实践，分享解决问题的思路，也留下动手做事的过程。</p>
        <div class="blog-actions">
          <NuxtLink class="blog-button" to="/articles/">阅读文章 <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink class="text-link" to="/about/">关于我 <span aria-hidden="true">↗</span></NuxtLink>
        </div>
      </div>
      <p class="blog-motto">与概率同行，<br>为结果负责。<span>把想法写清楚，把系统做扎实。</span></p>
    </section>

    <section v-if="project" class="blog-section" aria-labelledby="project-title">
      <div class="blog-section-heading"><h2 id="project-title">精选项目</h2><NuxtLink class="text-link" to="/projects/">全部项目 <span aria-hidden="true">→</span></NuxtLink></div>
      <div class="blog-project">
        <a class="blog-project-preview" :href="legacyContentUrl(project.path)" :aria-label="`查看项目：${project.title}`">
          <img src="/images/rag-knowledge-base-screenshot.png" alt="企业内部知识问答助手界面：知识分类、问答与引用来源" width="2549" height="1403" decoding="async">
        </a>
        <div class="blog-project-copy">
          <p class="blog-label">AI 应用 / 工程实践</p>
          <h3><a :href="legacyContentUrl(project.path)">{{ project.title }}</a></h3>
          <p>围绕企业内部知识问答，记录从数据入库、混合检索到答案生成与质量评测的工程实践。</p>
          <ul class="blog-project-tags" aria-label="项目关注方向"><li>知识入库</li><li>混合检索</li><li>质量评测</li></ul>
          <a class="text-link" :href="legacyContentUrl(project.path)">查看项目与实现笔记 <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>

    <section class="blog-section" aria-labelledby="articles-title">
      <div class="blog-section-heading"><h2 id="articles-title">最新文章</h2><NuxtLink class="text-link" to="/articles/">全部文章 <span aria-hidden="true">→</span></NuxtLink></div>
      <div v-if="recentArticles.length" class="blog-articles">
        <article v-for="entry in recentArticles" :key="entry.path" class="blog-article">
          <div class="blog-article-meta"><span>{{ entry.tags?.[0] || entry.section || '技术笔记' }}</span><time v-if="displayDate(entry)" :datetime="displayDate(entry)">{{ displayDate(entry) }}</time></div>
          <h3><a :href="legacyContentUrl(entry.path)">{{ entry.title }}</a></h3>
          <p v-if="entry.description">{{ entry.description }}</p>
          <a class="blog-article-link" :href="legacyContentUrl(entry.path)" :aria-label="`阅读：${entry.title}`">阅读文章 <span aria-hidden="true">→</span></a>
        </article>
      </div>
      <p v-else class="blog-lead">新的技术笔记会在这里出现。</p>
    </section>

    <section class="blog-section blog-topics-panel" aria-labelledby="topics-title">
      <div class="blog-section-heading"><h2 id="topics-title">按专题阅读</h2><NuxtLink class="text-link" to="/topics/">全部专题 <span aria-hidden="true">→</span></NuxtLink></div>
      <div class="blog-topics">
        <NuxtLink v-for="topic in topics" :key="topic.to" :to="topic.to" class="blog-topic"><div><h3>{{ topic.name }}</h3><p>{{ topic.description }}</p></div><span aria-hidden="true">↗</span></NuxtLink>
      </div>
      <p class="blog-footnote">从 AI 应用出发，也记录软件工程与个人实践。不只关注工具，更关注问题如何被解决。</p>
    </section>
  </article>
</template>
