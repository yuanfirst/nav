import { ref, watch } from 'vue'
import { useAuth } from './useAuth'

const showSearch = ref(localStorage.getItem('showSearch') !== 'false')
const hideEmptyCategories = ref(localStorage.getItem('hideEmptyCategories') === 'true')
const customTitle = ref(localStorage.getItem('customTitle') || '📚 书签管理')
const footerContent = ref(localStorage.getItem('footerContent') || '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>')
const activeSettingsTab = ref(localStorage.getItem('activeSettingsTab') || 'appearance')

// 加载标志位，避免循环触发
const isLoadingFromDB = ref(false)

export function useSettings() {
  const { isAuthenticated, getAuthHeaders, apiRequest } = useAuth()
  
  // 从数据库加载设置（未登录用户也可以访问）
  const loadSettingsFromDB = async () => {
    isLoadingFromDB.value = true
    try {
      const response = await fetch('/api/settings', {
        headers: isAuthenticated.value ? getAuthHeaders() : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Settings loaded from database:', data.data)
        if (data.success && data.data) {
          // 更新设置值，不触发 watch
          if (data.data.customTitle) {
            console.log('Updating customTitle to:', data.data.customTitle)
            customTitle.value = data.data.customTitle
            localStorage.setItem('customTitle', data.data.customTitle)
          }
          if (data.data.footerContent) {
            footerContent.value = data.data.footerContent
            localStorage.setItem('footerContent', data.data.footerContent)
          }
          if (data.data.showSearch !== undefined) {
            showSearch.value = data.data.showSearch === 'true'
            localStorage.setItem('showSearch', data.data.showSearch)
          }
          if (data.data.hideEmptyCategories !== undefined) {
            hideEmptyCategories.value = data.data.hideEmptyCategories === 'true'
            localStorage.setItem('hideEmptyCategories', data.data.hideEmptyCategories)
          }
          if (data.data.activeSettingsTab) {
            activeSettingsTab.value = data.data.activeSettingsTab
            localStorage.setItem('activeSettingsTab', data.data.activeSettingsTab)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load settings from database:', error)
    } finally {
      isLoadingFromDB.value = false
    }
  }
  
  // 保存设置到数据库
  const saveSettingsToDB = async (settings) => {
    if (!isAuthenticated.value) return
    
    try {
      await apiRequest('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ settings })
      })
    } catch (error) {
      if (error.message === 'Token expired') {
        console.warn('Token expired, settings not saved to database')
        // apiRequest 已经自动调用了 logout()，这里不需要额外处理
      } else {
        console.error('Failed to save settings to database:', error)
      }
    }
  }
  
  const toggleSearch = async () => {
    showSearch.value = !showSearch.value
    localStorage.setItem('showSearch', showSearch.value.toString())
    
    // 保存到数据库
    await saveSettingsToDB({ showSearch: showSearch.value.toString() })
  }
  
  const toggleHideEmptyCategories = async () => {
    hideEmptyCategories.value = !hideEmptyCategories.value
    localStorage.setItem('hideEmptyCategories', hideEmptyCategories.value.toString())
    
    // 保存到数据库
    await saveSettingsToDB({ hideEmptyCategories: hideEmptyCategories.value.toString() })
  }
  
  const updateCustomTitle = async (title) => {
    const newTitle = title || '📚 书签管理'
    customTitle.value = newTitle
    localStorage.setItem('customTitle', newTitle)
    
    // 保存到数据库
    await saveSettingsToDB({ customTitle: newTitle })
  }
  
  const updateFooterContent = async (content) => {
    const newContent = content || '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>'
    footerContent.value = newContent
    localStorage.setItem('footerContent', newContent)
    
    // 保存到数据库
    await saveSettingsToDB({ footerContent: newContent })
  }
  
  const setActiveSettingsTab = async (tab) => {
    activeSettingsTab.value = tab
    localStorage.setItem('activeSettingsTab', tab)
    
    // 保存到数据库
    await saveSettingsToDB({ activeSettingsTab: tab })
  }
  
  watch(showSearch, async (newValue) => {
    if (!isLoadingFromDB.value) {
      localStorage.setItem('showSearch', newValue.toString())
      if (isAuthenticated.value) {
        try {
          await apiRequest('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ settings: { showSearch: newValue.toString() } })
          })
        } catch (error) {
          if (error.message === 'Token expired') {
            console.warn('Token expired, showSearch not saved to database')
          }
        }
      }
    }
  })
  
  watch(hideEmptyCategories, async (newValue) => {
    if (!isLoadingFromDB.value) {
      localStorage.setItem('hideEmptyCategories', newValue.toString())
      if (isAuthenticated.value) {
        try {
          await apiRequest('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ settings: { hideEmptyCategories: newValue.toString() } })
          })
        } catch (error) {
          if (error.message === 'Token expired') {
            console.warn('Token expired, hideEmptyCategories not saved to database')
          }
        }
      }
    }
  })
  
  watch(customTitle, async (newValue) => {
    if (!isLoadingFromDB.value) {
      localStorage.setItem('customTitle', newValue)
      // 如果已登录，保存到数据库
      if (isAuthenticated.value) {
        try {
          await apiRequest('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ settings: { customTitle: newValue } })
          })
        } catch (error) {
          if (error.message === 'Token expired') {
            console.warn('Token expired, customTitle not saved to database')
          }
        }
      }
    }
  })
  
  watch(footerContent, async (newValue) => {
    if (!isLoadingFromDB.value) {
      localStorage.setItem('footerContent', newValue)
      if (isAuthenticated.value) {
        try {
          await apiRequest('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ settings: { footerContent: newValue } })
          })
        } catch (error) {
          if (error.message === 'Token expired') {
            console.warn('Token expired, footerContent not saved to database')
          }
        }
      }
    }
  })
  
  watch(activeSettingsTab, async (newValue) => {
    if (!isLoadingFromDB.value) {
      localStorage.setItem('activeSettingsTab', newValue)
      if (isAuthenticated.value) {
        try {
          await apiRequest('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ settings: { activeSettingsTab: newValue } })
          })
        } catch (error) {
          if (error.message === 'Token expired') {
            console.warn('Token expired, activeSettingsTab not saved to database')
          }
        }
      }
    }
  })
  
  return {
    showSearch,
    hideEmptyCategories,
    customTitle,
    footerContent,
    activeSettingsTab,
    toggleSearch,
    toggleHideEmptyCategories,
    updateCustomTitle,
    updateFooterContent,
    setActiveSettingsTab,
    loadSettingsFromDB
  }
}

