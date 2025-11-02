<template>
  <div class="search-container">
    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input 
        v-model="query"
        type="text" 
        placeholder="搜索书签名称、URL或描述..."
        @input="handleSearch"
      >
      <button v-if="query || selectedCategoryId" class="clear-btn" @click="clearSearch" title="清除搜索">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <button class="filter-btn" :class="{ active: showFilter }" @click="showFilter = !showFilter" title="过滤选项">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
      </button>
    </div>
    
    <Transition name="slide-down">
      <div v-if="showFilter" class="filter-panel">
        <div class="filter-group">
          <label>按分类过滤：</label>
          <select v-model="selectedCategoryId" @change="handleCategoryFilter">
            <option :value="null">全部分类</option>
            <option 
              v-for="cat in categoryOptions" 
              :key="cat.id" 
              :value="cat.id"
            >
              {{ cat.displayName }}
            </option>
          </select>
        </div>
      </div>
    </Transition>
    
    <div v-if="query || selectedCategoryId" class="search-result-info">
      <span class="result-count">
        找到 <strong>{{ filteredBookmarks.length }}</strong> 个书签
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'
import { buildCategoryTree, getCategoryPath } from '../utils/categoryTree'
import { debounce } from '../utils/helpers'

const { searchQuery, searchCategoryId, categories, filteredBookmarks } = useBookmarks()
const query = ref('')
const selectedCategoryId = ref(null)
const showFilter = ref(false)

// 分类选项
const categoryOptions = computed(() => {
  if (!categories.value.length) {
    return []
  }
  const { flatList, map } = buildCategoryTree(categories.value)
  return flatList.map(cat => ({
    id: cat.id,
    displayName: getCategoryPath(cat.id, map).map(item => item.name).join('/')
  }))
})

// 使用防抖优化搜索性能
const handleSearch = debounce(() => {
  searchQuery.value = query.value
}, 300)

const handleCategoryFilter = () => {
  searchCategoryId.value = selectedCategoryId.value
}

const clearSearch = () => {
  query.value = ''
  selectedCategoryId.value = null
  searchQuery.value = ''
  searchCategoryId.value = null
}
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  transition: var(--transition);
}

.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  stroke-width: 2;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--text);
  outline: none;
  min-width: 0;
}

.search-bar input::placeholder {
  color: var(--text-secondary);
}

.clear-btn,
.filter-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.clear-btn:hover,
.filter-btn:hover {
  background: var(--bg-hover);
  color: var(--text);
}

.filter-btn.active {
  background: var(--primary);
  color: white;
}

.clear-btn svg,
.filter-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.filter-panel {
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: var(--radius);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.filter-group select {
  padding: 0.5rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary);
}

.search-result-info {
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  text-align: center;
}

.result-count {
  font-size: 0.875rem;
  color: var(--text);
}

.result-count strong {
  color: var(--primary);
  font-weight: 600;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .search-bar {
    padding: 0.6rem 0.875rem;
  }
  
  .search-bar input {
    font-size: 0.9rem;
  }
  
  .search-bar input::placeholder {
    font-size: 0.85rem;
  }
  
  .filter-panel {
    padding: 0.875rem;
  }
}
</style>
