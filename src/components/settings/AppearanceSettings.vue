<template>
  <div class="settings-section">
    <h2 class="section-title">外观设置</h2>
    
    <!-- 自定义标题 -->
    <div class="form-group">
      <label class="form-label">自定义标题</label>
      <div class="form-row">
        <input 
          type="text" 
          :value="customTitle" 
          class="form-input" 
          readonly
        />
        <button class="btn btn-secondary" @click="$emit('editTitle')">
          编辑
        </button>
      </div>
      <div class="form-hint">修改页面顶部标题文字</div>
    </div>
    
    <!-- 自定义页脚 -->
    <div class="form-group">
      <label class="form-label">自定义页脚</label>
      <div class="form-row">
        <div class="footer-preview" v-html="footerContent"></div>
        <button class="btn btn-secondary" @click="$emit('editFooter')">
          编辑
        </button>
      </div>
      <div class="form-hint">修改页面底部内容（支持HTML）</div>
    </div>
    
    <!-- 主题模式 -->
    <div class="form-group">
      <label class="form-label">主题模式</label>
      <div class="form-row">
        <span class="form-text">{{ isDark ? '暗色模式' : '亮色模式' }}</span>
        <button class="btn btn-primary" @click="$emit('toggleTheme')">
          {{ isDark ? '切换到亮色' : '切换到暗色' }}
        </button>
      </div>
    </div>
    
    <!-- 显示搜索栏 -->
    <div class="form-group">
      <label class="form-label">显示搜索栏</label>
      <div class="form-row">
        <span class="form-text">{{ showSearch ? '已开启' : '已关闭' }}</span>
        <label class="switch">
          <input 
            type="checkbox" 
            :checked="showSearch"
            @change="$emit('toggleSearch')"
          >
          <span class="slider"></span>
        </label>
      </div>
      <div class="form-hint">在顶部显示搜索功能</div>
    </div>
    
    <!-- 隐藏空分类 -->
    <div class="form-group">
      <label class="form-label">隐藏空分类</label>
      <div class="form-row">
        <span class="form-text">{{ hideEmptyCategories ? '已开启' : '已关闭' }}</span>
        <label class="switch">
          <input 
            type="checkbox" 
            :checked="hideEmptyCategories"
            @change="$emit('toggleHideEmpty')"
          >
          <span class="slider"></span>
        </label>
      </div>
      <div class="form-hint">不显示没有书签的分类</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isDark: Boolean,
  showSearch: Boolean,
  hideEmptyCategories: Boolean,
  customTitle: String,
  footerContent: String
})

defineEmits(['editTitle', 'editFooter', 'toggleTheme', 'toggleSearch', 'toggleHideEmpty'])
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
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.form-label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 0.75rem;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
}

.form-input:read-only {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.form-text {
  flex: 1;
  color: var(--text);
  font-size: 0.9rem;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.footer-preview {
  flex: 1;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
  max-height: 60px;
  overflow: hidden;
}

.btn {
  padding: 0.5rem 1rem;
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
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--border);
  transition: var(--transition);
  border-radius: 999px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: var(--transition);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background: var(--primary);
}

.switch input:checked + .slider:before {
  transform: translateX(24px);
}
</style>
