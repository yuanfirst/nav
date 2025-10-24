import { ref, watch } from 'vue'

const showSearch = ref(localStorage.getItem('showSearch') !== 'false')
const hideEmptyCategories = ref(localStorage.getItem('hideEmptyCategories') === 'true')
const customTitle = ref(localStorage.getItem('customTitle') || '📚 书签管理')
const footerContent = ref(localStorage.getItem('footerContent') || '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>')
const activeSettingsTab = ref(localStorage.getItem('activeSettingsTab') || 'appearance')

export function useSettings() {
  const toggleSearch = () => {
    showSearch.value = !showSearch.value
  }
  
  const toggleHideEmptyCategories = () => {
    hideEmptyCategories.value = !hideEmptyCategories.value
  }
  
  const updateCustomTitle = (title) => {
    customTitle.value = title || '📚 书签管理'
  }
  
  const updateFooterContent = (content) => {
    footerContent.value = content || '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>'
  }
  
  const setActiveSettingsTab = (tab) => {
    activeSettingsTab.value = tab
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
    setActiveSettingsTab
  }
}

