// JWT验证中间件
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // 添加安全响应头
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
  
  // 登录接口不需要验证
  if (url.pathname === '/api/login') {
    return await next();
  }
  
  // GET请求的bookmarks、categories和settings不需要登录即可访问（只读）
  if (request.method === 'GET' && 
      (url.pathname === '/api/bookmarks' || 
       url.pathname === '/api/categories' ||
       url.pathname === '/api/fetch-metadata' ||
       url.pathname === '/api/settings')) {
    return await next();
  }
  
  // settings API 的 POST 请求需要认证（修改设置）
  if (url.pathname === '/api/settings' && request.method === 'POST') {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    
    // 简单的token验证（时间戳 + 密钥哈希）
    try {
      const [timestamp, hash] = token.split('.');
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      
      // Token有效期15分钟
      if (now - tokenTime > 15 * 60 * 1000) {
        return new Response(JSON.stringify({ error: 'Token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 验证hash
      const tokenData = timestamp + '_' + env.JWT_SECRET;
      const encoder = new TextEncoder();
      const data = encoder.encode(tokenData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const expectedHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
      
      if (hash !== expectedHash) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // 其他API需要验证token
  if (url.pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    
    // 简单的token验证（时间戳 + 密钥哈希）
    try {
      const [timestamp, hash] = token.split('.');
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      
      // Token有效期15分钟
      if (now - tokenTime > 15 * 60 * 1000) {
        return new Response(JSON.stringify({ error: 'Token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 验证hash
      const tokenData = timestamp + '_' + env.JWT_SECRET;
      const encoder = new TextEncoder();
      const data = encoder.encode(tokenData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const expectedHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
      
      if (hash !== expectedHash) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  const response = await next();
  
  // 添加安全头到响应
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

