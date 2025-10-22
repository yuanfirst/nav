import React, { useState } from 'react'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: 'json' | 'html') => void
}

export function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'html'>('json')

  if (!isOpen) return null

  const handleExport = () => {
    onExport(selectedFormat)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            导出书签
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                选择导出格式：
              </label>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={selectedFormat === 'json'}
                    onChange={(e) => setSelectedFormat(e.target.value as 'json')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">JSON 格式</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      完整数据，便于备份和迁移
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="html"
                    checked={selectedFormat === 'html'}
                    onChange={(e) => setSelectedFormat(e.target.value as 'html')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">HTML 格式</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      浏览器书签格式，兼容各大浏览器
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>📥</span>
              <span>导出</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
