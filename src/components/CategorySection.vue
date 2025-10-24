<template>
  <div :id="`category-${category.id}`" class="category-section">
    <div class="category-header">
      <h2 class="category-title">{{ category.name }}</h2>
      <div v-if="isEditMode" class="category-actions">
        <button class="icon-btn" @click="$emit('edit-category', category)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn delete-btn" @click="$emit('delete-category', category)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div 
      class="bookmarks-grid"
      @dragover.prevent
      @drop="handleDropOnEmpty"
    >
      <BookmarkCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        :bookmark="bookmark"
        :is-edit-mode="isEditMode"
        @edit="$emit('edit-bookmark', bookmark)"
        @delete="$emit('delete-bookmark', bookmark)"
        @dragstart="handleDragStart"
        @drop="handleDrop"
      />
      
      <div v-if="!bookmarks.length" class="empty-state">
        暂无书签
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BookmarkCard from './BookmarkCard.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  bookmarks: {
    type: Array,
    default: () => []
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'edit-category',
  'delete-category',
  'edit-bookmark',
  'delete-bookmark',
  'reorder-bookmarks'
])

let draggedBookmark = null

const handleDragStart = (bookmark) => {
  draggedBookmark = bookmark
}

const handleDrop = ({ draggedId, targetId }) => {
  if (!draggedBookmark || draggedId === targetId) return
  
  const bookmarks = [...props.bookmarks]
  const draggedIndex = bookmarks.findIndex(b => b.id === draggedId)
  const targetIndex = bookmarks.findIndex(b => b.id === targetId)
  
  if (draggedIndex === -1 || targetIndex === -1) return
  
  // 重新排序
  const [removed] = bookmarks.splice(draggedIndex, 1)
  bookmarks.splice(targetIndex, 0, removed)
  
  // 更新position
  const items = bookmarks.map((b, index) => ({
    id: b.id,
    position: index
  }))
  
  emit('reorder-bookmarks', items)
  draggedBookmark = null
}

const handleDropOnEmpty = (e) => {
  if (!props.isEditMode) return
  
  const draggedId = e.dataTransfer.getData('bookmarkId')
  if (!draggedId || !draggedBookmark) return
  
  // 移动到空分类
  if (props.bookmarks.length === 0 && draggedBookmark.category_id !== props.category.id) {
    emit('reorder-bookmarks', [{
      id: parseInt(draggedId),
      position: 0,
      category_id: props.category.id
    }])
  }
  
  draggedBookmark = null
}
</script>

