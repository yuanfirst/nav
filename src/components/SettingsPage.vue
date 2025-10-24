<template>
  <Transition name="page">
    <div v-if="show" class="settings-page">
      <div class="settings-container">
        <!-- Header -->
        <div class="settings-header">
          <button class="back-btn" @click="close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>设置</h2>
          <button class="menu-toggle" @click="toggleSidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>
        
        <!-- Two-column layout -->
        <div class="settings-layout">
          <!-- Left Sidebar -->
          <div 
            class="settings-sidebar" 
            :class="{ 'sidebar-open': sidebarOpen }"
            @click.stop
          >
            <div class="sidebar-menu">
              <div 
                v-for="item in menuItems" 
                :key="item.id"
                :class="['menu-item', { active: activeTab === item.id }]"
                @click="setActiveTab(item.id)"
              >
                <div class="menu-icon">{{ item.icon }}</div>
                <div class="menu-text">{{ item.name }}</div>
              </div>
            </div>
          </div>
          
          <!-- Mobile overlay -->
          <div 
            v-if="sidebarOpen" 
            class="sidebar-overlay"
            @click="sidebarOpen = false"
          ></div>
          
          <!-- Right Content -->
          <div class="settings-content">
            <component 
              :is="currentSettingsComponent" 
              v-bind="componentProps"
              @action="handleAction"
              @editTitle="editTitle"
              @editFooter="editFooter"
              @toggleTheme="$emit('toggleTheme')"
              @toggleSearch="$emit('toggleSearch')"
              @toggleHideEmpty="$emit('toggleHideEmpty')"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppearanceSettings from './settings/AppearanceSettings.vue'
import DataSettings from './settings/DataSettings.vue'
import AboutSettings from './settings/AboutSettings.vue'

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  bookmarks: {
    type: Array,
    default: () => []
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  hideEmptyCategories: {
    type: Boolean,
    default: false
  },
  customTitle: {
    type: String,
    default: '📚 书签管理'
  },
  footerContent: {
    type: String,
    default: '<p>Made with ❤️ using <a href="https://github.com/deerwan/nav" target="_blank">Vue 3 and Cloudflare</a></p>'
  },
  activeSettingsTab: {
    type: String,
    default: 'appearance'
  }
})

const emit = defineEmits(['action', 'close', 'toggleTheme', 'toggleSearch', 'toggleHideEmpty', 'updateTitle', 'updateFooter', 'editTitle', 'editFooter', 'setActiveTab'])

const menuItems = ref([
  { id: 'appearance', name: '外观设置', icon: '🎨' },
  { id: 'data', name: '数据管理', icon: '📊' },
  { id: 'about', name: '关于', icon: 'ℹ️' }
])

const totalBookmarks = computed(() => props.bookmarks.length)
const privateBookmarks = computed(() => props.bookmarks.filter(b => b.is_private).length)

const show = ref(false)
const activeTab = ref(props.activeSettingsTab)
const sidebarOpen = ref(false)

const currentSettingsComponent = computed(() => {
  const components = {
    appearance: AppearanceSettings,
    data: DataSettings,
    about: AboutSettings
  }
  return components[activeTab.value] || AppearanceSettings
})

const componentProps = computed(() => ({
  isDark: props.isDark,
  showSearch: props.showSearch,
  hideEmptyCategories: props.hideEmptyCategories,
  customTitle: props.customTitle,
  footerContent: props.footerContent,
  totalBookmarks: totalBookmarks.value,
  privateBookmarks: privateBookmarks.value
}))

const open = () => {
  show.value = true
}

const close = () => {
  show.value = false
  emit('close')
}

const handleAction = (action) => {
  emit('action', action)
}

const editTitle = () => {
  emit('editTitle')
}

const editFooter = () => {
  emit('editFooter')
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  emit('setActiveTab', tab)
  // 移动端选择后自动关闭侧边栏
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

defineExpose({
  open,
  close
})
</script>

<style scoped>
.settings-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.settings-container {
  background: var(--bg);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 1000px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  border-radius: var(--radius-sm);
}

.back-btn:hover {
  background: var(--bg-secondary);
}

.back-btn svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.menu-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  border-radius: var(--radius-sm);
}

.menu-toggle:hover {
  background: var(--bg-secondary);
}

.menu-toggle svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.placeholder {
  width: 40px;
}

/* Layout */
.settings-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.settings-sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 1.5rem 0;
  overflow-y: auto;
  transition: var(--transition);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius);
  color: var(--text-secondary);
}

.menu-item:hover {
  background: var(--bg-tertiary);
  color: var(--text);
}

.menu-item.active {
  background: var(--primary);
  color: white;
}

.menu-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Content */
.settings-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: var(--bg);
}

/* Page animation */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .settings-page {
    padding: 0;
  }
  
  .settings-container {
    height: 100vh;
    border-radius: 0;
    flex-direction: column;
  }
  
  .settings-layout {
    flex-direction: row;
    position: relative;
  }
  
  .settings-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    z-index: 10;
    transform: translateX(-100%);
    border-right: 1px solid var(--border);
    border-bottom: none;
    padding: 1.5rem 0;
  }
  
  .settings-sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .sidebar-menu {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem;
    overflow-x: visible;
  }
  
  .menu-item {
    flex-shrink: 0;
    padding: 1rem 1.5rem;
    white-space: nowrap;
  }
  
  .settings-content {
    padding: 1.5rem;
    width: 100%;
  }
  
  /* 侧边栏遮罩 */
  .sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 5;
  }
}
</style>