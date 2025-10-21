import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'classnames'

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              应用出现错误
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              页面遇到了一个错误，请刷新页面重试
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 现代模态组件
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <span className="text-gray-500 dark:text-gray-400 text-lg">✕</span>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// 输入表单组件
function InputForm({ 
  title, 
  placeholder, 
  value, 
  onChange, 
  type = "text",
  required = false 
}: { 
  title: string; 
  placeholder: string; 
  value: string; 
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        autoFocus
      />
    </div>
  )
}

// 确认对话框组件
function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "确认", 
  cancelText = "取消",
  type = "danger" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}) {
  const iconMap = {
    danger: "⚠️",
    warning: "⚠️", 
    info: "ℹ️"
  }

  const buttonClass = {
    danger: "btn-danger",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    info: "btn-primary"
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="text-4xl mb-4">{iconMap[type]}</div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${buttonClass[type]} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Types sync with backend
export type Category = { id: string; name: string; order: number; visibility?: 'public' | 'private' }
export type Bookmark = {
  id: string
  categoryId: string
  title: string
  url: string
  description?: string
  iconUrl?: string
  isPrivate?: boolean
  order: number
  createdAt: string
  updatedAt: string
}
export type Dataset = { version: number; categories: Category[]; bookmarks: Bookmark[]; updatedAt: string }

// 统一规范化 URL，缺少协议时自动补全为 https
function normalizeUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return `https://${trimmed}`
}

function getFaviconUrl(bookmark: Bookmark): string {
  // 如果用户自定义了图标，优先使用
  if (bookmark.iconUrl && bookmark.iconUrl.trim()) {
    return bookmark.iconUrl;
  }
  
  try {
    // 验证 URL 是否有效
    if (!bookmark.url || typeof bookmark.url !== 'string' || bookmark.url.trim() === '') {
      return '/favicon.ico';
    }

    const url = new URL(normalizeUrl(bookmark.url));
    const hostname = url.hostname;
    
    // 验证 hostname 是否有效
    if (!hostname || hostname.trim() === '') {
      return '/favicon.ico';
    }
    
    return `https://www.faviconextractor.com/favicon/${hostname}`;
  } catch (error) {
    // URL 无效，返回默认图标
    console.warn('Invalid bookmark URL:', bookmark.url, error);
    return '/favicon.ico';
  }
}

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, setDark }
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>('')
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '0px 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids.join('|')])
  return active
}

function useDataset() {
  const [loading, setLoading] = useState(true)
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [authed, setAuthed] = useState(false)

  const load = async (all = false) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookmarks${all ? '?visibility=all' : ''}`)
      if (res.status === 401) {
        setAuthed(false)
        const res2 = await fetch('/api/bookmarks')
        const data2 = await res2.json()
        setDataset(data2)
        setLoading(false)
        return
      }
      const data = await res.json()
      setDataset(data)
      setAuthed(all)
      setLoading(false)
    } catch (error) {
      console.error('加载数据失败:', error)
      setLoading(false)
    }
  }

  // 检查登录状态
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/bookmarks?visibility=all')
      if (res.ok) {
        setAuthed(true)
        return true
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
    setAuthed(false)
    return false
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // 直接获取公开书签，避免权限问题
        const res = await fetch('/api/bookmarks')
        const data = await res.json()
        setDataset(data)
        setAuthed(false)
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  return { loading, dataset, setDataset, authed, reload: load }
}

function SortableCategory({ category, bookmarks, onEdit, onDelete, onAddBookmark, dragging, showActions = false, activeSection, bookmarksByCat, onEditBookmark, onDeleteBookmark }: { 
  category: Category; 
  bookmarks: Bookmark[]; 
  onEdit: () => void; 
  onDelete: () => void; 
  onAddBookmark: () => void;
  dragging?: boolean; 
  showActions?: boolean;
  activeSection: string;
  bookmarksByCat: Record<string, Bookmark[]>;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmark: Bookmark) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties

  return (
    <section 
      ref={setNodeRef}
      style={style}
      id={`cat-${category.id}`} 
      className={clsx(
        "mb-8 scroll-mt-24 animate-fade-in-up",
        (isDragging || dragging) && 'opacity-50 scale-95 shadow-lg'
      )}
      {...attributes} {...listeners}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{category.name}</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full flex-shrink-0">
            {bookmarksByCat[category.id]?.length || 0}
          </span>
          {showActions && (
            <div className="flex gap-1 ml-2 flex-shrink-0">
              <button 
                onClick={onEdit} 
                className="text-xs px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors duration-200"
                title="编辑分类"
              >
                ✏️
              </button>
              <button 
                onClick={onDelete} 
                className="text-xs px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 transition-colors duration-200"
                title="删除分类"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
        {showActions && (
          <button 
            onClick={onAddBookmark} 
            className="text-xs px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 transition-colors duration-200 flex-shrink-0"
          >
            ➕ <span className="hidden sm:inline">添加</span>
          </button>
        )}
      </div>
      
      <SortableContext items={bookmarks.map((b) => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-3">
          {bookmarks.map((b, cardIndex) => (
            <div 
              key={b.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(cardIndex * 0.05)}s` }}
            >
              <SortableCard 
                bookmark={b} 
                onEdit={() => onEditBookmark(b)} 
                onDelete={() => onDeleteBookmark(b)} 
                dragging={false}
                showActions={showActions}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableCard({ bookmark, onEdit, onDelete, dragging, showActions = false }: { bookmark: Bookmark; onEdit: () => void; onDelete: () => void; dragging?: boolean; showActions?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: bookmark.id })
  const [faviconError, setFaviconError] = useState(false)
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState<string>('')
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties

  // 默认 SVG 图标
  const defaultIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>' +
    '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>' +
    '</svg>'

  // 处理卡片点击跳转
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是编辑删除按钮，不跳转
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    // 在管理模式下禁用跳转
    if (showActions) {
      return
    }
    // 跳转到书签URL
    const targetUrl = normalizeUrl(bookmark.url)
    if (!targetUrl) return
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  // 处理 favicon 加载错误
  const handleFaviconError = () => {
    if (!faviconError) {
      // 创建默认 SVG 图标
      const svgBlob = new Blob([defaultIconSVG], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)
      setCurrentFaviconUrl(svgUrl)
      setFaviconError(true)
      
      // 清理 URL 对象
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl)
      }, 1000)
    }
  }

  // 初始化 favicon URL
  React.useEffect(() => {
    if (!currentFaviconUrl) {
      setCurrentFaviconUrl(getFaviconUrl(bookmark))
    }
  }, [bookmark, currentFaviconUrl])

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={clsx(
        'group relative rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white/90 dark:bg-gray-800/90 glass shadow-sm hover:shadow-md card-hover transition-all duration-200 h-full flex items-center gap-3',
        (isDragging || dragging) && 'opacity-50 scale-95 shadow-lg',
        !showActions && 'cursor-pointer'
      )}
      onClick={handleCardClick}
      {...attributes} {...listeners}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={currentFaviconUrl || getFaviconUrl(bookmark)} 
          alt="" 
          className="w-8 h-8 rounded group-hover:scale-105 transition-transform duration-200" 
          onError={handleFaviconError}
        />
        {bookmark.isPrivate && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-amber-800">🔒</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            title={bookmark.description || ''} 
            className="font-medium text-gray-900 dark:text-white line-clamp-1 transition-colors duration-200 text-sm sm:text-base"
          >
            {bookmark.title}
          </span>
          {bookmark.isPrivate && (
            <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 whitespace-nowrap flex-shrink-0">
              🔒
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate min-w-0">
            {bookmark.description ? bookmark.description : (() => {
              try {
                return new URL(normalizeUrl(bookmark.url)).hostname;
              } catch {
                return bookmark.url; // 如果URL无效，显示原始URL
              }
            })()}
          </span>
          {showActions && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }} 
                className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300"
              >
                ✏️
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }} 
                className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { dark, setDark } = useDarkMode()
  const { loading, dataset, setDataset, authed, reload } = useDataset()
  const [manage, setManage] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // 模态状态管理
  const [modals, setModals] = useState({
    login: false,
    addCategory: false,
    editCategory: false,
    addBookmark: false,
    editBookmark: false,
    deleteBookmark: false,
    deleteCategory: false,
    backupManager: false,
    configHelp: false,
    confirm: false
  })
  
  // 表单数据
  const [formData, setFormData] = useState({
    password: '',
    categoryName: '',
    bookmarkTitle: '',
    bookmarkUrl: '',
    bookmarkDescription: '',
    bookmarkIconUrl: '',
    bookmarkIsPrivate: false,
    selectedCategoryId: '',
    selectedBookmark: null as Bookmark | null,
    selectedCategory: null as Category | null
  })
  
  // 确认对话框数据
  const [confirmData, setConfirmData] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' as 'danger' | 'warning' | 'info'
  })
  
  // 备份管理状态
  const [backups, setBackups] = useState<Array<{ key: string; timestamp: number }>>([])
  const [loadingBackups, setLoadingBackups] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  )

  const categories = useMemo(() => (dataset ? [...dataset.categories].sort((a, b) => a.order - b.order) : []), [dataset])
  const bookmarksByCat = useMemo(() => {
    const map: Record<string, Bookmark[]> = {}
    
    // 过滤掉无效的书签数据 - 只验证基本字段，不验证 URL 格式
    const validBookmarks = dataset?.bookmarks.filter((bookmark) => {
      // 只验证基本字段，URL 格式验证交给 getFaviconUrl 处理
      return bookmark.url && 
             typeof bookmark.url === 'string' && 
             bookmark.url.trim() !== '' &&
             bookmark.title && 
             typeof bookmark.title === 'string' && 
             bookmark.title.trim() !== '';
    }) || [];
    
    validBookmarks.forEach((b) => {
      map[b.categoryId] ||= []
      map[b.categoryId].push(b)
    })
    Object.values(map).forEach((list) => list.sort((a, b) => a.order - b.order))
    return map
  }, [dataset])

  const sectionIds = categories.map((c) => `cat-${c.id}`)
  const activeSection = useActiveSection(sectionIds)

  async function persistSort(nextMap: Record<string, Bookmark[]>) {
    const payload: Record<string, string[]> = {}
    Object.entries(nextMap).forEach(([catId, list]) => {
      payload[catId] = list.map((b) => b.id)
    })
    await fetch('/api/sort', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookmarksOrder: payload }) })
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }
  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over || !dataset) return
    const fromId = String(active.id)
    const toId = String(over.id)
    if (fromId === toId) return
    
    // Check if dragging categories
    const fromCategory = dataset.categories.find((c) => c.id === fromId)
    const toCategory = dataset.categories.find((c) => c.id === toId)
    
    if (fromCategory && toCategory) {
      // Category drag
      const newCategories = [...dataset.categories]
      const fromIndex = newCategories.findIndex((c) => c.id === fromId)
      const toIndex = newCategories.findIndex((c) => c.id === toId)
      const newList = arrayMove(newCategories, fromIndex, toIndex)
      newList.forEach((c, i) => (c.order = i))
      
      const next: Dataset = { ...dataset, categories: newList }
      setDataset(next)
      try {
        await fetch('/api/sort', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ categoriesOrder: newList.map(c => c.id) }) 
        })
      } catch (e) {
        // ignore
      }
      return
    }
    
    // Bookmark drag (existing logic)
    const from = dataset.bookmarks.find((b) => b.id === fromId)
    const to = dataset.bookmarks.find((b) => b.id === toId)
    if (!from || !to) return
    const map: Record<string, Bookmark[]> = {}
    dataset.bookmarks.forEach((b) => {
      map[b.categoryId] ||= []
      map[b.categoryId].push(b)
    })
    // Move within or across categories
    const fromList = map[from.categoryId].sort((a, b) => a.order - b.order)
    const toList = map[to.categoryId].sort((a, b) => a.order - b.order)
    const fromIndex = fromList.findIndex((b) => b.id === fromId)
    const toIndex = toList.findIndex((b) => b.id === toId)

    if (from.categoryId === to.categoryId) {
      const newList = arrayMove(fromList, fromIndex, toIndex)
      newList.forEach((b, i) => (b.order = i))
      map[from.categoryId] = newList
    } else {
      // remove from source
      fromList.splice(fromIndex, 1)
      fromList.forEach((b, i) => (b.order = i))
      // insert into target list near toIndex
      from.categoryId = to.categoryId
      toList.splice(toIndex, 0, from)
      toList.forEach((b, i) => (b.order = i))
      map[from.categoryId] = fromList
      map[to.categoryId] = toList
    }

    const next: Dataset = { ...dataset, bookmarks: Object.values(map).flat() }
    setDataset(next)
    try {
      await persistSort(map)
    } catch (e) {
      // ignore
    }
  }

  function openAddCategory() {
    setFormData(prev => ({ ...prev, categoryName: '' }))
    setModals(prev => ({ ...prev, addCategory: true }))
  }

  async function addCategory() {
    if (!formData.categoryName.trim()) return
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formData.categoryName }) })
      if (!res.ok) {
        const error = await res.json()
        showConfirm('添加失败', `添加分类失败: ${error.error || '未知错误'}`, 'warning')
        return
      }
      setModals(prev => ({ ...prev, addCategory: false }))
      showConfirm('添加成功', '分类添加成功！', 'info')
      reload(true)
    } catch (error) {
      showConfirm('添加失败', `添加分类失败: ${error}`, 'warning')
    }
  }

  function openEditCategory(category: Category) {
    setFormData(prev => ({ 
      ...prev, 
      categoryName: category.name,
      selectedCategory: category
    }))
    setModals(prev => ({ ...prev, editCategory: true }))
  }

  async function editCategory() {
    if (!formData.categoryName.trim() || !formData.selectedCategory) return
    try {
      const res = await fetch(`/api/categories/${formData.selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.categoryName })
      })
      if (!res.ok) {
        const error = await res.json()
        showConfirm('编辑失败', `编辑分类失败: ${error.error || '未知错误'}`, 'warning')
        return
      }
      setModals(prev => ({ ...prev, editCategory: false }))
      showConfirm('编辑成功', '分类编辑成功！', 'info')
      reload(true)
    } catch (error) {
      showConfirm('编辑失败', `编辑分类失败: ${error}`, 'warning')
    }
  }

  function openAddBookmark(categoryId: string) {
    setFormData(prev => ({ 
      ...prev, 
      bookmarkTitle: '',
      bookmarkUrl: '',
      bookmarkDescription: '',
      bookmarkIconUrl: '',
      bookmarkIsPrivate: false,
      selectedCategoryId: categoryId
    }))
    setModals(prev => ({ ...prev, addBookmark: true }))
  }

  async function addBookmark() {
    if (!formData.bookmarkTitle.trim() || !formData.bookmarkUrl.trim()) return
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categoryId: formData.selectedCategoryId, 
          title: formData.bookmarkTitle, 
          url: formData.bookmarkUrl, 
          description: formData.bookmarkDescription, 
          iconUrl: formData.bookmarkIconUrl,
          isPrivate: formData.bookmarkIsPrivate
        })
      })
      if (!res.ok) {
        const error = await res.json()
        showConfirm('添加失败', `添加书签失败: ${error.error || '未知错误'}`, 'warning')
        return
      }
      setModals(prev => ({ ...prev, addBookmark: false }))
      showConfirm('添加成功', '书签添加成功！', 'info')
      reload(true)
    } catch (error) {
      showConfirm('添加失败', `添加书签失败: ${error}`, 'warning')
    }
  }

  function openEditBookmark(bookmark: Bookmark) {
    setFormData(prev => ({ 
      ...prev, 
      bookmarkTitle: bookmark.title,
      bookmarkUrl: bookmark.url,
      bookmarkDescription: bookmark.description || '',
      bookmarkIconUrl: bookmark.iconUrl || '',
      bookmarkIsPrivate: bookmark.isPrivate || false,
      selectedBookmark: bookmark
    }))
    setModals(prev => ({ ...prev, editBookmark: true }))
  }

  async function editBookmark() {
    if (!formData.bookmarkTitle.trim() || !formData.bookmarkUrl.trim() || !formData.selectedBookmark) return
    try {
      const res = await fetch(`/api/bookmarks/${formData.selectedBookmark.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: formData.bookmarkTitle, 
          url: formData.bookmarkUrl, 
          description: formData.bookmarkDescription, 
          iconUrl: formData.bookmarkIconUrl, 
          isPrivate: formData.bookmarkIsPrivate 
        })
      })
      if (!res.ok) {
        const error = await res.json()
        showConfirm('编辑失败', `编辑书签失败: ${error.error || '未知错误'}`, 'warning')
        return
      }
      setModals(prev => ({ ...prev, editBookmark: false }))
      showConfirm('编辑成功', '书签编辑成功！', 'info')
      reload(true)
    } catch (error) {
      showConfirm('编辑失败', `编辑书签失败: ${error}`, 'warning')
    }
  }

  function openDeleteBookmark(bookmark: Bookmark) {
    setFormData(prev => ({ ...prev, selectedBookmark: bookmark }))
    setConfirmData({
      title: '确认删除',
      message: `确定要删除书签"${bookmark.title}"吗？此操作不可撤销。`,
      onConfirm: deleteBookmark,
      type: 'danger'
    })
    setModals(prev => ({ ...prev, confirm: true }))
  }

  // 打开删除分类模态
  function openDeleteCategory(category: Category) {
    setFormData(prev => ({ ...prev, selectedCategory: category }))
    setConfirmData({
      title: '确认删除分类',
      message: `确定要删除分类"${category.name}"吗？此分类下的所有书签也将被删除，此操作不可撤销。`,
      onConfirm: async () => {
        await deleteCategory(category)
      },
      type: 'danger'
    })
    setModals(prev => ({ ...prev, confirm: true }))
  }

  async function deleteBookmark() {
    if (!formData.selectedBookmark) return
    try {
      const res = await fetch(`/api/bookmarks/${formData.selectedBookmark.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        showConfirm('删除失败', `删除书签失败: ${error.error || '未知错误'}`, 'warning')
        return
      }
      setModals(prev => ({ ...prev, confirm: false }))
      showConfirm('删除成功', '书签删除成功！', 'info')
      reload(true)
    } catch (error) {
      showConfirm('删除失败', `删除书签失败: ${error}`, 'warning')
    }
  }

  // 删除分类
  async function deleteCategory(category: Category) {
    if (!category) {
      console.error('No category provided to delete')
      return
    }
    console.log('Deleting category:', category)
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' })
      console.log('Delete response status:', res.status)
      if (!res.ok) {
        const error = await res.json()
        console.error('Delete failed:', error)
        showConfirm('删除失败', `删除分类失败: ${error.error || '未知错误'}`, 'warning')
        return
      }
      setModals(prev => ({ ...prev, confirm: false }))
      showConfirm('删除成功', '分类删除成功！', 'info')
      reload(true)
    } catch (error) {
      console.error('Delete error:', error)
      showConfirm('删除失败', `删除分类失败: ${error}`, 'warning')
    }
  }

  function openLogin() {
    setFormData(prev => ({ ...prev, password: '' }))
    setModals(prev => ({ ...prev, login: true }))
  }

  async function login() {
    if (!formData.password.trim()) return
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: formData.password }) })
      if (res.ok) {
        setModals(prev => ({ ...prev, login: false }))
        showConfirm('登录成功', '欢迎回来！', 'info')
        reload(true)
      } else {
        const error = await res.json()
        showConfirm('登录失败', `登录失败: ${error.error || '未知错误'}`, 'warning')
      }
    } catch (error) {
      showConfirm('登录失败', `登录失败: ${error}`, 'warning')
    }
  }

  async function logout() {
    try {
      await fetch('/api/logout', { method: 'POST' })
      showConfirm('已退出登录', '您已成功退出登录', 'info')
      reload(false)
    } catch (error) {
      showConfirm('退出失败', `退出失败: ${error}`, 'warning')
    }
  }

  function openBackupManager() {
    setModals(prev => ({ ...prev, backupManager: true }))
    loadBackups()
  }

  async function loadBackups() {
    setLoadingBackups(true)
    try {
      const res = await fetch('/api/backups')
      if (res.ok) {
        const data = await res.json()
        setBackups(data.items || [])
      } else {
        showConfirm('加载失败', '无法加载备份列表', 'warning')
      }
    } catch (error) {
      showConfirm('加载失败', `加载备份列表失败: ${error}`, 'warning')
    } finally {
      setLoadingBackups(false)
    }
  }

  function openRestoreBackup(backup: { key: string; timestamp: number }) {
    const date = new Date(backup.timestamp).toLocaleString()
    setConfirmData({
      title: '确认恢复备份',
      message: `确定要恢复到备份 "${date}" 吗？当前数据将被覆盖，此操作不可撤销。`,
      onConfirm: () => restoreBackup(backup.key),
      type: 'warning'
    })
    setModals(prev => ({ ...prev, confirm: true }))
  }

  async function restoreBackup(key: string) {
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })
      if (res.ok) {
        setModals(prev => ({ ...prev, confirm: false }))
        showConfirm('恢复成功', '备份已成功恢复！', 'info')
        reload(true)
      } else {
        const error = await res.json()
        showConfirm('恢复失败', `恢复备份失败: ${error.error || '未知错误'}`, 'warning')
      }
    } catch (error) {
      showConfirm('恢复失败', `恢复备份失败: ${error}`, 'warning')
    }
  }

  function openConfigHelp() {
    setModals(prev => ({ ...prev, configHelp: true }))
  }

  // 显示确认对话框的辅助函数
  function showConfirm(title: string, message: string, type: 'danger' | 'warning' | 'info' = 'info') {
    setConfirmData({
      title,
      message,
      onConfirm: () => setModals(prev => ({ ...prev, confirm: false })),
      type
    })
    setModals(prev => ({ ...prev, confirm: true }))
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📚</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nav
                </h1>
              </div>
              <nav className="hidden md:flex items-center gap-1">
                {categories.map((c) => (
                  <a 
                    key={c.id}
                    href={`#cat-${c.id}`} 
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      activeSection === `cat-${c.id}` 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    )}
                  >
                    {c.name}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDark(!dark)} 
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title={dark ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {dark ? '☀️' : '🌙'}
              </button>
              
              {authed ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setManage((m) => !m)} 
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      manage 
                        ? 'btn-primary' 
                        : 'btn-secondary'
                    )}
                  >
                    {manage ? '✅ 管理' : '⚙️ 管理'}
                  </button>
                  {manage && (
                    <div className="hidden md:flex items-center gap-2">
                      <button 
                        onClick={openAddCategory} 
                        className="btn-primary text-xs flex items-center gap-1 px-3 py-2"
                      >
                        ➕ 新增分类
                      </button>
                      <button 
                        onClick={openBackupManager} 
                        className="btn-secondary text-xs flex items-center gap-1 px-3 py-2"
                      >
                        💾 备份管理
                      </button>
                      <button 
                        onClick={openConfigHelp} 
                        className="btn-secondary text-xs flex items-center gap-1 px-3 py-2"
                      >
                        ⚙️ 配置说明
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={logout} 
                    className="btn-secondary text-sm"
                  >
                    🚪 退出
                  </button>
                </div>
              ) : (
                <button 
                  onClick={openLogin} 
                  className="btn-primary text-sm"
                >
                  🔑 登录
                </button>
              )}
              
              <button 
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} 
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title="回到顶部"
              >
                ⬆️
              </button>
            </div>
          </div>
          
          {/* 移动端管理功能按钮 */}
          {authed && manage && (
            <div className="md:hidden mt-3">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                <button 
                  onClick={openAddCategory} 
                  className="btn-primary text-xs flex items-center gap-1 px-2.5 py-1.5 flex-shrink-0 rounded-md"
                >
                  ➕ 分类
                </button>
                <button 
                  onClick={openBackupManager} 
                  className="btn-secondary text-xs flex items-center gap-1 px-2.5 py-1.5 flex-shrink-0 rounded-md"
                >
                  💾 备份
                </button>
                <button 
                  onClick={openConfigHelp} 
                  className="btn-secondary text-xs flex items-center gap-1 px-2.5 py-1.5 flex-shrink-0 rounded-md"
                >
                  ⚙️ 配置
                </button>
              </div>
            </div>
          )}
          
          {/* 移动端导航 */}
          <div className="md:hidden mt-3">
            <nav className="flex gap-1 overflow-x-auto pb-2">
              {categories.map((c) => (
                <a 
                  key={c.id}
                  href={`#cat-${c.id}`} 
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                    activeSection === `cat-${c.id}` 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {c.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-pulse-slow"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 animate-fade-in-up">加载中...</p>
          </div>
        )}
        
        {!loading && dataset && (
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={rectSortingStrategy}>
              {categories.map((cat, index) => (
                <SortableCategory
                  key={cat.id}
                  category={cat}
                  bookmarks={bookmarksByCat[cat.id] || []}
                  onEdit={() => openEditCategory(cat)}
                  onDelete={() => openDeleteCategory(cat)}
                  onAddBookmark={() => openAddBookmark(cat.id)}
                  dragging={activeId === cat.id}
                  showActions={authed && manage}
                  activeSection={activeSection}
                  bookmarksByCat={bookmarksByCat}
                  onEditBookmark={openEditBookmark}
                  onDeleteBookmark={openDeleteBookmark}
                />
              ))}
            </SortableContext>
            <DragOverlay />
          </DndContext>
        )}

      </main>

      {/* 页脚 */}
      <footer className="bg-white/50 dark:bg-gray-900/50 glass border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Powered by</span>
              <span className="font-semibold">Nav</span>
              <span>•</span>
              <span>Built with Cloudflare Pages</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/deerwan/nav" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
              <a 
                href="https://github.com/deerwan/nav" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                deerwan/nav
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 登录模态 */}
      <Modal isOpen={modals.login} onClose={() => setModals(prev => ({ ...prev, login: false }))} title="登录管理">
        <div className="space-y-4">
          <InputForm
            title="管理密码"
            placeholder="请输入管理密码（默认 admin）"
            value={formData.password}
            onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            type="password"
            required
          />
          <div className="flex gap-3 justify-end items-center">
            <button
              onClick={() => setModals(prev => ({ ...prev, login: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              取消
            </button>
            <button
              onClick={login}
              className="btn-primary flex items-center justify-center min-h-[40px]"
            >
              登录
            </button>
          </div>
        </div>
      </Modal>

      {/* 添加分类模态 */}
      <Modal isOpen={modals.addCategory} onClose={() => setModals(prev => ({ ...prev, addCategory: false }))} title="添加分类">
        <div className="space-y-4">
          <InputForm
            title="分类名称"
            placeholder="请输入分类名称"
            value={formData.categoryName}
            onChange={(value) => setFormData(prev => ({ ...prev, categoryName: value }))}
            required
          />
          <div className="flex gap-3 justify-end items-center">
            <button
              onClick={() => setModals(prev => ({ ...prev, addCategory: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              取消
            </button>
            <button
              onClick={addCategory}
              className="btn-success flex items-center justify-center min-h-[40px]"
            >
              添加
            </button>
          </div>
        </div>
      </Modal>

      {/* 编辑分类模态 */}
      <Modal isOpen={modals.editCategory} onClose={() => setModals(prev => ({ ...prev, editCategory: false }))} title="编辑分类">
        <div className="space-y-4">
          <InputForm
            title="分类名称"
            placeholder="请输入分类名称"
            value={formData.categoryName}
            onChange={(value) => setFormData(prev => ({ ...prev, categoryName: value }))}
            required
          />
          <div className="flex gap-3 justify-end items-center">
            <button
              onClick={() => setModals(prev => ({ ...prev, editCategory: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              取消
            </button>
            <button
              onClick={editCategory}
              className="btn-primary flex items-center justify-center min-h-[40px]"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      {/* 添加书签模态 */}
      <Modal isOpen={modals.addBookmark} onClose={() => setModals(prev => ({ ...prev, addBookmark: false }))} title="添加书签">
        <div className="space-y-4">
          <InputForm
            title="书签名称"
            placeholder="请输入书签名称"
            value={formData.bookmarkTitle}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkTitle: value }))}
            required
          />
          <InputForm
            title="网址"
            placeholder="https://example.com"
            value={formData.bookmarkUrl}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkUrl: value }))}
            type="url"
            required
          />
          <InputForm
            title="描述"
            placeholder="请输入书签描述（可选）"
            value={formData.bookmarkDescription}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkDescription: value }))}
          />
          <InputForm
            title="图标 URL"
            placeholder="不填写则自动获取"
            value={formData.bookmarkIconUrl}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkIconUrl: value }))}
            type="url"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.bookmarkIsPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, bookmarkIsPrivate: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300">
              设为私密书签
            </label>
          </div>
          <div className="flex gap-3 justify-end items-center">
            <button
              onClick={() => setModals(prev => ({ ...prev, addBookmark: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              取消
            </button>
            <button
              onClick={addBookmark}
              className="btn-success flex items-center justify-center min-h-[40px]"
            >
              添加
            </button>
          </div>
        </div>
      </Modal>

      {/* 编辑书签模态 */}
      <Modal isOpen={modals.editBookmark} onClose={() => setModals(prev => ({ ...prev, editBookmark: false }))} title="编辑书签">
        <div className="space-y-4">
          <InputForm
            title="书签名称"
            placeholder="请输入书签名称"
            value={formData.bookmarkTitle}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkTitle: value }))}
            required
          />
          <InputForm
            title="网址"
            placeholder="https://example.com"
            value={formData.bookmarkUrl}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkUrl: value }))}
            type="url"
            required
          />
          <InputForm
            title="描述"
            placeholder="请输入书签描述（可选）"
            value={formData.bookmarkDescription}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkDescription: value }))}
          />
          <InputForm
            title="图标 URL"
            placeholder="不填写则自动获取"
            value={formData.bookmarkIconUrl}
            onChange={(value) => setFormData(prev => ({ ...prev, bookmarkIconUrl: value }))}
            type="url"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editIsPrivate"
              checked={formData.bookmarkIsPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, bookmarkIsPrivate: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="editIsPrivate" className="text-sm text-gray-700 dark:text-gray-300">
              设为私密书签
            </label>
          </div>
          <div className="flex gap-3 justify-end items-center">
            <button
              onClick={() => setModals(prev => ({ ...prev, editBookmark: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              取消
            </button>
            <button
              onClick={editBookmark}
              className="btn-primary flex items-center justify-center min-h-[40px]"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      {/* 备份管理模态 */}
      <Modal isOpen={modals.backupManager} onClose={() => setModals(prev => ({ ...prev, backupManager: false }))} title="备份管理">
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">备份列表</h4>
            <button
              onClick={loadBackups}
              disabled={loadingBackups}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors duration-200 disabled:opacity-50 flex-shrink-0"
            >
              {loadingBackups ? '加载中...' : '🔄 刷新'}
            </button>
          </div>
          
          {loadingBackups ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-gray-500 dark:text-gray-400">暂无备份</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">系统会自动创建备份</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {backups.map((backup, index) => (
                <div
                  key={backup.key}
                  className="flex items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {new Date(backup.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {backup.key}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openRestoreBackup(backup)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 transition-colors duration-200 flex-shrink-0"
                  >
                    🔄 恢复
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3 justify-end items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModals(prev => ({ ...prev, backupManager: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              关闭
            </button>
          </div>
        </div>
      </Modal>

      {/* 配置说明模态 */}
      <Modal isOpen={modals.configHelp} onClose={() => setModals(prev => ({ ...prev, configHelp: false }))} title="配置说明">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              💾 备份管理说明
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                系统已内置智能备份管理，无需额外配置：
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
                <li><strong>自动备份</strong>：每次数据变更都会自动创建备份</li>
                <li><strong>智能清理</strong>：系统自动保留最近 10 个备份，删除旧备份</li>
                <li><strong>手动管理</strong>：通过"备份管理"界面查看和恢复任意备份</li>
                <li><strong>零配置</strong>：无需设置定时任务，系统自动工作</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🔐 Cloudflare Access 集成
            </h4>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                如果您希望使用 Cloudflare Access 进行统一身份验证：
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                <li>在 Cloudflare 控制台中，进入 <strong>Access</strong> → <strong>Applications</strong></li>
                <li>创建新应用，选择 <strong>Self-hosted</strong></li>
                <li>设置域名和路径（如：<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs sm:text-sm">your-domain.com/*</code>）</li>
                <li>配置访问策略，添加允许的用户或组</li>
                <li>系统会自动检测 Access JWT 并跳过自建登录</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🚀 快速部署配置
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                部署到 Cloudflare Pages 的必需配置：
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                <li><strong>连接 GitHub 仓库</strong>：在 Pages 中连接您的 GitHub 仓库</li>
                <li><strong>绑定 KV 存储</strong>：创建 KV 命名空间，绑定变量名 <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">BOOKMARKS_KV</code></li>
                <li><strong>设置环境变量</strong>：在 Pages 项目设置中添加环境变量</li>
                <li><strong>部署完成</strong>：系统自动构建和部署</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              📝 环境变量说明
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
              <div className="space-y-3">
                <div>
                  <code className="text-xs sm:text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded break-all">JWT_SECRET</code>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">JWT 签名密钥，建议使用强随机字符串</p>
                </div>
                <div>
                  <code className="text-xs sm:text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded break-all">ADMIN_PASSWORD</code>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">管理密码，默认为 "admin"</p>
                </div>
                <div>
                  <code className="text-xs sm:text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded break-all">JWT_EXPIRES_IN</code>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">JWT 过期时间（秒），默认 900 秒（15分钟）</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModals(prev => ({ ...prev, configHelp: false }))}
              className="btn-secondary flex items-center justify-center min-h-[40px]"
            >
              关闭
            </button>
          </div>
        </div>
      </Modal>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={modals.confirm}
        onClose={() => setModals(prev => ({ ...prev, confirm: false }))}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
      />
    </div>
  )
}

// 用错误边界包装主应用
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}



