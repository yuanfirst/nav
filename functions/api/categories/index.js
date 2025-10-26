// GET all categories
export async function onRequestGet(context) {
  const { env, request } = context;
  
  try {
    // 检查是否已登录
    const authHeader = request.headers.get('Authorization');
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');
    
    // 获取 publicMode 设置
    const publicModeSetting = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?'
    ).bind('publicMode').first();
    
    const publicMode = publicModeSetting?.value !== 'false';
    
    // 如果是非公开模式且未登录，返回空数组
    if (!publicMode && !isAuthenticated) {
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { results } = await env.DB.prepare(`
      SELECT * FROM categories ORDER BY position
    `).all();
    
    return new Response(JSON.stringify({ data: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST create category
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { name } = await request.json();
    
    // 获取最大position
    const { position: maxPosition } = await env.DB.prepare(
      'SELECT COALESCE(MAX(position), -1) as position FROM categories'
    ).first();
    
    const newPosition = (maxPosition || -1) + 1;
    
    const result = await env.DB.prepare(
      'INSERT INTO categories (name, position) VALUES (?, ?)'
    ).bind(name, newPosition).run();
    
    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

