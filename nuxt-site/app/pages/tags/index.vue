<script setup lang="ts">
const { articles, projectChapters, tagPath } = useSiteInventory()
const tags = [...new Set([...articles, ...projectChapters].flatMap(entry => entry.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
useSeoMeta({ title: '标签', description: '按主题标签阅读技术文章与项目实践。' })
</script>
<template><section class="page-section"><p class="eyebrow">主题标签</p><h1>沿着兴趣阅读。</h1><div class="tag-list"><NuxtLink v-for="tag in tags" :key="tag" :to="tagPath(tag)">{{ tag }}</NuxtLink></div></section></template>
