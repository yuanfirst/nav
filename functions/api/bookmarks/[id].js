// PUT update bookmark
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;
  
  try {
    const { name, url, description, icon, category_id, is_private } = await request.json();
    const isPrivate = is_private ? 1 : 0;
    
    await env.DB.prepare(
      'UPDATE bookmarks SET name = ?, url = ?, description = ?, icon = ?, category_id = ?, is_private = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, url, description || null, icon || null, category_id, isPrivate, id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update bookmark' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE bookmark
export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;
  
  try {
    await env.DB.prepare('DELETE FROM bookmarks WHERE id = ?').bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete bookmark' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

