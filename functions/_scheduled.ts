export const onScheduled: PagesFunction<Env> = async (event, env, ctx) => {
  // Safety: keep only last 10 backups
  const indexRaw = await env.BOOKMARKS_KV.get('bookmarks:backup:index')
  const index: string[] = indexRaw ? JSON.parse(indexRaw) : []
  if (index.length <= 10) return
  const toDelete = index.slice(10)
  for (const key of toDelete) {
    await env.BOOKMARKS_KV.delete(key)
  }
  const trimmed = index.slice(0, 10)
  await env.BOOKMARKS_KV.put('bookmarks:backup:index', JSON.stringify(trimmed))
}

type Env = {
  BOOKMARKS_KV: KVNamespace
}
