import inventory from '~~/data/content-inventory.json'

export interface SiteEntry {
  source: string
  title: string
  description: string
  path: string
  section: string
  kind: string
  date: string | null
  lastmod: string | null
  tags: string[]
  featured: boolean
  draft: boolean
  weight?: number
  file?: string
}

export function useSiteInventory() {
  const entries = (inventory.entries as unknown as SiteEntry[]).filter(entry => !entry.draft)
  const articles = entries.filter(entry => entry.kind === 'article')
  const projectChapters = entries.filter(entry => entry.kind === 'project-chapter')
  const contentUrl = (path: string) => path
  const legacyContentUrl = contentUrl
  const tagPath = (tag: string) => `/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}/`
  return { entries, articles, projectChapters, contentUrl, legacyContentUrl, tagPath }
}
