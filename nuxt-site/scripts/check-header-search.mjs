import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { parse, compileScript } from '@vue/compiler-sfc'
import ts from 'typescript'

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div><button id="outside">Outside</button></body></html>', { url: 'https://static.test/' })
for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) globalThis[key] = dom.window[key]
const vue = await import('vue')
const route = vue.reactive({ fullPath: '/', query: {} })
const navigations = []
const index = JSON.parse(await readFile(new URL('../data/search-index.json', import.meta.url), 'utf8'))
const source = await readFile(new URL('../app/components/HeaderSearch.vue', import.meta.url), 'utf8')
const { descriptor } = parse(source)
const compiled = compileScript(descriptor, { id: 'header-search-test', inlineTemplate: true })
const code = ts.transpileModule(compiled.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const exports = {}
const { ref, shallowRef, computed, watch, nextTick, onMounted, onBeforeUnmount } = vue
const helpers = { ref, shallowRef, computed, watch, nextTick, onMounted, onBeforeUnmount, useRoute: () => route, navigateTo: path => { navigations.push(path) } }
const require = name => {
  if (name === 'vue') return vue
  if (name === '~~/data/search-index.json') return { default: index }
  throw new Error('Unexpected import: ' + name)
}
new Function('require', 'exports', ...Object.keys(helpers), code)(require, exports, ...Object.values(helpers))
const app = vue.createApp(exports.default)
app.component('NuxtLink', { props: ['to'], template: '<a :href="to"><slot /></a>' })
app.mount('#app')
const input = document.querySelector('input')
const dropdown = document.getElementById('header-search-results')
const settle = async () => { await Promise.resolve(); await Promise.resolve(); await vue.nextTick() }
const keyboard = (target, key, options = {}) => target.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }))
const search = async text => {
  input.value = text
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  await settle()
}
input.focus()
await settle()
assert.notEqual(dropdown.style.display, 'none')
await search('MCP')
assert.ok(document.querySelectorAll('.header-search-result').length > 0)
await search('MCP 协议')
const expected = index.filter(entry => ['mcp', '协议'].every(term => `${entry.title} ${entry.description} ${entry.text} ${entry.tags.join(' ')}`.toLocaleLowerCase().includes(term)))
assert.equal(document.querySelectorAll('.header-search-result').length, expected.length)
keyboard(input, 'ArrowDown')
assert.ok(document.activeElement.matches('.header-search-result'))
input.focus()
keyboard(input, 'Enter')
assert.equal(navigations.at(-1), expected[0].path)
await settle()
assert.equal(dropdown.style.display, 'none')
keyboard(document, 'k', { ctrlKey: true })
await settle()
assert.equal(document.activeElement, input)
assert.notEqual(dropdown.style.display, 'none')
await search('no-match-xyz-987654')
assert.equal(document.querySelectorAll('.header-search-result').length, 0)
assert.ok(dropdown.textContent.includes('没有找到'))
keyboard(input, 'Escape')
await settle()
assert.equal(dropdown.style.display, 'none')
keyboard(document, 'k', { metaKey: true })
await settle()
document.getElementById('outside').dispatchEvent(new dom.window.Event('pointerdown', { bubbles: true }))
await settle()
assert.equal(dropdown.style.display, 'none')
route.query = { search: '1' }
route.fullPath = '/?search=1'
await settle()
await settle()
assert.notEqual(dropdown.style.display, 'none')
app.unmount()
dom.window.close()
console.log('PASS header search: full text, multiple keywords, empty results, keyboard focus, Enter, Escape, outside click and legacy URL')
