<script setup lang="ts">
const route = useRoute()
const { articles, projectChapters, tagPath } = useSiteInventory()
const all = [...articles, ...projectChapters]
const tag = computed(() => all.flatMap(entry => entry.tags).find(tag => decodeURIComponent(tagPath(tag)).replace(/\/$/, '') === decodeURIComponent(route.path).replace(/\/$/, '')))
if (!tag.value) throw createError({ statusCode: 404, statusMessage: '标签不存在' })
const results = computed(() => all.filter(entry => entry.tags.includes(tag.value || '')))
useSeoMeta({ title: () => `${tag.value} · 标签`, description: () => `${tag.value} 相关技术笔记与项目章节。` })
</script>
<template><section class="page-section"><p class="eyebrow"><NuxtLink to="/tags/">全部标签</NuxtLink></p><h1>{{ tag }}</h1><p class="result-count">共 {{ results.length }} 篇记录</p><div class="entry-list"><NuxtLink v-for="entry in results" :key="entry.path" :to="entry.path" class="entry-row"><div><h2>{{ entry.title }}</h2><p>{{ entry.description }}</p></div><span aria-hidden="true">→</span></NuxtLink></div></section></template>
