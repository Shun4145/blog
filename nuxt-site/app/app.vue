<script setup lang="ts">
const navigation = [
  { to: '/', label: '首页' },
  { to: '/articles/', label: '文章' },
  { to: '/topics/', label: '专题' },
  { to: '/projects/', label: '项目' },
  { to: '/about/', label: '关于' },
]
const route = useRoute()
const config = useRuntimeConfig()
const canonical = computed(() => new URL(route.path, config.public.siteUrl).href)
useHead(() => ({ link: [{ rel: 'canonical', href: canonical.value }, { rel: 'alternate', type: 'application/rss+xml', title: 'Shun RSS', href: '/index.xml' }] }))
useSeoMeta({ ogUrl: () => canonical.value, ogType: 'website', ogSiteName: 'Shun', ogImage: () => new URL('/images/og-default.png', config.public.siteUrl).href, twitterCard: 'summary_large_image' })
</script>

<template>
  <a class="skip-link" href="#main-content">跳至内容</a>
  <header class="site-header">
    <div class="site-container site-header-inner">
      <NuxtLink to="/" class="site-brand" aria-label="Shun 首页">
        <img class="site-brand-logo site-brand-logo-light" src="/images/logo-g.svg" width="32" height="32" alt="">
        <img class="site-brand-logo site-brand-logo-dark" src="/images/logo-g-dark.svg" width="32" height="32" alt="">
        Shun
      </NuxtLink>
      <HeaderSearch />
      <nav class="site-nav" aria-label="主导航">
        <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to" :exact-active-class="'is-active'">{{ item.label }}</NuxtLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
  <main id="main-content" class="site-container" tabindex="-1"><NuxtPage /></main>
  <ReadingTools />
  <footer class="site-footer">
    <div class="site-container site-footer-inner">
      <span>© {{ new Date().getFullYear() }} Shun · AI 应用 / 软件工程 / 个人实践</span>
      <a href="https://github.com/Shun4145" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </div>
  </footer>
</template>
