<template>
  <div class="search-bar">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
    <input 
      v-model="query"
      type="text" 
      placeholder="搜索书签..."
      @input="handleSearch"
    >
    <button v-if="query" class="clear-btn" @click="clearSearch">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'
import { debounce } from '../utils/helpers'

const { searchQuery } = useBookmarks()
const query = ref('')

// 使用防抖优化搜索性能
const handleSearch = debounce(() => {
  searchQuery.value = query.value
}, 300)

const clearSearch = () => {
  query.value = ''
  searchQuery.value = ''
}
</script>

