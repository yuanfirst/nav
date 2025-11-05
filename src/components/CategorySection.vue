<template>
  <div 
    :id="`category-${category.id}`" 
    class="category-section"
    :class="{ 'efficient-mode': displayMode === 'efficient' }"
  >
    <div class="category-header">
      <div v-if="isBatchMode" class="category-checkbox">
        <input 
          type="checkbox" 
          :checked="isCategorySelected"
          @change="handleToggleCategorySelection"
        />
      </div>
      <h2 class="category-title">{{ category.name }}</h2>
      <div v-if="isEditMode && !isBatchMode" class="category-actions">
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
      :class="{ 
        'is-drag-over': isGridDragOver,
        'efficient-mode': displayMode === 'efficient'
      }"
      @dragover.prevent
      @dragenter.prevent="handleGridDragEnter"
      @dragleave="handleGridDragLeave"
      @drop="handleDropOnGrid"
    >
      <BookmarkCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        :bookmark="bookmark"
        :is-edit-mode="isEditMode"
        :is-batch-mode="isBatchMode"
        :is-selected="isBookmarkSelected(bookmark.id)"
        :display-mode="displayMode"
        @edit="$emit('edit-bookmark', bookmark)"
        @delete="$emit('delete-bookmark', bookmark)"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @drop="handleDrop"
        @dragenter="handleCardDragEnter"
        @dragleave="handleCardDragLeave"
        @dragoverPosition="handleDragOverPosition"
        @toggleSelect="handleToggleSelection"
        @keyboardReorder="handleKeyboardReorder"
      />
      
      <div v-if="!bookmarks.length" class="empty-state">
        暂无书签
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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
  },
  isBatchMode: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  selectedCategoryIds: {
    type: Array,
    default: () => []
  },
  displayMode: {
    type: String,
    default: 'standard'
  }
})

const emit = defineEmits([
  'edit-category',
  'delete-category',
  'edit-bookmark',
  'delete-bookmark',
  'reorder-bookmarks',
  'toggle-selection',
  'toggle-category-selection'
])

let draggedBookmark = null
const isGridDragOver = ref(false)
const dropIndicatorPosition = ref('after')

const selectedSet = computed(() => new Set(props.selectedIds))
const isBookmarkSelected = (id) => selectedSet.value.has(id)
const isCategorySelected = computed(() => props.selectedCategoryIds?.includes(props.category.id) || false)

const handleToggleCategorySelection = () => {
  emit('toggle-category-selection', props.category.id)
}

const handleDragStart = (bookmark) => {
  draggedBookmark = bookmark
}

const handleDragEnd = () => {
  draggedBookmark = null
  isGridDragOver.value = false
}

const handleCardDragEnter = () => {
  isGridDragOver.value = false
}

const handleCardDragLeave = () => {
  // no-op for now
}

const handleDragOverPosition = ({ position }) => {
  dropIndicatorPosition.value = position
}

const handleDrop = ({ draggedId, targetId, position }) => {
  if (!draggedBookmark || draggedId === targetId) return

  // 跨分类：插入到目标卡片前/后，放到当前分类
  if (draggedBookmark.category_id !== props.category.id) {
    const bookmarksCopy = [...props.bookmarks]
    const targetIndex = bookmarksCopy.findIndex(b => b.id === targetId)
    if (targetIndex === -1) return
    const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
    // 仅需发出单项变更，App接收后调用 updateBookmark 处理跨分类移动
    emit('reorder-bookmarks', [{ id: draggedId, position: insertIndex, category_id: props.category.id }])
    draggedBookmark = null
    isGridDragOver.value = false
    return
  }

  // 同分类：重排列表
  const bookmarksCopy = [...props.bookmarks]
  const draggedIndex = bookmarksCopy.findIndex(b => b.id === draggedId)
  const targetIndex = bookmarksCopy.findIndex(b => b.id === targetId)
  if (draggedIndex === -1 || targetIndex === -1) return

  let insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
  const [removed] = bookmarksCopy.splice(draggedIndex, 1)
  if (draggedIndex < insertIndex) insertIndex -= 1
  bookmarksCopy.splice(insertIndex, 0, removed)

  const items = bookmarksCopy.map((b, index) => ({ id: b.id, position: index }))
  emit('reorder-bookmarks', items)
  draggedBookmark = null
}

const handleGridDragEnter = () => {
  if (!props.isEditMode) return
  isGridDragOver.value = true
}

const handleGridDragLeave = () => {
  isGridDragOver.value = false
}

const handleDropOnGrid = (e) => {
  if (!props.isEditMode || !draggedBookmark) return
  const draggedId = e.dataTransfer.getData('bookmarkId')
  if (!draggedId) return
  const bookmarkId = parseInt(draggedId, 10)

  // 跨分类：放到该分类末尾
  if (draggedBookmark.category_id !== props.category.id) {
    const insertIndex = props.bookmarks.length
    emit('reorder-bookmarks', [{ id: bookmarkId, position: insertIndex, category_id: props.category.id }])
    draggedBookmark = null
    isGridDragOver.value = false
    return
  }

  // 同分类：移到末尾
  const bookmarksCopy = props.bookmarks.filter(b => b.id !== bookmarkId)
  bookmarksCopy.push(draggedBookmark)
  const items = bookmarksCopy.map((b, index) => ({ id: b.id, position: index }))
  emit('reorder-bookmarks', items)
  draggedBookmark = null
  isGridDragOver.value = false
}

const handleToggleSelection = (bookmarkId) => {
  emit('toggle-selection', bookmarkId)
}

const handleKeyboardReorder = ({ id, direction }) => {
  if (!props.isEditMode) return
  const bookmarksCopy = [...props.bookmarks]
  const currentIndex = bookmarksCopy.findIndex(b => b.id === id)
  if (currentIndex === -1) return
  
  if (direction === 'up' && currentIndex > 0) {
    const [removed] = bookmarksCopy.splice(currentIndex, 1)
    bookmarksCopy.splice(currentIndex - 1, 0, removed)
  } else if (direction === 'down' && currentIndex < bookmarksCopy.length - 1) {
    const [removed] = bookmarksCopy.splice(currentIndex, 1)
    bookmarksCopy.splice(currentIndex + 1, 0, removed)
  } else {
    return
  }
  
  const items = bookmarksCopy.map((b, index) => ({ id: b.id, position: index }))
  emit('reorder-bookmarks', items)
}
</script>

<style scoped>
.category-section {
  margin-bottom: 2rem;
}

/* Efficient Mode - Compact Category Section */
.category-section.efficient-mode {
  margin-bottom: 1.25rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.75rem;
}

/* Efficient Mode - Compact Category Header */
.category-section.efficient-mode .category-header {
  margin-bottom: 0.625rem;
}

.category-checkbox {
  display: flex;
  align-items: center;
}

.category-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary);
}

.category-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text);
}

/* Efficient Mode - Compact Category Title */
.category-section.efficient-mode .category-title {
  font-size: 1.2rem;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  position: relative;
  padding: 0.25rem;
  transition: border 0.2s ease;
}

.bookmarks-grid.efficient-mode {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.5rem;
}

.bookmarks-grid.is-drag-over {
  border: 2px dashed var(--primary);
  border-radius: var(--radius);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  font-size: 0.9rem;
}
</style>
