<script setup lang="ts">
const progress = ref(0)
const route = useRoute()
function update() {
  const height = document.documentElement.scrollHeight - innerHeight
  progress.value = height > 0 ? Math.min(100, scrollY / height * 100) : 0
}
onMounted(() => { addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update() })
onBeforeUnmount(() => { removeEventListener('scroll', update); removeEventListener('resize', update) })
watch(() => route.path, async () => { await nextTick(); update() })
</script>
<template><div class="reading-progress" aria-hidden="true" :style="{ width: `${progress}%` }" /><a v-if="progress > 10" class="back-top" href="#main-content">返回顶部 ↑</a></template>
