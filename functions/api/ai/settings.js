export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const results = await env.DB.prepare(
      'SELECT key, value FROM settings WHERE key IN (?, ?, ?, ?, ?)'
    ).bind('secret_openai_api_key', 'ai_base_url', 'ai_model', 'ai_auth_header', 'ai_auth_prefix').all();
    
    const settings = {};
    results.results.forEach(row => {
      settings[row.key] = row.value;
    });
    
    return new Response(JSON.stringify({
      success: true,
      apiKey: settings.secret_openai_api_key ? '••••••••' : '',
      baseUrl: settings.ai_base_url || 'https://api.openai.com/v1',
      model: settings.ai_model || 'gpt-4o-mini',
      authHeader: settings.ai_auth_header || 'Authorization',
      authPrefix: settings.ai_auth_prefix !== undefined ? settings.ai_auth_prefix : 'Bearer ',
      hasApiKey: !!settings.secret_openai_api_key
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch AI settings' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { apiKey, baseUrl, model, authHeader, authPrefix } = await request.json();
    
    const statements = [];
    
    if (apiKey !== undefined && apiKey !== '••••••••') {
      if (apiKey) {
        statements.push(
          env.DB.prepare(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
          ).bind('secret_openai_api_key', apiKey)
        );
      } else {
        statements.push(
          env.DB.prepare('DELETE FROM settings WHERE key = ?')
            .bind('secret_openai_api_key')
        );
      }
    }
    
    if (baseUrl !== undefined) {
      if (baseUrl) {
        statements.push(
          env.DB.prepare(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
          ).bind('ai_base_url', baseUrl)
        );
      } else {
        statements.push(
          env.DB.prepare('DELETE FROM settings WHERE key = ?')
            .bind('ai_base_url')
        );
      }
    }
    
    if (model !== undefined) {
      if (model) {
        statements.push(
          env.DB.prepare(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
          ).bind('ai_model', model)
        );
      } else {
        statements.push(
          env.DB.prepare('DELETE FROM settings WHERE key = ?')
            .bind('ai_model')
        );
      }
    }
    
    if (authHeader !== undefined) {
      if (authHeader) {
        statements.push(
          env.DB.prepare(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
          ).bind('ai_auth_header', authHeader)
        );
      } else {
        statements.push(
          env.DB.prepare('DELETE FROM settings WHERE key = ?')
            .bind('ai_auth_header')
        );
      }
    }
    
    if (authPrefix !== undefined) {
      statements.push(
        env.DB.prepare(
          'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
        ).bind('ai_auth_prefix', authPrefix)
      );
    }
    
    if (statements.length > 0) {
      await env.DB.batch(statements);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to update AI settings' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
