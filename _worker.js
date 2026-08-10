export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Si la petición es a la API de Login
    if (url.pathname === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        
        // Consulta a tu base de datos D1 (usando la variable DB)
        const { results } = await env.DB.prepare(
          "SELECT * FROM users WHERE username = ? AND password = ?"
        ).bind(username, password).all();

        if (results.length > 0) {
          return new Response(JSON.stringify({ success: true, user: results[0] }), {
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Si no es una ruta de API, deja que Cloudflare sirva los archivos estáticos (HTML/CSS)
    return env.ASSETS.fetch(request);
  }
};
