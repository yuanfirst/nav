import { ref, watch } from 'vue'
import { useAuth } from './useAuth'

const isDark = ref(localStorage.getItem('theme') === 'dark')

export function useTheme() {
  const { isAuthenticated, getAuthHeaders } = useAuth()
  
  // 保存主题到数据库
  const saveThemeToDB = async (theme) => {
    if (!isAuthenticated.value) return
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ settings: { theme } })
      })
      
      if (response.status === 401) {
        console.warn('Token expired, theme not saved to database')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to save theme: ${errorData.details || errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to save theme to database:', error)
    }
  }
  
  // 从数据库加载主题（未登录用户也可以访问）
  const loadThemeFromDB = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: isAuthenticated.value ? getAuthHeaders() : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.theme) {
          const theme = data.data.theme
          isDark.value = theme === 'dark'
          localStorage.setItem('theme', theme)
        }
      }
    } catch (error) {
      console.error('Failed to load theme from database:', error)
    }
  }
  
  const toggleTheme = async () => {
    isDark.value = !isDark.value
    const theme = isDark.value ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    
    // 保存到数据库
    await saveThemeToDB(theme)
  }
  
  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, { immediate: true })
  
  return {
    isDark,
    toggleTheme,
    loadThemeFromDB
  }
}

