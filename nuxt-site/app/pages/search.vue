<script setup lang="ts">
useSeoMeta({ title: '站内搜索', robots: 'noindex' })
// Keep old bookmarks working without maintaining a separate search interface.
onMounted(() => navigateTo('/?search=1', { replace: true }))
</script>
<template>
  <section class="page-section">
    <h1>正在打开站内搜索…</h1>
    <p>搜索已移到顶部中间。<NuxtLink to="/?search=1">前往首页搜索 →</NuxtLink></p>
  </section>
</template>
