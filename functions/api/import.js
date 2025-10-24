// POST batch import bookmarks and categories
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { categories, bookmarks } = await request.json();
    
    if (!categories || !bookmarks) {
      return new Response(JSON.stringify({ error: 'Invalid data format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let importedCategories = 0;
    let importedBookmarks = 0;
    let skippedCategories = 0;
    let skippedBookmarks = 0;
    
    // 先导入分类
    const categoryMapping = {}; // 旧ID -> 新ID 的映射
    
    for (const category of categories) {
      try {
        // 检查分类是否已存在
        const existing = await env.DB.prepare(
          'SELECT id FROM categories WHERE name = ?'
        ).bind(category.name).first();
        
        if (existing) {
          // 分类已存在，记录映射
          categoryMapping[category.id] = existing.id;
          skippedCategories++;
        } else {
          // 创建新分类
          const result = await env.DB.prepare(
            'INSERT INTO categories (name, position) VALUES (?, ?)'
          ).bind(category.name, category.position || 0).run();
          
          categoryMapping[category.id] = result.meta.last_row_id;
          importedCategories++;
        }
      } catch (error) {
        console.error('Failed to import category:', category.name, error);
        skippedCategories++;
      }
    }
    
    // 再导入书签
    for (const bookmark of bookmarks) {
      try {
        // 获取新的 category_id
        const newCategoryId = categoryMapping[bookmark.category_id];
        
        if (!newCategoryId) {
          console.error('Category mapping not found for bookmark:', bookmark.name, 'category_id:', bookmark.category_id);
          console.error('Available mappings:', categoryMapping);
          skippedBookmarks++;
          continue;
        }
        
        // 检查书签是否已存在（通过URL判断）
        const existing = await env.DB.prepare(
          'SELECT id FROM bookmarks WHERE url = ?'
        ).bind(bookmark.url).first();
        
        if (existing) {
          skippedBookmarks++;
          continue;
        }
        
        // 获取该分类下当前的最大position
        const { maxPos } = await env.DB.prepare(
          'SELECT COALESCE(MAX(position), -1) as maxPos FROM bookmarks WHERE category_id = ?'
        ).bind(newCategoryId).first();
        
        const newPosition = (maxPos || -1) + 1;
        
        // 创建新书签
        await env.DB.prepare(
          'INSERT INTO bookmarks (name, url, description, icon, category_id, position, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          bookmark.name,
          bookmark.url,
          bookmark.description || null,
          bookmark.icon || null,
          newCategoryId,
          newPosition,
          bookmark.is_private || 0
        ).run();
        
        importedBookmarks++;
      } catch (error) {
        console.error('Failed to import bookmark:', bookmark.name, error);
        skippedBookmarks++;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      imported: {
        categories: importedCategories,
        bookmarks: importedBookmarks
      },
      skipped: {
        categories: skippedCategories,
        bookmarks: skippedBookmarks
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Import failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

