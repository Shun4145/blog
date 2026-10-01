<script setup lang="ts">
const { data: page } = await useAsyncData('about', () => queryCollection('notes').path('/about').first())
if (!page.value) throw createError({ statusCode: 404, statusMessage: '关于页面不存在' })
useSeoMeta({ title: page.value.title, description: page.value.description })
</script>

<template>
  <section class="page-section about-page">
    <p class="eyebrow">关于我</p><h1>{{ page?.title }}</h1>
    <ContentRenderer v-if="page" :value="page" class="prose" />
  </section>
</template>
