/**
 * 导出生成器 - 支持 JSON 和 HTML 格式
 */

export interface ExportData {
  version: number
  exportedAt: string
  categories: Array<{
    id: string
    name: string
    order: number
  }>
  bookmarks: Array<{
    id: string
    title: string
    url: string
    description?: string
    iconUrl?: string
    isPrivate: boolean
    categoryId: string
    order: number
  }>
}

/**
 * 生成 JSON 格式导出
 */
export function generateJsonExport(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * 生成 HTML 书签文件格式（Netscape Bookmark File Format）
 */
export function generateHtmlExport(data: ExportData): string {
  const now = new Date().toISOString()
  
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">Nav Bookmarks Export</H3>
    <DL><p>`

  // 按分类组织书签
  const categoriesMap = new Map(data.categories.map(cat => [cat.id, cat]))
  const bookmarksByCategory = new Map<string, typeof data.bookmarks>()
  
  // 按分类分组书签
  data.bookmarks.forEach(bookmark => {
    if (!bookmarksByCategory.has(bookmark.categoryId)) {
      bookmarksByCategory.set(bookmark.categoryId, [])
    }
    bookmarksByCategory.get(bookmark.categoryId)!.push(bookmark)
  })

  // 生成分类和书签
  data.categories
    .sort((a, b) => a.order - b.order)
    .forEach(category => {
      const bookmarks = bookmarksByCategory.get(category.id) || []
      
      if (bookmarks.length > 0) {
        html += `
    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">${escapeHtml(category.name)}</H3>
    <DL><p>`
        
        bookmarks
          .sort((a, b) => a.order - b.order)
          .forEach(bookmark => {
            const addDate = Math.floor(Date.now() / 1000)
            const lastModified = Math.floor(Date.now() / 1000)
            const href = escapeHtml(bookmark.url)
            const title = escapeHtml(bookmark.title)
            const description = bookmark.description ? escapeHtml(bookmark.description) : ''
            
            html += `
        <DT><A HREF="${href}" ADD_DATE="${addDate}" LAST_MODIFIED="${lastModified}" ICON="${bookmark.iconUrl || ''}">${title}</A>`
            
            if (description) {
              html += `
        <DD>${description}`
            }
          })
        
        html += `
    </DL><p>`
      }
    })

  html += `
</DL><p>
</DL><p>`

  return html
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * 生成文件名
 */
export function generateFileName(format: 'json' | 'html'): string {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  return `nav-bookmarks-${date}.${format}`
}
