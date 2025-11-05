<template>
  <div class="settings-section">
    <div class="section-header">
      <div class="header-content">
        <h3>🤖 AI 助手</h3>
        <p class="section-description">配置 OpenAI 兼容 API，启用 AI 功能来智能生成书签描述、推荐分类等</p>
      </div>
    </div>

    <div class="settings-group">
      <div class="setting-item">
        <div class="setting-header">
          <label class="setting-label">API 状态</label>
        </div>
        <div class="status-display">
          <span v-if="aiEnabled" class="status-badge status-enabled">
            <span class="status-dot"></span>
            已启用
          </span>
          <span v-else class="status-badge status-disabled">
            <span class="status-dot"></span>
            未配置
          </span>
          <button 
            v-if="!isAuthenticated"
            class="btn-info"
            disabled
          >
            需要登录后配置
          </button>
        </div>
      </div>

      <div v-if="isAuthenticated" class="config-section">
        <div class="setting-item">
          <div class="setting-header">
            <label class="setting-label" for="ai-api-key">API Key</label>
            <span class="setting-hint">OpenAI API Key 或兼容服务的密钥</span>
          </div>
          <div class="input-with-action">
            <input
              id="ai-api-key"
              v-model="localApiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="sk-..."
              class="setting-input"
              :disabled="saving"
            />
            <button
              type="button"
              class="btn-icon"
              @click="showApiKey = !showApiKey"
              :title="showApiKey ? '隐藏' : '显示'"
            >
              <svg v-if="showApiKey" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <p class="setting-note">
            💡 也可以通过环境变量 <code>OPENAI_API_KEY</code> 配置（优先级更高）
          </p>
        </div>

        <div class="setting-item">
          <div class="setting-header">
            <label class="setting-label" for="ai-base-url">Base URL</label>
            <span class="setting-hint">API 基础地址（可选）</span>
          </div>
          <input
            id="ai-base-url"
            v-model="localBaseUrl"
            type="text"
            placeholder="https://api.openai.com/v1"
            class="setting-input"
            :disabled="saving"
          />
          <p class="setting-note">
            支持 OpenAI 兼容服务（如 Azure OpenAI、Claude、Gemini 等）<br>
            环境变量：<code>OPENAI_BASE_URL</code>
          </p>
        </div>

        <div class="setting-item">
          <div class="setting-header">
            <label class="setting-label" for="ai-model">模型名称</label>
            <span class="setting-hint">使用的模型（可选）</span>
          </div>
          <input
            id="ai-model"
            v-model="localModel"
            type="text"
            placeholder="gpt-4o-mini"
            class="setting-input"
            :disabled="saving"
          />
          <p class="setting-note">
            推荐：gpt-4o-mini、gpt-3.5-turbo、gpt-4o<br>
            环境变量：<code>OPENAI_MODEL</code>
          </p>
        </div>

        <div class="advanced-settings">
          <button
            type="button"
            class="btn-collapse"
            @click="showAdvanced = !showAdvanced"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              :style="{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)' }"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            高级配置
          </button>

          <div v-if="showAdvanced" class="advanced-content">
            <div class="setting-item">
              <div class="setting-header">
                <label class="setting-label" for="ai-auth-header">认证 Header 名称</label>
                <span class="setting-hint">某些代理服务可能需要自定义</span>
              </div>
              <input
                id="ai-auth-header"
                v-model="localAuthHeader"
                type="text"
                placeholder="Authorization"
                class="setting-input"
                :disabled="saving"
              />
              <p class="setting-note">
                环境变量：<code>OPENAI_AUTH_HEADER</code>
              </p>
            </div>

            <div class="setting-item">
              <div class="setting-header">
                <label class="setting-label" for="ai-auth-prefix">认证前缀</label>
                <span class="setting-hint">通常为 "Bearer "</span>
              </div>
              <input
                id="ai-auth-prefix"
                v-model="localAuthPrefix"
                type="text"
                placeholder="Bearer "
                class="setting-input"
                :disabled="saving"
              />
              <p class="setting-note">
                留空表示不添加前缀（某些服务直接传 API Key）<br>
                环境变量：<code>OPENAI_AUTH_PREFIX</code>
              </p>
            </div>
          </div>
        </div>

        <div class="setting-actions">
          <button
            class="btn btn-primary"
            @click="saveSettings"
            :disabled="saving || !hasChanges"
          >
            <span v-if="saving">保存中...</span>
            <span v-else>保存配置</span>
          </button>
          <button
            v-if="hasChanges"
            class="btn btn-secondary"
            @click="resetSettings"
            :disabled="saving"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <div class="ai-features-info">
      <h4>✨ AI 功能说明</h4>
      <ul class="feature-list">
        <li>
          <strong>智能生成描述：</strong>在添加/编辑书签时，AI 可以根据网站名称和 URL 自动生成描述
        </li>
        <li>
          <strong>分类推荐：</strong>AI 会分析书签内容，推荐最合适的分类
        </li>
        <li>
          <strong>批量生成：</strong>支持为多个书签批量生成描述，提升效率
        </li>
        <li>
          <strong>通用 API 代理：</strong>通过 <code>/api/ai/proxy</code> 端点，可以调用所有 OpenAI 兼容 API
        </li>
      </ul>
    </div>

    <div class="compatibility-info">
      <h4>🔌 兼容性说明</h4>
      <p>支持所有兼容 OpenAI Chat Completions API 格式的服务，包括但不限于：</p>
      <ul class="compatible-services">
        <li>OpenAI（官方）</li>
        <li>Azure OpenAI</li>
        <li>Claude (via API)</li>
        <li>Google Gemini</li>
        <li>本地部署的模型（如 Ollama、LM Studio）</li>
        <li>各类代理服务和中转 API</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAI } from '../../composables/useAI'
import { useAuth } from '../../composables/useAuth'
import { useToast } from '../../composables/useToast'

const { isAuthenticated } = useAuth()
const { aiEnabled, aiSource, checkAIAvailability, saveAISettings, getAISettings } = useAI()
const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast()

const localApiKey = ref('')
const localBaseUrl = ref('https://api.openai.com/v1')
const localModel = ref('gpt-4o-mini')
const localAuthHeader = ref('Authorization')
const localAuthPrefix = ref('Bearer ')
const showApiKey = ref(false)
const showAdvanced = ref(false)
const saving = ref(false)

const originalSettings = ref({})

const hasChanges = computed(() => {
  if (!isAuthenticated.value) return false
  return (
    localApiKey.value !== originalSettings.value.apiKey ||
    localBaseUrl.value !== originalSettings.value.baseUrl ||
    localModel.value !== originalSettings.value.model ||
    localAuthHeader.value !== originalSettings.value.authHeader ||
    localAuthPrefix.value !== originalSettings.value.authPrefix
  )
})

const loadSettings = async () => {
  if (!isAuthenticated.value) return

  const result = await getAISettings()
  if (result.success) {
    localApiKey.value = result.apiKey || ''
    localBaseUrl.value = result.baseUrl || 'https://api.openai.com/v1'
    localModel.value = result.model || 'gpt-4o-mini'
    localAuthHeader.value = result.authHeader || 'Authorization'
    localAuthPrefix.value = result.authPrefix !== undefined ? result.authPrefix : 'Bearer '

    originalSettings.value = {
      apiKey: localApiKey.value,
      baseUrl: localBaseUrl.value,
      model: localModel.value,
      authHeader: localAuthHeader.value,
      authPrefix: localAuthPrefix.value
    }
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const result = await saveAISettings({
      apiKey: localApiKey.value,
      baseUrl: localBaseUrl.value,
      model: localModel.value,
      authHeader: localAuthHeader.value,
      authPrefix: localAuthPrefix.value
    })

    if (result.success) {
      toastSuccess('AI 配置已保存')
      originalSettings.value = {
        apiKey: localApiKey.value,
        baseUrl: localBaseUrl.value,
        model: localModel.value,
        authHeader: localAuthHeader.value,
        authPrefix: localAuthPrefix.value
      }
      await checkAIAvailability()
    } else {
      toastError(result.error || '保存失败')
    }
  } catch (error) {
    toastError('保存失败')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  localApiKey.value = originalSettings.value.apiKey
  localBaseUrl.value = originalSettings.value.baseUrl
  localModel.value = originalSettings.value.model
  localAuthHeader.value = originalSettings.value.authHeader
  localAuthPrefix.value = originalSettings.value.authPrefix
}

onMounted(async () => {
  await checkAIAvailability()
  await loadSettings()
})
</script>

<style scoped>
.settings-section {
  padding: var(--space-6);
}

.section-header {
  margin-bottom: var(--space-6);
}

.header-content h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text);
  margin: 0 0 var(--space-2) 0;
}

.section-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin: 0;
}

.settings-group {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}

.setting-item {
  margin-bottom: var(--space-5);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.setting-label {
  font-weight: var(--font-semibold);
  color: var(--text);
  font-size: var(--text-sm);
}

.setting-hint {
  color: var(--text-secondary);
  font-size: var(--text-xs);
}

.setting-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: var(--text-sm);
  transition: var(--transition);
}

.setting-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.setting-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.setting-note {
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

.setting-note code {
  background: var(--bg);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-xs);
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
}

.status-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.status-enabled {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-disabled {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.btn-info {
  padding: 0.375rem 0.75rem;
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.input-with-action {
  display: flex;
  gap: var(--space-2);
}

.input-with-action input {
  flex: 1;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.btn-icon:hover {
  background: var(--bg);
  border-color: var(--primary);
}

.btn-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: var(--text-secondary);
}

.advanced-settings {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.btn-collapse {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: var(--primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: var(--transition);
}

.btn-collapse:hover {
  color: var(--primary-dark);
}

.btn-collapse svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  transition: transform 0.2s;
}

.advanced-content {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
}

.setting-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--border);
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg);
}

.ai-features-info,
.compatibility-info {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}

.ai-features-info h4,
.compatibility-info h4 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text);
  margin: 0 0 var(--space-3) 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: var(--space-2) 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.6;
}

.feature-list li strong {
  color: var(--text);
  font-weight: var(--font-semibold);
}

.feature-list li code {
  background: var(--bg);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-xs);
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
}

.compatibility-info p {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: 0 0 var(--space-3) 0;
}

.compatible-services {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-2);
}

.compatible-services li {
  padding: var(--space-2) var(--space-3);
  background: var(--bg);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  text-align: center;
}

@media (max-width: 768px) {
  .compatible-services {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
