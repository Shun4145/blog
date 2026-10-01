import inventory from './data/content-inventory.json'
const tagRoutes = [...new Set(inventory.entries.filter(entry => !entry.draft).flatMap(entry => entry.tags))]
  .map(tag => `/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}/`)

export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  devtools: { enabled: false },
  modules: ['@nuxt/content'],
  css: ['~/assets/css/main.css', '~/assets/css/reading.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      titleTemplate: '%s · Shun',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'description', content: 'Shun 的个人技术站，记录 AI 应用、软件工程与项目实践。' }],
    },
  },
  content: { experimental: { sqliteConnector: 'native' } },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://shun-8sk.pages.dev',
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: [...new Set(['/', '/articles/', '/topics/', '/projects/', '/about/', '/search/', '/tags/',
        ...inventory.entries.filter(entry => !entry.draft).map(entry => entry.path), ...tagRoutes])],
    },
  },
})
