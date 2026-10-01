import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(site, '.output/public')
const inventory = JSON.parse(await readFile(resolve(site, 'data/content-inventory.json'), 'utf8'))
const entries = inventory.entries.filter(entry => !entry.draft)
const tags = [...new Set(entries.flatMap(entry => entry.tags))]
const routes = [...new Set([...entries.map(entry => entry.path), '/topics/', '/search/', ...tags.map(tag => `/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}/`)])]
const documents = new Map()
async function documentAt(path) {
  const key = decodeURIComponent(path).replace(/\/+$/, '') || '/'
  if (documents.has(key)) return documents.get(key)
  const html = await readFile(resolve(output, '.' + key, 'index.html'), 'utf8')
  assert.doesNotMatch(html, /http:\/\/127\.0\.0\.1:1313/, '旧 Hugo 链接残留')
  const document = new JSDOM(html).window.document
  documents.set(key, document)
  return document
}
let links = 0, diagrams = 0
for (const route of routes) {
  const document = await documentAt(route)
  assert.equal(document.documentElement.lang, 'zh-CN')
  assert.equal(document.querySelectorAll('h1').length, 1, `${route}: expected one H1`)
  assert.ok(document.querySelector('link[rel="canonical"]'))
  const entry = entries.find(entry => entry.path === route)
  if (entry && entry.kind !== 'page') {
    assert.equal(document.querySelector('h1').textContent, entry.title)
    assert.ok(document.querySelector('.reading-prose')?.textContent.length > 100, `${route}: missing body`)
  }
  for (const element of document.querySelectorAll('a[href],img[src],script[src],link[href]')) {
    const value = element.getAttribute('href') || element.getAttribute('src')
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(value)) continue
    const url = new URL(value, `https://static.test${route}`)
    if (!url.pathname.includes('.')) {
      const target = await documentAt(url.pathname)
      if (url.hash) assert.ok(target.getElementById(decodeURIComponent(url.hash.slice(1))), `${route}: missing anchor ${value}`)
    } else assert.ok((await stat(resolve(output, '.' + decodeURIComponent(url.pathname)))).isFile(), `${route}: missing asset ${value}`)
    links++
  }
  diagrams += document.querySelectorAll('.mermaid-block').length
}
assert.equal(diagrams, 47, '图表必须完整迁移')
const aliases = JSON.parse(await readFile(resolve(site, 'data/legacy-anchors.json'), 'utf8'))
let anchors = 0
for (const [path, headings] of Object.entries(aliases)) {
  const document = await documentAt(path)
  for (const oldIds of Object.values(headings)) for (const id of oldIds) {
    assert.ok(document.getElementById(id), `${path}: old anchor missing ${id}`)
    anchors++
  }
}
for (const filename of ['sitemap.xml', 'robots.txt', 'index.xml', 'favicon.svg', 'vendor/mermaid.min.js']) await stat(resolve(output, filename))
console.log(`PASS ${routes.length} pages (${entries.length} original + 2 new + ${tags.length} tags), ${links} local links/assets, ${diagrams} Mermaid blocks, ${anchors} legacy anchors`)
