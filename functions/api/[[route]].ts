import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { jwtVerify, SignJWT } from 'jose'
import { nanoid } from 'nanoid'

// Types (lightweight to avoid extra deps)
type Category = {
  id: string
  name: string
  order: number
  visibility?: 'public' | 'private'
}

type Bookmark = {
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

type Dataset = {
  version: number
  categories: Category[]
  bookmarks: Bookmark[]
  updatedAt: string
}

type Bindings = {
  BOOKMARKS_KV: KVNamespace
  JWT_SECRET?: string
  ADMIN_PASSWORD?: string
  JWT_EXPIRES_IN?: string
}

type Variables = {
  isAuthed: boolean
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const textKey = (secret: string) => new TextEncoder().encode(secret)

async function signToken(secret: string, payload: object, expSeconds = 900) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expSeconds}s`)
    .sign(textKey(secret))
  return token
}

async function verifyToken(secret: string, token: string) {
  const { payload } = await jwtVerify(token, textKey(secret))
  return payload
}

async function getCurrent(c: any): Promise<Dataset> {
  const raw = await c.env.BOOKMARKS_KV.get('bookmarks:current')
  if (raw) return JSON.parse(raw)
  const now = new Date().toISOString()
  const seed: Dataset = {
    version: 1,
    updatedAt: now,
    categories: [
      { id: nanoid(), name: '默认', order: 0 },
      { id: nanoid(), name: '工作', order: 1 },
      { id: nanoid(), name: '学习', order: 2 }
    ],
    bookmarks: []
  }
  await c.env.BOOKMARKS_KV.put('bookmarks:current', JSON.stringify(seed))
  return seed
}

async function saveCurrent(c: any, data: Dataset, makeBackup = true) {
  const next = { ...data, version: (data.version || 0) + 1, updatedAt: new Date().toISOString() }
  await c.env.BOOKMARKS_KV.put('bookmarks:current', JSON.stringify(next))
  if (makeBackup) await backup(c, next)
  return next
}

async function backup(c: any, data: Dataset) {
  const key = `bookmarks:backup:${Date.now()}`
  await c.env.BOOKMARKS_KV.put(key, JSON.stringify(data))
  const indexRaw = await c.env.BOOKMARKS_KV.get('bookmarks:backup:index')
  const index: string[] = indexRaw ? JSON.parse(indexRaw) : []
  index.unshift(key)
  // keep only last 10
  const toDelete = index.slice(10)
  for (const k of toDelete) {
    await c.env.BOOKMARKS_KV.delete(k)
  }
  const trimmed = index.slice(0, 10)
  await c.env.BOOKMARKS_KV.put('bookmarks:backup:index', JSON.stringify(trimmed))
}

function filterVisibility(data: Dataset, includePrivate: boolean): Dataset {
  if (includePrivate) return data
  const filtered: Dataset = {
    ...data,
    bookmarks: data.bookmarks.filter((b) => !b.isPrivate)
  }
  return filtered
}

async function requireAuth(c: any, next: any) {
  // Cloudflare Access support: if Access JWT header present, treat as authenticated
  const accessJwt = c.req.header('cf-access-jwt-assertion')
  if (accessJwt) {
    c.set('isAuthed', true)
    return next()
  }
  // Fallback to custom JWT in cookie
  const token = getCookie(c, 'auth')
  const secret = c.env.JWT_SECRET || 'dev-secret'
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  try {
    await verifyToken(secret, token)
    c.set('isAuthed', true)
    return next()
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}

app.get('/api/health', (c) => c.json({ ok: true }))

app.post('/api/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const password = (body && body.password) || ''
  const expected = c.env.ADMIN_PASSWORD || 'admin'
  if (password !== expected) return c.json({ error: 'Invalid credentials' }, 401)
  const secret = c.env.JWT_SECRET || 'dev-secret'
  const expSeconds = parseInt(c.env.JWT_EXPIRES_IN || '900', 10)
  const token = await signToken(secret, { role: 'admin' }, expSeconds)
  setCookie(c, 'auth', token, {
    httpOnly: true,
    secure: false, // 改为false，支持HTTP环境
    sameSite: 'Lax',
    path: '/',
    maxAge: expSeconds
  })
  return c.json({ ok: true, expiresIn: expSeconds })
})

app.post('/api/logout', (c) => {
  deleteCookie(c, 'auth', { path: '/' })
  return c.json({ ok: true })
})

app.get('/api/bookmarks', async (c) => {
  const visibility = c.req.query('visibility') || 'public'
  const includePrivate = visibility === 'all'
  if (includePrivate) {
    // soft auth check: allow includePrivate only when authenticated
    const accessJwt = c.req.header('cf-access-jwt-assertion')
    const token = getCookie(c, 'auth')
    if (!accessJwt && !token) return c.json({ error: 'Unauthorized' }, 401)
  }
  const data = await getCurrent(c)
  const filtered = filterVisibility(data, includePrivate)
  return c.json(filtered)
})

app.post('/api/bookmarks', requireAuth, async (c) => {
  const body = await c.req.json()
  const data = await getCurrent(c)
  const now = new Date().toISOString()
  const bookmark: Bookmark = {
    id: nanoid(),
    categoryId: body.categoryId,
    title: body.title,
    url: body.url,
    description: body.description || '',
    iconUrl: body.iconUrl || '',
    isPrivate: !!body.isPrivate,
    order: data.bookmarks.length,
    createdAt: now,
    updatedAt: now
  }
  data.bookmarks.push(bookmark)
  const saved = await saveCurrent(c, data)
  return c.json({ ok: true, bookmark, version: saved.version })
})

app.put('/api/bookmarks/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = await getCurrent(c)
  const idx = data.bookmarks.findIndex((b) => b.id === id)
  if (idx === -1) return c.json({ error: 'Not found' }, 404)
  const prev = data.bookmarks[idx]
  data.bookmarks[idx] = {
    ...prev,
    ...body,
    updatedAt: new Date().toISOString()
  }
  const saved = await saveCurrent(c, data)
  return c.json({ ok: true, bookmark: data.bookmarks[idx], version: saved.version })
})

app.delete('/api/bookmarks/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const data = await getCurrent(c)
  const idx = data.bookmarks.findIndex((b) => b.id === id)
  if (idx === -1) return c.json({ error: 'Not found' }, 404)
  data.bookmarks.splice(idx, 1)
  // Recompute order within category
  const byCat: Record<string, Bookmark[]> = {}
  for (const b of data.bookmarks) {
    byCat[b.categoryId] ||= []
    byCat[b.categoryId].push(b)
  }
  for (const catId of Object.keys(byCat)) {
    byCat[catId]
      .sort((a, b) => a.order - b.order)
      .forEach((b, i) => (b.order = i))
  }
  const saved = await saveCurrent(c, data)
  return c.json({ ok: true, version: saved.version })
})

app.post('/api/categories', requireAuth, async (c) => {
  const body = await c.req.json()
  const data = await getCurrent(c)
  
  // 检查分类名称是否已存在
  const existingCategory = data.categories.find((cat) => cat.name === body.name)
  if (existingCategory) {
    return c.json({ error: '分类名称已存在，请使用其他名称' }, 400)
  }
  
  const cat: Category = {
    id: nanoid(),
    name: body.name || '未命名',
    order: data.categories.length,
    visibility: body.visibility === 'private' ? 'private' : 'public'
  }
  data.categories.push(cat)
  const saved = await saveCurrent(c, data)
  return c.json({ ok: true, category: cat, version: saved.version })
})

app.put('/api/categories/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const data = await getCurrent(c)
  const cat = data.categories.find((x) => x.id === id)
  if (!cat) return c.json({ error: 'Not found' }, 404)
  
  // 如果要更新名称，检查是否与其他分类重名
  if (typeof body.name === 'string' && body.name !== cat.name) {
    const existingCategory = data.categories.find((c) => c.name === body.name && c.id !== id)
    if (existingCategory) {
      return c.json({ error: '分类名称已存在，请使用其他名称' }, 400)
    }
    cat.name = body.name
  }
  
  if (body.visibility === 'public' || body.visibility === 'private') cat.visibility = body.visibility
  if (typeof body.order === 'number') cat.order = body.order
  const saved = await saveCurrent(c, data)
  return c.json({ ok: true, category: cat, version: saved.version })
})

app.delete('/api/categories/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const data = await getCurrent(c)
  const catIndex = data.categories.findIndex((x) => x.id === id)
  if (catIndex === -1) return c.json({ error: 'Category not found' }, 404)
  
  // 删除该分类下的所有书签
  data.bookmarks = data.bookmarks.filter((b) => b.categoryId !== id)
  
  // 删除分类
  data.categories.splice(catIndex, 1)
  
  // 重新排序剩余分类
  data.categories.forEach((cat, index) => {
    cat.order = index
  })
  
  const saved = await saveCurrent(c, data)
  return c.json({ ok: true, version: saved.version })
})

app.post('/api/sort', requireAuth, async (c) => {
  const body = await c.req.json()
  const data = await getCurrent(c)
  if (Array.isArray(body.categoriesOrder)) {
    const idToOrder: Record<string, number> = {}
    body.categoriesOrder.forEach((id: string, i: number) => (idToOrder[id] = i))
    data.categories.forEach((cat) => {
      if (idToOrder[cat.id] !== undefined) cat.order = idToOrder[cat.id]
    })
  }
  if (body.bookmarksOrder && typeof body.bookmarksOrder === 'object') {
    const map = body.bookmarksOrder as Record<string, string[]>
    for (const [catId, ids] of Object.entries(map)) {
      const list = data.bookmarks.filter((b) => b.categoryId === catId)
      const idToBookmark: Record<string, Bookmark> = {}
      list.forEach((b) => (idToBookmark[b.id] = b))
      ids.forEach((id, i) => {
        const b = idToBookmark[id]
        if (b) b.order = i
      })
    }
  }
  const saved = await saveCurrent(c, data, false)
  await backup(c, saved)
  return c.json({ ok: true, version: saved.version })
})

app.get('/api/backups', requireAuth, async (c) => {
  const raw = await c.env.BOOKMARKS_KV.get('bookmarks:backup:index')
  const index: string[] = raw ? JSON.parse(raw) : []
  const items = index.map((k) => ({ key: k, timestamp: parseInt(k.split(':').pop() || '0', 10) }))
  return c.json({ items })
})

app.post('/api/backups/restore', requireAuth, async (c) => {
  const body = await c.req.json()
  const key = body && body.key
  if (!key || typeof key !== 'string') return c.json({ error: 'Invalid key' }, 400)
  const raw = await c.env.BOOKMARKS_KV.get(key)
  if (!raw) return c.json({ error: 'Not found' }, 404)
  const snapshot: Dataset = JSON.parse(raw)
  await c.env.BOOKMARKS_KV.put('bookmarks:current', raw)
  await backup(c, snapshot)
  return c.json({ ok: true })
})

export const onRequest = handle(app)
