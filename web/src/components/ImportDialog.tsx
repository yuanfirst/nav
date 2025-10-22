import React, { useState, useRef } from 'react'

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File, options: ImportOptions) => Promise<void>
}

interface ImportOptions {
  merge: boolean
  makePrivate: boolean
}

export function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [options, setOptions] = useState<ImportOptions>({
    merge: true,
    makePrivate: false
  })
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // 验证文件类型
    const validTypes = ['application/json', 'text/html', 'text/plain']
    const validExtensions = ['.json', '.html', '.htm']
    
    const isValidType = validTypes.includes(file.type) || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      alert('请选择有效的书签文件（JSON 或 HTML 格式）')
      return
    }

    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      await onImport(selectedFile, options)
      setSelectedFile(null)
      onClose()
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileType = (file: File): string => {
    if (file.name.toLowerCase().endsWith('.json')) return 'JSON'
    if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) return 'HTML'
    return 'Unknown'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            导入书签
          </h2>
          
          <div className="space-y-4">
            {/* 文件上传区域 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                选择文件：
              </label>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="text-green-600 dark:text-green-400">
                      ✅ {selectedFile.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {getFileType(selectedFile)} 格式 • {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      重新选择
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl">📁</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      拖拽文件到此处<br />
                      或点击选择文件
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      支持格式：JSON, HTML
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      选择文件
                    </button>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.html,.htm"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* 导入选项 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                导入选项：
              </label>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="importMode"
                    checked={options.merge}
                    onChange={() => setOptions(prev => ({ ...prev, merge: true }))}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">合并到现有数据</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      保留现有书签，添加新书签
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="importMode"
                    checked={!options.merge}
                    onChange={() => setOptions(prev => ({ ...prev, merge: false }))}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">覆盖现有数据</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      删除现有书签，仅保留导入的书签
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.makePrivate}
                    onChange={(e) => setOptions(prev => ({ ...prev, makePrivate: e.target.checked }))}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">导入为私密书签</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      所有导入的书签将标记为私密
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>导入中...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>导入</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
