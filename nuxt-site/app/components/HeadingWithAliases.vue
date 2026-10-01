<script setup lang="ts">
import legacyAnchors from '~~/data/legacy-anchors.json'
const props = defineProps<{ tag: 'h2' | 'h3' | 'h4'; id?: string }>()
const route = useRoute()
const aliases = computed(() => {
  const path = decodeURIComponent(route.path).replace(/\/$/, '') || '/'
  return (legacyAnchors as Record<string, Record<string, string[]>>)[path]?.[props.id || ''] || []
})
</script>
<template><component :is="tag" :id="id"><span v-for="alias in aliases" :id="alias" :key="alias" class="legacy-anchor" aria-hidden="true" /><a :href="`#${encodeURIComponent(id || '')}`"><slot /></a></component></template>
