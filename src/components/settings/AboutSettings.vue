<template>
  <div class="settings-section">
    <h2 class="section-title">关于</h2>
    
    <!-- 版本信息 -->
    <div class="form-group version-group" :class="{ 'has-update': hasUpdate, 'checking': isChecking }">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4m0-4h.01"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">
            版本信息
            <span v-if="hasUpdate" class="update-badge">有新版本</span>
            <span v-if="isChecking" class="checking-badge">检查中</span>
            <span v-if="latestVersion && !hasUpdate && !isChecking" class="latest-badge">已是最新版本</span>
          </div>
          <div class="form-description">
            当前版本: v{{ currentVersion }}
            <span v-if="latestVersion && hasUpdate" class="latest-version">
              (最新版本: v{{ latestVersion }})
            </span>
            <span v-if="latestVersion && !hasUpdate" class="current-version">
              (最新版本: v{{ latestVersion }})
            </span>
            <span v-if="error" class="error-text">
              (检查失败: {{ error }})
            </span>
          </div>
          <div v-if="updateInfo && hasUpdate" class="update-details">
            <div class="update-time">
              发布于: {{ formatUpdateTime(updateInfo.published_at) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 更新内容预览 -->
      <div v-if="updateInfo && hasUpdate" class="update-content">
        <div class="update-content-header">
          <h4>更新内容 (v{{ latestVersion }})</h4>
        </div>
        <div class="update-content-body" v-html="formatUpdateContent(updateInfo.body)"></div>
      </div>
      
      <div class="version-actions">
        <button 
          v-if="hasUpdate" 
          class="btn btn-primary version-update-btn"
          @click="openUpdateDialog"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          查看完整更新
        </button>
        <button 
          class="btn btn-secondary version-check-btn"
          @click="handleCheckForUpdates"
          :disabled="isChecking"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
          {{ isChecking ? '检查中...' : '检查更新' }}
        </button>
      </div>
    </div>
    
    <!-- GitHub 仓库 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">GitHub 仓库</div>
          <div class="form-description">查看源代码和文档</div>
        </div>
      </div>
      <a 
        href="https://github.com/deerwan/nav" 
        target="_blank"
        class="btn btn-primary"
      >
        访问 GitHub
      </a>
    </div>
    
    <!-- 技术栈 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">技术栈</div>
          <div class="form-description">
            Vue 3 + Vite + Cloudflare Pages + D1
          </div>
        </div>
      </div>
    </div>
    
    <!-- 许可证 -->
    <div class="form-group">
      <div class="form-header">
        <div class="form-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
        </div>
        <div class="form-content">
          <div class="form-title">许可证</div>
          <div class="form-description">Apache License 2.0</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVersion } from '../../composables/useVersion'

const { 
  currentVersion, 
  latestVersion, 
  hasUpdate, 
  updateInfo, 
  isChecking, 
  error, 
  checkForUpdates, 
  formatUpdateTime,
  initialize
} = useVersion()

// 组件挂载时初始化版本检查
onMounted(() => {
  initialize()
})

const openUpdateDialog = () => {
  if (updateInfo.value) {
    // 打开更新详情对话框
    window.open(updateInfo.value.html_url, '_blank')
  }
}

const handleCheckForUpdates = async () => {
  await checkForUpdates()
}

// 格式化更新内容
const formatUpdateContent = (content) => {
  if (!content) return '暂无更新内容'
  
  // 将 Markdown 格式转换为简单的 HTML
  let formatted = content
    // 处理标题
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    // 处理列表项
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // 处理加粗文本
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 处理链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // 处理换行
    .replace(/\n/g, '<br>')
  
  // 将连续的 <li> 标签包装在 <ul> 中
  formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
  
  return formatted
}
</script>

<style scoped>
.settings-section {
  max-width: 800px;
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text);
  margin-bottom: var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-title::before {
  content: 'ℹ️';
  font-size: var(--text-xl);
}

.form-group {
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.form-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--info), var(--info-light));
  opacity: 0;
  transition: var(--transition);
}

.form-group:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-md);
}

.form-group:hover::before {
  opacity: 1;
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.form-icon {
  width: 48px;
  height: 48px;
  background: var(--info);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: var(--transition);
}

.form-group:hover .form-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.form-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.form-content {
  flex: 1;
}

.form-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text);
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-title::before {
  content: '🔗';
  font-size: var(--text-base);
}

.form-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.btn {
  width: 100%;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition);
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* 版本检查相关样式 */
.version-group.has-update {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f8fafc, rgba(245, 158, 11, 0.05));
}

.version-group.checking {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f8fafc, rgba(59, 130, 246, 0.05));
}

.update-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #f59e0b;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  animation: pulse 2s infinite;
}

.checking-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.latest-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #10b981;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.latest-version {
  color: #f59e0b;
  font-weight: 500;
}

.current-version {
  color: #10b981;
  font-weight: 500;
}

.error-text {
  color: #ef4444;
  font-weight: 500;
}

.update-details {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 更新内容样式 */
.update-content {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
}

.update-content-header h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f59e0b;
}

.update-content-body {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
  max-height: 200px;
  overflow-y: auto;
}

.update-content-body h2,
.update-content-body h3,
.update-content-body h4 {
  margin: 0.75rem 0 0.5rem 0;
  font-weight: 600;
  color: #1f2937;
}

.update-content-body h2 {
  font-size: 1.125rem;
}

.update-content-body h3 {
  font-size: 1rem;
}

.update-content-body h4 {
  font-size: 0.875rem;
}

.update-content-body ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.update-content-body li {
  margin: 0.25rem 0;
  list-style-type: disc;
}

.update-content-body strong {
  font-weight: 600;
  color: #1f2937;
}

.update-content-body a {
  color: #3b82f6;
  text-decoration: underline;
}

.update-content-body a:hover {
  color: #1d4ed8;
}

/* 按钮样式 */
.version-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.version-actions .btn {
  flex: 1;
  min-height: 44px;
  font-size: 14px;
  font-weight: 500;
}

.version-actions .btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  flex-shrink: 0;
}

.version-update-btn {
  background: var(--primary) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.version-update-btn:hover:not(:disabled) {
  background: var(--primary-dark) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.version-check-btn {
  background: var(--bg-secondary) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
}

.version-check-btn:hover:not(:disabled) {
  background: var(--bg-hover) !important;
  border-color: var(--primary) !important;
  transform: translateY(-1px);
}

.version-check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 暗色主题适配 */
.dark .version-group.has-update {
  background: linear-gradient(135deg, #1e293b, rgba(245, 158, 11, 0.1));
}

.dark .version-group.checking {
  background: linear-gradient(135deg, #1e293b, rgba(59, 130, 246, 0.1));
}

.dark .update-content {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.dark .update-content-body {
  color: #e5e7eb;
}

.dark .update-content-body h2,
.dark .update-content-body h3,
.dark .update-content-body h4 {
  color: #f9fafb;
}

.dark .update-content-body strong {
  color: #f9fafb;
}

.dark .version-btn-secondary {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.dark .version-btn-secondary:hover:not(:disabled) {
  background: #475569;
  border-color: #818cf8;
}
</style>
