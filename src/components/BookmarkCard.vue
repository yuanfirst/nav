<template>
  <div 
    class="bookmark-card"
    :draggable="isEditMode"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
    @click="handleClick"
  >
    <div class="card-header">
      <img 
        :src="iconUrl" 
        :alt="bookmark.name"
        class="card-icon"
        loading="lazy"
        decoding="async"
        @error="handleIconError"
      >
      <h4 class="card-title">{{ bookmark.name }}</h4>
    </div>
    
    <p class="card-url">{{ displayUrl }}</p>
    
    <p v-if="bookmark.description" class="card-description">
      {{ bookmark.description }}
    </p>
    
    <div v-if="bookmark.is_private" class="private-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>私密</span>
    </div>
    
    <div v-if="isEditMode" class="card-actions" @click.stop>
      <button class="icon-btn" @click="$emit('edit', bookmark)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="icon-btn delete-btn" @click="$emit('delete', bookmark)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  bookmark: {
    type: Object,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'dragstart', 'drop'])

const iconError = ref(false)

const iconUrl = computed(() => {
  // 默认 SVG 图标
  const defaultIcon = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Cpath d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"%3E%3C/path%3E%3Cpath d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"%3E%3C/path%3E%3C/svg%3E'
  
  if (iconError.value) {
    return defaultIcon
  }
  
  // 如果有自定义图标URL，使用自定义图标
  if (props.bookmark.icon && props.bookmark.icon.trim()) {
    return props.bookmark.icon
  }
  
  // 使用 faviconextractor.com 服务（国内访问友好）
  try {
    const url = new URL(props.bookmark.url)
    return `https://www.faviconextractor.com/favicon/${url.hostname}`
  } catch {
    return defaultIcon
  }
})

const displayUrl = computed(() => {
  try {
    const url = new URL(props.bookmark.url)
    return url.hostname
  } catch {
    return props.bookmark.url
  }
})

const handleIconError = () => {
  iconError.value = true
}

const handleClick = () => {
  if (!props.isEditMode) {
    window.open(props.bookmark.url, '_blank')
  }
}

const handleDragStart = (e) => {
  if (props.isEditMode) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('bookmarkId', props.bookmark.id)
    emit('dragstart', props.bookmark)
  }
}

const handleDrop = (e) => {
  if (props.isEditMode) {
    const draggedId = e.dataTransfer.getData('bookmarkId')
    emit('drop', { draggedId: parseInt(draggedId), targetId: props.bookmark.id })
  }
}
</script>

