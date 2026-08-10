export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cabeceras CORS para permitir peticiones desde tu web
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- REGISTRO ---
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const { username, password } = await request.json();
        await env.DB.prepare(
          "INSERT INTO users (username, password) VALUES (?, ?)"
        ).bind(username, password).run();

        return new Response(JSON.stringify({ success: true, message: "Usuario creado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 400, 
          headers: corsHeaders 
        });
      }
    }

    // --- LOGIN ---
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const { username, password } = await request.json();
        const { results } = await env.DB.prepare(
          "SELECT * FROM users WHERE username = ? AND password = ?"
        ).bind(username, password).all();

        if (results.length > 0) {
          return new Response(JSON.stringify({ success: true, user: results[0] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos" }), { 
            status: 401, 
            headers: corsHeaders 
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    return new Response("API Mision Lunar Activa", { headers: corsHeaders });
  }
};
