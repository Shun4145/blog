import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(site, '.output/public')
const inventory = JSON.parse(await readFile(resolve(site, 'data/content-inventory.json'), 'utf8'))
const entries = inventory.entries.filter(entry => !entry.draft)
const base = new URL(process.env.NUXT_PUBLIC_SITE_URL || 'https://shun-8sk.pages.dev')
const escape = text => String(text || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const url = path => new URL(path, base).href
const tagPath = tag => `/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}/`
const tags = [...new Set(entries.flatMap(entry => entry.tags))]
const paths = [...new Set([...entries.map(entry => entry.path), '/topics/', '/search/', ...tags.map(tagPath)])]
await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escape(url(path))}</loc></url>`).join('')}</urlset>`)
await writeFile(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url('/sitemap.xml')}\n`)
const records = entries.filter(entry => entry.kind !== 'page').sort((a, b) => (b.date || '').localeCompare(a.date || ''))
const feeds = new Map([['/', records], ['/agent/', records.filter(e => e.section === 'agent')], ['/rag/', records.filter(e => e.section === 'rag')], ['/articles/', records], ['/projects/', records.filter(e => e.section === 'projects')], ['/projects/rag-knowledge-base/', records.filter(e => e.section === 'projects')], ['/about/', []], ['/tags/', records], ...tags.map(tag => [tagPath(tag), records.filter(e => e.tags.includes(tag))])])
for (const [path, items] of feeds) {
  const directory = resolve(out, '.' + decodeURIComponent(path))
  await mkdir(directory, { recursive: true })
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Shun · 技术与实践</title><link>${escape(url(path))}</link><description>AI 应用、软件工程与个人实践</description>${items.map(entry => `<item><title>${escape(entry.title)}</title><link>${escape(url(entry.path))}</link><guid>${escape(url(entry.path))}</guid><description>${escape(entry.description)}</description>${entry.date ? `<pubDate>${new Date(entry.date).toUTCString()}</pubDate>` : ''}</item>`).join('')}</channel></rss>`
  await writeFile(resolve(directory, 'index.xml'), feed)
}
console.log(`Generated sitemap (${paths.length} URLs), robots and ${feeds.size} RSS feeds`)
