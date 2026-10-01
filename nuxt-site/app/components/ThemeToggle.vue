<script setup lang="ts">
const dark = ref(false)
function applyTheme(value: boolean) {
  dark.value = value
  document.documentElement.classList.toggle('dark', value)
}
onMounted(() => {
  try { applyTheme(localStorage.getItem('shun-theme') === 'dark') }
  catch { applyTheme(false) }
})
function toggleTheme() {
  applyTheme(!dark.value)
  try { localStorage.setItem('shun-theme', dark.value ? 'dark' : 'light') } catch { /* preference storage is optional */ }
}
</script>
<template>
  <button class="theme-toggle" type="button" :aria-pressed="dark" :aria-label="dark ? '切换为浅色模式' : '切换为深色模式'" :title="dark ? '切换为浅色模式' : '切换为深色模式'" @click="toggleTheme">
    <svg v-if="dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></svg>
  </button>
</template>
