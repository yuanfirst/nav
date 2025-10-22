import React from 'react'

interface EmptyStateProps {
  onAddCategory: () => void
  onAddBookmark: () => void
  onImportBookmarks: () => void
  authed: boolean
}

export function EmptyState({ onAddCategory, onAddBookmark, onImportBookmarks, authed }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="text-center max-w-md">
        {/* 图标 */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* 标题和描述 */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          欢迎使用书签管理系统
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          开始整理您的书签吧！您可以创建分类、添加书签，或者导入现有的书签文件。
        </p>

        {/* 快捷操作按钮 */}
        <div className="space-y-4">
          {/* 创建分类 */}
          <button
            onClick={onAddCategory}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>创建第一个分类</span>
          </button>

          {/* 导入书签 */}
          <button
            onClick={onImportBookmarks}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>导入现有书签</span>
          </button>

          {/* 如果已登录，显示添加书签按钮 */}
          {authed && (
            <button
              onClick={onAddBookmark}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>添加第一个书签</span>
            </button>
          )}

          {/* 如果未登录，显示登录提示 */}
          {!authed && (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                需要登录才能添加书签
              </p>
              <button
                onClick={() => {
                  // 触发登录模态
                  const event = new CustomEvent('openLoginModal')
                  window.dispatchEvent(event)
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
              >
                点击登录
              </button>
            </div>
          )}
        </div>

        {/* 帮助提示 */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            💡 使用提示
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 支持导入 Chrome、Firefox 等浏览器的书签文件</li>
            <li>• 可以创建多个分类来组织书签</li>
            <li>• 支持公开和私密书签分类</li>
            <li>• 支持拖拽排序和自动备份</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
