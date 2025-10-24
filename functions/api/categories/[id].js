// PUT update category
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;
  
  try {
    const { name } = await request.json();
    
    await env.DB.prepare(
      'UPDATE categories SET name = ? WHERE id = ?'
    ).bind(name, id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE category (cascade delete bookmarks)
export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;
  
  try {
    // D1支持外键级联删除
    await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

