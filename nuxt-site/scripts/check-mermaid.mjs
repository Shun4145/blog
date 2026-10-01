import { readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { runInContext } from 'node:vm'
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' })
runInContext(await readFile(resolve(site, 'public/vendor/mermaid.min.js'), 'utf8'), dom.getInternalVMContext())
const mermaid = dom.window.mermaid
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })
async function walk(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name)
    result.push(...(entry.isDirectory() ? await walk(file) : [file]))
  }
  return result
}
let count = 0
for (const file of await walk(resolve(site, 'content/notes'))) {
  const text = await readFile(file, 'utf8')
  for (const match of text.matchAll(/^```mermaid\s*\n([\s\S]*?)^```\s*$/gm)) {
    try { await mermaid.parse(match[1]); count++ }
    catch (error) { throw new Error(`${file}: Mermaid ${count + 1} 无法解析`, { cause: error }) }
  }
}
if (!count) throw new Error('没有找到 Mermaid 图表')
console.log(`PASS ${count} Mermaid diagrams (syntax only; visual rendering requires browser)`)
dom.window.close()
