import { useState, useCallback } from 'react'

export type MetadataResult = {
  title?: string
  description?: string
  iconUrl?: string
}

export function useMetadataFetch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetadata = useCallback(async (url: string): Promise<MetadataResult | null> => {
    if (!url || !url.trim()) {
      setError('请输入有效的 URL')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // 标准化 URL
      let normalizedUrl = url.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`
      }

      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(normalizedUrl)}`
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: '获取元数据失败' }))
        throw new Error(error.error || '获取元数据失败')
      }

      const metadata = await response.json()
      return metadata
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取元数据失败'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchMetadata, loading, error }
}
