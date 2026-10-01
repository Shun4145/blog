<script setup lang="ts">
const props = defineProps<{ code?: string; language?: string; filename?: string; meta?: string }>()
const svg = ref('')
const error = ref('')
const copied = ref(false)
const id = `diagram-${useId().replace(/[^a-z\d-]/gi, '')}`
let alive = true
onBeforeUnmount(() => { alive = false })
async function renderDiagram() {
  if (props.language !== 'mermaid' || !props.code) return
  svg.value = ''; error.value = ''
  const code = props.code
  try {
    const mermaid = await loadMermaid()
    const result = await mermaid.render(id, code)
    if (alive && code === props.code) svg.value = result.svg
  } catch {
    if (alive) error.value = '图表暂时无法显示，可查看下方源代码。'
  }
}
onMounted(renderDiagram)
watch(() => props.code, renderDiagram)
async function copyCode() {
  try { await navigator.clipboard.writeText(props.code || ''); copied.value = true }
  catch { copied.value = false }
}
</script>

<template>
  <figure v-if="language === 'mermaid'" class="mermaid-block">
    <div v-if="svg" class="mermaid-diagram" role="img" aria-label="文章流程图" v-html="svg" />
    <p v-else-if="error" role="status">{{ error }}</p>
    <p v-else role="status">正在绘制流程图…</p>
    <details :open="!!error"><summary>图表源代码</summary><pre><code>{{ code }}</code></pre></details>
  </figure>
  <div v-else class="code-block">
    <div class="code-toolbar"><span>{{ filename || language || '代码' }}</span><button type="button" @click="copyCode">{{ copied ? '已复制' : '复制代码' }}</button></div>
    <pre :data-language="language"><slot /></pre>
  </div>
</template>
