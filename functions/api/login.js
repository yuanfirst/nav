export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { username, password } = await request.json();
    
    // 验证用户名和密码
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
      // 生成token
      const timestamp = Date.now();
      const tokenData = timestamp + '_' + env.JWT_SECRET;
      const encoder = new TextEncoder();
      const data = encoder.encode(tokenData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
      const token = timestamp + '.' + hash;
      
      return new Response(JSON.stringify({
        success: true,
        token: token
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid credentials'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Bad request'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

