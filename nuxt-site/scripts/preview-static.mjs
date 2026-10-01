import { createServer } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../.output/public')
const port = Number(process.env.PORT || 4173)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT')
if (!existsSync(resolve(root, 'index.html'))) throw new Error('请先执行 npm run generate')
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}
createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname)
    let target = resolve(root, `.${pathname}`)
    if (target !== root && !target.startsWith(root + sep)) {
      response.writeHead(403).end()
      return
    }
    if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html')
    if (!(await stat(target)).isFile()) throw new Error('Not a file')
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream' })
    if (request.method === 'HEAD') response.end()
    else createReadStream(target).on('error', () => response.destroy()).pipe(response)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('页面或文件不存在')
  }
}).listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}/`))
