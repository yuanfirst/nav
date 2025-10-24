<template>
  <div class="settings-section">
    <h2 class="section-title">数据管理</h2>
    
    <!-- 导入导出 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">导入/导出</div>
          <div class="form-description">备份或恢复书签数据</div>
        </div>
      </div>
      <button class="btn btn-primary" @click="$emit('action', 'importExport')">
        导入/导出
      </button>
    </div>
    
    <!-- 统计信息 -->
    <div class="form-group stats-group">
      <div class="form-header">
        <div class="form-icon stats-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3v18h18"/>
            <path d="M18 17V9M13 17V5M8 17v-3"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">书签统计</div>
          <div class="form-description">
            共 {{ totalBookmarks }} 个书签，其中 {{ privateBookmarks }} 个私密书签
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalBookmarks: Number,
  privateBookmarks: Number
})

defineEmits(['action'])
</script>

<style scoped>
.settings-section {
  max-width: 600px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.form-group:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-icon {
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-icon svg {
  width: 22px;
  height: 22px;
  stroke-width: 2;
}

.form-content {
  flex: 1;
}

.form-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.form-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.stats-group {
  cursor: default;
}

.stats-group:hover {
  border-color: var(--border);
  transform: none;
}

.stats-icon {
  background: var(--success);
}
</style>
