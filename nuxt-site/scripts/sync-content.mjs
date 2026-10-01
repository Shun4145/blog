import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: sync-content.mjs [--check]')
const inventoryFile = resolve(site, 'data/content-inventory.json')
const old = JSON.parse(await readFile(inventoryFile, 'utf8'))
async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('Content symlinks are not supported')
    const file = resolve(directory, entry.name)
    files.push(...(entry.isDirectory() ? await walk(file) : entry.name.endsWith('.md') ? [file] : []))
  }
  return files.sort()
}
const entries = [], search = []
for (const filename of await walk(resolve(site, 'content/notes'))) {
  const raw = await readFile(filename, 'utf8')
  const front = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!front) throw new Error(`${filename}: missing frontmatter`)
  const meta = parse(front[1])
  const file = relative(resolve(site, 'content'), filename).replaceAll('\\', '/')
  if (!meta.title || !meta.path?.startsWith('/') || !['article', 'project-chapter', 'page'].includes(meta.kind)) throw new Error(`${file}: title/path/kind required`)
  const path = meta.path === '/' ? '/' : encodeURI(meta.path.replace(/\/+$/, '')) + '/'
  const previous = old.entries.find(entry => entry.file === file)
  if (previous && previous.path !== path) throw new Error(`${file}: existing URL changed; add a deliberate redirect before changing it`)
  const body = raw.slice(front[0].length)
  if (/\{\{[<%]/.test(body)) throw new Error(`${file}: Hugo shortcode remains`)
  const entry = {
    source: meta.source || `nuxt-site/content/${file}`, title: meta.title, description: meta.description || '',
    path, section: meta.section || '', kind: meta.kind, date: meta.date || null, lastmod: meta.lastmod || meta.date || null,
    tags: meta.tags || [], featured: !!meta.featured, draft: !!meta.draft,
    compatibility: { shortcodes: [], rawHtml: false, mermaid: /^```mermaid/m.test(body) },
    file, weight: meta.weight || 0,
  }
  entries.push(entry)
  if (!entry.draft && entry.kind !== 'page') {
    const text = body.replace(/^\s*::[^\n]*$/gm, ' ').replace(/^\s*```[^\n]*$/gm, ' ')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, ' ').replace(/[#*`>]/g, ' ').replace(/\s+/g, ' ').trim()
    search.push({ ...entry, text })
  }
}
if (new Set(entries.map(entry => entry.path)).size !== entries.length) throw new Error('Duplicate URL')
const counts = { articles: entries.filter(e => e.kind === 'article').length, projectChapters: entries.filter(e => e.kind === 'project-chapter').length, pages: entries.filter(e => e.kind === 'page').length }
const inventory = { ...old, counts, entries }
for (const [file, value] of [[inventoryFile, inventory], [resolve(site, 'data/search-index.json'), search]]) {
  const expected = JSON.stringify(value, null, 2) + '\n'
  if (check) { if (await readFile(file, 'utf8') !== expected) throw new Error(`Stale data: ${file}; run npm run inventory`) }
  else await writeFile(file, expected, 'utf8')
}
console.log(`${check ? 'Verified' : 'Synced'} ${entries.length} pages; ${search.length} searchable records`)
