/**
 * 从 HTML 中提取元数据
 */
export async function fetchMetadata(url: string): Promise<{
  title?: string
  description?: string
  iconUrl?: string
}> {
  try {
    // 验证 URL
    const urlObj = new URL(url)
    
    // 发起请求获取 HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
      },
      // 设置超时
      signal: AbortSignal.timeout(10000), // 10秒超时
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    
    // 提取 title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : undefined

    // 提取 description (meta description 或 og:description)
    const descriptionMatch = 
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    const description = descriptionMatch ? descriptionMatch[1].trim() : undefined

    // 提取 favicon
    let iconUrl: string | undefined
    
    // 尝试获取 og:image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    if (ogImageMatch) {
      iconUrl = ogImageMatch[1].trim()
    }
    
    // 尝试获取 link rel="icon"
    if (!iconUrl) {
      const iconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i)
      if (iconMatch) {
        iconUrl = iconMatch[1].trim()
        // 处理相对路径
        if (iconUrl.startsWith('/')) {
          iconUrl = `${urlObj.protocol}//${urlObj.host}${iconUrl}`
        } else if (!iconUrl.startsWith('http')) {
          iconUrl = `${urlObj.protocol}//${urlObj.host}/${iconUrl}`
        }
      }
    }

    // 如果没有找到 favicon，使用默认路径
    if (!iconUrl) {
      iconUrl = `https://www.faviconextractor.com/favicon/${urlObj.hostname}`
    }

    return {
      title,
      description,
      iconUrl,
    }
  } catch (error) {
    console.error('获取元数据失败:', error)
    // 返回空对象，前端可以选择使用默认值
    return {}
  }
}
