type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void
  render: (id: string, code: string) => Promise<{ svg: string }>
}
let pending: Promise<MermaidApi> | undefined
export function loadMermaid(): Promise<MermaidApi> {
  if (pending) return pending
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/vendor/mermaid.min.js'
    script.onload = () => {
      const api = (window as unknown as { mermaid: MermaidApi }).mermaid
      api.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', suppressErrorRendering: true })
      resolve(api)
    }
    script.onerror = () => { script.remove(); pending = undefined; reject(new Error('Mermaid load failed')) }
    document.head.appendChild(script)
  })
  return pending
}
