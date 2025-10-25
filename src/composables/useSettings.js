import { ref, watch } from 'vue'
import { useAuth } from './useAuth'

const showSearch = ref(localStorage.getItem('showSearch') !== 'false')
const hideEmptyCategories = ref(localStorage.getItem('hideEmptyCategories') === 'true')
const customTitle = ref(localStorage.getItem('customTitle') || '📚 书签管理')
const footerContent = ref(localStorage.getItem('footerContent') || '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>')
const activeSettingsTab = ref(localStorage.getItem('activeSettingsTab') || 'appearance')

export function useSettings() {
  const { isAuthenticated, getAuthHeaders } = useAuth()
  
  // 从数据库加载设置
  const loadSettingsFromDB = async () => {
    if (!isAuthenticated.value) return
    
    try {
      const response = await fetch('/api/settings', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // 更新设置值
          if (data.data.customTitle) {
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
    }
  }
  
  // 保存设置到数据库
  const saveSettingsToDB = async (settings) => {
    if (!isAuthenticated.value) return
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ settings })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings to database')
      }
    } catch (error) {
      console.error('Failed to save settings to database:', error)
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
  
  watch(showSearch, (newValue) => {
    localStorage.setItem('showSearch', newValue.toString())
  })
  
  watch(hideEmptyCategories, (newValue) => {
    localStorage.setItem('hideEmptyCategories', newValue.toString())
  })
  
  watch(customTitle, (newValue) => {
    localStorage.setItem('customTitle', newValue)
  })
  
  watch(footerContent, (newValue) => {
    localStorage.setItem('footerContent', newValue)
  })
  
  watch(activeSettingsTab, (newValue) => {
    localStorage.setItem('activeSettingsTab', newValue)
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

