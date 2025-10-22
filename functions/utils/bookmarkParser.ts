/**
 * 书签解析器 - 支持 HTML 书签文件格式解析
 */

export interface ParsedBookmark {
  title: string
  url: string
  description?: string
  addDate?: number
  lastModified?: number
  icon?: string
}

export interface ParsedCategory {
  name: string
  bookmarks: ParsedBookmark[]
  addDate?: number
  lastModified?: number
}

export interface ParsedData {
  categories: ParsedCategory[]
  totalBookmarks: number
}

/**
 * 解析 HTML 书签文件（Netscape Bookmark File Format）
 */
export function parseHtmlBookmarks(htmlContent: string): ParsedData {
  const categories: ParsedCategory[] = []
  let totalBookmarks = 0

  try {
    // 简单的 HTML 解析，提取书签和文件夹
    const lines = htmlContent.split('\n')
    let currentCategory: ParsedCategory | null = null
    let inCategory = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 检测文件夹开始
      if (line.includes('<H3') && line.includes('</H3>')) {
        const nameMatch = line.match(/<H3[^>]*>([^<]+)<\/H3>/i)
        if (nameMatch) {
          // 保存之前的分类
          if (currentCategory && currentCategory.bookmarks.length > 0) {
            categories.push(currentCategory)
          }
          
          // 开始新分类
          currentCategory = {
            name: decodeHtmlEntities(nameMatch[1].trim()),
            bookmarks: []
          }
          inCategory = true
        }
      }
      
      // 检测文件夹结束
      else if (line.includes('</DL>') && inCategory) {
        if (currentCategory && currentCategory.bookmarks.length > 0) {
          categories.push(currentCategory)
        }
        currentCategory = null
        inCategory = false
      }
      
      // 检测书签
      else if (line.includes('<DT><A') && currentCategory) {
        const bookmark = parseBookmarkLine(line)
        if (bookmark) {
          currentCategory.bookmarks.push(bookmark)
          totalBookmarks++
        }
      }
    }

    // 处理最后一个分类
    if (currentCategory && currentCategory.bookmarks.length > 0) {
      categories.push(currentCategory)
    }

  } catch (error) {
    console.error('解析 HTML 书签文件失败:', error)
    throw new Error('无法解析书签文件，请确保文件格式正确')
  }

  return {
    categories,
    totalBookmarks
  }
}

/**
 * 解析单行书签
 */
function parseBookmarkLine(line: string): ParsedBookmark | null {
  try {
    // 提取 URL
    const hrefMatch = line.match(/HREF="([^"]+)"/i)
    if (!hrefMatch) return null

    // 提取标题
    const titleMatch = line.match(/>([^<]+)<\/A>/i)
    if (!titleMatch) return null

    // 提取其他属性
    const addDateMatch = line.match(/ADD_DATE="([^"]+)"/i)
    const lastModifiedMatch = line.match(/LAST_MODIFIED="([^"]+)"/i)
    const iconMatch = line.match(/ICON="([^"]+)"/i)

    return {
      title: decodeHtmlEntities(titleMatch[1].trim()),
      url: hrefMatch[1],
      addDate: addDateMatch ? parseInt(addDateMatch[1]) : undefined,
      lastModified: lastModifiedMatch ? parseInt(lastModifiedMatch[1]) : undefined,
      icon: iconMatch ? iconMatch[1] : undefined
    }
  } catch (error) {
    console.error('解析书签行失败:', error)
    return null
  }
}

/**
 * 解码 HTML 实体
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  }

  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity
  })
}

/**
 * 验证导入数据
 */
export function validateImportData(data: any): { valid: boolean; error?: string } {
  try {
    // 检查基本结构
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '无效的数据格式' }
    }

    // 检查版本
    if (data.version && typeof data.version !== 'number') {
      return { valid: false, error: '无效的版本号' }
    }

    // 检查分类
    if (data.categories && !Array.isArray(data.categories)) {
      return { valid: false, error: '分类数据格式错误' }
    }

    // 检查书签
    if (data.bookmarks && !Array.isArray(data.bookmarks)) {
      return { valid: false, error: '书签数据格式错误' }
    }

    // 验证分类数据
    if (data.categories) {
      for (const category of data.categories) {
        if (!category.id || !category.name) {
          return { valid: false, error: '分类数据不完整' }
        }
      }
    }

    // 验证书签数据
    if (data.bookmarks) {
      for (const bookmark of data.bookmarks) {
        if (!bookmark.id || !bookmark.title || !bookmark.url) {
          return { valid: false, error: '书签数据不完整' }
        }
        
        // 验证 URL
        try {
          new URL(bookmark.url)
        } catch {
          return { valid: false, error: `无效的 URL: ${bookmark.url}` }
        }
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: '数据验证失败' }
  }
}

/**
 * 清理和标准化导入数据
 */
export function cleanImportData(data: any, options: {
  merge: boolean
  makePrivate: boolean
}): any {
  const cleaned = {
    ...data,
    categories: data.categories || [],
    bookmarks: data.bookmarks || []
  }

  // 如果选择合并模式，重新生成 ID 避免冲突
  if (options.merge) {
    // 创建旧 ID 到新 ID 的映射
    const categoryIdMap = new Map<string, string>()
    
    cleaned.categories = cleaned.categories.map((cat: any) => {
      const newId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      categoryIdMap.set(cat.id, newId)
      return {
        ...cat,
        id: newId
      }
    })

    cleaned.bookmarks = cleaned.bookmarks.map((bookmark: any) => ({
      ...bookmark,
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      categoryId: categoryIdMap.get(bookmark.categoryId) || bookmark.categoryId,  // 更新 categoryId
      isPrivate: options.makePrivate || bookmark.isPrivate || false
    }))
  }

  // 清理和验证 URL
  cleaned.bookmarks = cleaned.bookmarks.map((bookmark: any) => ({
    ...bookmark,
    url: normalizeUrl(bookmark.url),
    title: bookmark.title?.trim() || 'Untitled',
    description: bookmark.description?.trim() || ''
  }))

  return cleaned
}

/**
 * 标准化 URL
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.toString()
  } catch {
    // 如果 URL 无效，尝试添加协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }
}
