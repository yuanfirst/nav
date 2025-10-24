<template>
  <Transition name="slide">
    <div v-if="isEditMode" class="edit-toolbar">
      <div class="toolbar-content">
        <div class="toolbar-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>编辑模式</span>
        </div>
        
        <div class="toolbar-actions">
          <button class="toolbar-btn add-bookmark-btn" @click="$emit('addBookmark')" title="添加书签">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>添加书签</span>
          </button>
          
          <button class="toolbar-btn add-category-btn" @click="$emit('addCategory')" title="添加分类">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            <span>添加分类</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isEditMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['addBookmark', 'addCategory'])
</script>

<style scoped>
.edit-toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 2px solid var(--primary);
  box-shadow: 0 2px 8px var(--shadow);
  margin-bottom: 1rem;
}

.toolbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--primary);
  font-size: 1rem;
}

.toolbar-title svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.toolbar-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.add-bookmark-btn {
  background: var(--success);
  color: white;
}

.add-bookmark-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.add-category-btn {
  background: var(--primary);
  color: white;
}

.add-category-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .toolbar-content {
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .toolbar-actions {
    width: 100%;
    justify-content: center;
  }
  
  .toolbar-btn {
    flex: 1;
    justify-content: center;
    padding: 0.875rem 1rem;
  }
  
  .toolbar-btn span {
    display: none;
  }
  
  .toolbar-btn svg {
    width: 20px;
    height: 20px;
  }
}

/* Animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
