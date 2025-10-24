import { ref, computed } from 'vue'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

const categories = ref([])
const bookmarks = ref([])
const searchQuery = ref('')

export function useBookmarks() {
  const { getAuthHeaders, logout } = useAuth()
  const { error: toastError } = useToast()
  
  // API 错误处理
  const handleApiError = async (response) => {
    if (response.status === 401) {
      toastError('登录已过期，请重新登录')
      logout()
      return true
    }
    return false
  }
  
  const filteredBookmarks = computed(() => {
    if (!searchQuery.value) return bookmarks.value
    
    const query = searchQuery.value.toLowerCase()
    return bookmarks.value.filter(bookmark => 
      bookmark.name.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query)
    )
  })
  
  const bookmarksByCategory = computed(() => {
    const result = {}
    categories.value.forEach(category => {
      result[category.id] = filteredBookmarks.value
        .filter(b => b.category_id === category.id)
        .sort((a, b) => a.position - b.position)
    })
    return result
  })
  
  const fetchData = async () => {
    try {
      // 获取分类
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      categories.value = categoriesData.data || []
      
      // 获取书签（如果已登录，带上token以获取私密书签）
      const bookmarksRes = await fetch('/api/bookmarks', {
        headers: getAuthHeaders()
      })
      const bookmarksData = await bookmarksRes.json()
      bookmarks.value = bookmarksData.data || []
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }
  
  const addBookmark = async (data) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      
      if (await handleApiError(response)) {
        return { success: false, error: '未授权' }
      }
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '添加失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  const updateBookmark = async (id, data) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '更新失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  const deleteBookmark = async (id) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '删除失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  const addCategory = async (name) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ name })
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '添加失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  const updateCategory = async (id, name) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ name })
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '更新失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '删除失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  const reorderItems = async (type, items) => {
    try {
      const response = await fetch('/api/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ type, items })
      })
      
      const result = await response.json()
      if (result.success) {
        await fetchData()
        return { success: true }
      }
      return { success: false, error: '排序失败' }
    } catch (error) {
      return { success: false, error: '网络错误' }
    }
  }
  
  return {
    categories,
    bookmarks,
    searchQuery,
    filteredBookmarks,
    bookmarksByCategory,
    fetchData,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderItems
  }
}

